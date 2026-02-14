//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\trend\strategy.js total lines 77 
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
    const { apiKey, tier } = await enforceSmartTiering(
        context,
        'GOOGLE_GEMINI_KEY',
        'LAST_STRATEGY_GEN'
    );

    const body = await request.json();
    const { keyword, top_titles } = body;
    if (!keyword || !top_titles) return new Response(JSON.stringify({ error: "INVALID_DATA" }), { status: 400, headers });

    const targetModel = 'models/gemini-2.0-flash';
    const prompt = `
    Role: YouTube Strategist.
    Context: Niche "${keyword}".
    Viral Titles:
    ${top_titles.map(t => "- " + t).join("\n")}

    Task: Analyze audience psychology and create a blueprint.
    Output JSON Only:
    {
        "psychology_analysis": "Why these are viral (max 1 sentence)",
        "killer_hooks": ["Hook 1", "Hook 2", "Hook 3"],
        "thumbnail_concept": "Visual description",
        "seo_tags": ["tag1", "tag2", "tag3"]
    }
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const gRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!gRes.ok) {
        const errJson = await gRes.json();
        throw { status: gRes.status, body: { error: "AI_ERROR", message: errJson.error?.message || "Gemini Failed" } };
    }

    const gData = await gRes.json();
    const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("AI returned empty response");

    const jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const strategy = JSON.parse(jsonStr);

    return new Response(JSON.stringify(strategy), { status: 200, headers });

  } catch (err) {
    const status = err.status || 500;
    const body = err.body || { error: "SYSTEM_FAILURE", message: err.message };
    return new Response(JSON.stringify(body), { status, headers });
  }
}
