//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\vision\analyze.js total lines 103 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { enforceSmartTiering } from '../_tierMiddleware.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Address"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const { apiKey, tier, isPrivate } = await enforceSmartTiering(
            context,
            'GOOGLE_VISION_KEY',
            'LAST_VISION_SCAN'
        );

        const body = await request.json();
        if (!body.image) {
            return new Response(JSON.stringify({ error: "BAD_REQUEST", message: "Image data missing." }), { status: 400, headers });
        }

        const googlePayload = {
            requests: [{
                image: { content: body.image },
                features: [
                    { type: "TEXT_DETECTION" },
                    { type: "FACE_DETECTION", maxResults: 5 },
                    { type: "WEB_DETECTION", maxResults: 30 }, // Naikkan limit deteksi web
                    { type: "OBJECT_LOCALIZATION", maxResults: 10 },
                    { type: "SAFE_SEARCH_DETECTION" },
                    { type: "IMAGE_PROPERTIES" }
                ]
            }]
        };

        const gRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            body: JSON.stringify(googlePayload)
        });

        if (!gRes.ok) {
            const errJson = await gRes.json();
            if (gRes.status === 429 || errJson.error?.code === 429 || errJson.error?.message?.includes('quota')) {
                 throw { status: 429, body: { error: "QUOTA_EXCEEDED", message: "Shared Key Quota Limit. Please login or upgrade." } };
            }
            throw new Error(`Google API Error: ${errJson.error?.message || gRes.statusText}`);
        }

        const gData = await gRes.json();
        const res = gData.responses?.[0] || {};

        const output = {
            ocr: {
                text: res.fullTextAnnotation?.text || null,
                language: res.textAnnotations?.[0]?.locale || "Unknown"
            },
            faces: res.faceAnnotations?.map(f => ({
                joy: f.joyLikelihood,
                anger: f.angerLikelihood,
                confidence: (f.detectionConfidence * 100).toFixed(1)
            })) || [],
            web: {
                guess: res.webDetection?.bestGuessLabels?.[0]?.label || "Unknown Origin",

                entities: res.webDetection?.webEntities?.slice(0, 15).map(e => ({
                    name: e.description,
                    score: (e.score * 100).toFixed(0)
                })) || [],

                pages: res.webDetection?.pagesWithMatchingImages?.slice(0, 10).map(p => ({
                    title: p.pageTitle || "Untitled Page",
                    url: p.url
                })) || [],

                similar: res.webDetection?.visuallySimilarImages?.slice(0, 5).map(img => img.url) || []
            },
            safeSearch: res.safeSearchAnnotation || {}
        };

        return new Response(JSON.stringify({
            success: true,
            tier: tier,
            unlimited: isPrivate,
            data: output
        }), { status: 200, headers });

    } catch (err) {
        const status = err.status || 500;
        const body = err.body || { error: "SYSTEM_FAILURE", message: err.message };
        return new Response(JSON.stringify(body), { status, headers });
    }
}
