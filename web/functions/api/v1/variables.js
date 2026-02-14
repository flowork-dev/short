//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\variables.js total lines 86 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { ethers } from 'ethers';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-User-Address, X-Signature, X-Signed-Message, X-Flowork-Engine-ID, X-Payload-Version, Authorization",
};

async function verify(req) {
  try {
    const addr = req.headers.get('X-User-Address');
    const sig = req.headers.get('X-Signature');
    const msg = req.headers.get('X-Signed-Message');
    if (!addr || !sig || !msg) return null;

    const parts = msg.split('|');
    const ts = parseInt(parts[parts.length - 1].trim());
    if (isNaN(ts) || Math.abs(Date.now()/1000 - ts) > 600) return null;

    const recovered = ethers.verifyMessage(msg, sig);
    return (recovered.toLowerCase() === addr.toLowerCase()) ? addr.toLowerCase() : null;
  } catch (e) { return null; }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' not found." }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const userAddr = await verify(request);
  if (!userAddr) {
    return new Response(JSON.stringify({ error: "Unauthorized Signature" }), {
      status: 401, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    if (request.method === "GET") {
      const result = await env.DB.prepare("SELECT * FROM variables WHERE addr = ? ORDER BY ts DESC")
        .bind(userAddr)
        .all();
      const rows = result.results || [];

      const formatted = rows.map(v => ({
        ...v,
        value: (() => {
          try {
             return (typeof v.value === 'string' && (v.value.startsWith('[') || v.value.startsWith('{')))
                ? JSON.parse(v.value)
                : v.value;
          } catch (e) { return v.value; }
        })(),
        is_enabled: v.is_enabled === 1,
        is_secret: v.is_secret === 1
      }));

      return new Response(JSON.stringify(formatted), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(null, { status: 405, headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({
      error: "D1_QUERY_ERROR",
      message: e.message
    }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
