//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : functions/api/v1/user/preferences.js
//#######################################################################

import { ethers } from 'ethers';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-User-Address, X-Signature, X-Signed-Message, X-Flowork-Engine-ID, X-Payload-Version, Authorization",
};

async function verify(req) {
  try {
    const addr = req.headers.get('X-User-Address');
    const sig = req.headers.get('X-Signature');
    const msg = req.headers.get('X-Signed-Message');
    if (!addr || !sig || !msg) return null;

    // Simple verification
    const recovered = ethers.verifyMessage(msg, sig);
    return (recovered.toLowerCase() === addr.toLowerCase()) ? addr.toLowerCase() : null;
  } catch (e) { return null; }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const userAddr = await verify(request);
  if (!userAddr) {
    // Return empty prefs if auth fails (don't block UI)
    return new Response(JSON.stringify({}), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    if (!env.DB) throw new Error("DB binding missing");

    if (request.method === "GET") {
      const res = await env.DB.prepare("SELECT preferences FROM user_profiles WHERE addr = ?").bind(userAddr).first();
      const prefs = res && res.preferences ? JSON.parse(res.preferences) : {};
      return new Response(JSON.stringify(prefs), {
          status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const prefsStr = JSON.stringify(body);

      // Upsert preferences
      await env.DB.prepare(`
        INSERT INTO user_profiles (addr, preferences, last_seen) VALUES (?1, ?2, ?3)
        ON CONFLICT(addr) DO UPDATE SET preferences = ?2, last_seen = ?3
      `).bind(userAddr, prefsStr, Date.now()).run();

      return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  } catch (e) {
    // Fallback: return empty object on error to prevent UI crash
    return new Response(JSON.stringify({ error: e.message }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}