//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\psych\tactical.js total lines 81 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { enforceSmartTiering } from '../_tierMiddleware.js';

export async function onRequestPost(context) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    };

    try {
        const { apiKey, tier } = await enforceSmartTiering(
            context,
            'GOOGLE_GEMINI_KEY',
            'LAST_PSYCH_PROFILE'
        );

        const { text, lang } = await context.request.json();
        if (!text || text.length < 10) throw { status: 400, body: { error: "INPUT_TOO_SHORT", message: "Need more text data." } };

        const langInstruction = lang === 'id'
            ? "OUTPUT MUST BE IN INDONESIAN LANGUAGE (Bahasa Indonesia)."
            : "OUTPUT MUST BE IN ENGLISH.";

        const prompt = `
            ROLE: Elite FBI Behavioral Analyst & Human Lie Detector.
            TASK: Analyze this text sample: "${text.substring(0, 3000)}"

            OBJECTIVE: Create a deep psychological profile including Dark Triad, Lie Detection, and Power Dynamics.
            ${langInstruction}

            RETURN JSON ONLY (No Markdown):
            {
                "archetype": "Short descriptive title (e.g. The Defensive Narcissist)",
                "dark_triad": { "narcissism": 0-100, "machiavellianism": 0-100, "psychopathy": 0-100 },
                "core_drives": ["Drive 1", "Drive 2"],
                "hidden_insecurities": ["Fear 1", "Fear 2"],
                "deception_radar": {
                    "score": 0-100,
                    "verdict": "Low/Medium/High Suspicion",
                    "flags": ["Specific phrase indicating lie", "Inconsistency found"]
                },
                "power_dynamics": {
                    "target_dominance": 0-100,
                    "status": "Target is Dominant/Submissive/Neutral",
                    "suggestion": "How to break their frame"
                }
            }
        `;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const aiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!aiRes.ok) throw { status: 429, body: { error: "AI_OVERLOAD", message: "Neural Engine overloaded." } };

        const aiData = await aiRes.json();
        const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanJson = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());

        return new Response(JSON.stringify({
            success: true,
            tier: tier,
            data: cleanJson
        }), { status: 200, headers });

    } catch (err) {
        const status = err.status || 500;
        const body = err.body || { error: "SYSTEM_FAILURE", message: err.message };
        return new Response(JSON.stringify(body), { status, headers });
    }
}
