//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\variables\[name].js total lines 107 
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

    if (!addr) return { success: false, reason: "Header Missing: X-User-Address" };
    if (!sig) return { success: false, reason: "Header Missing: X-Signature" };
    if (!msg) return { success: false, reason: "Header Missing: X-Signed-Message" };

    const parts = msg.split('|');
    const ts = parseInt(parts[parts.length - 1].trim());
    const now = Date.now() / 1000;

    if (isNaN(ts) || Math.abs(now - ts) > 600) {
        return { success: false, reason: `Timestamp Expired. Server: ${now}, Msg: ${ts}` };
    }

    const recovered = ethers.verifyMessage(msg, sig);
    if (recovered.toLowerCase() !== addr.toLowerCase()) {
        return { success: false, reason: `Signature Mismatch` };
    }

    return { success: true, addr: addr.toLowerCase() };
  } catch (e) {
    return { success: false, reason: `Verify Exception: ${e.message}` };
  }
}

export async function onRequest(context) {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const authResult = await verify(request);
  if (!authResult.success) {
    return new Response(JSON.stringify({
        error: "Unauthorized",
        debug_reason: authResult.reason
    }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const userAddr = authResult.addr;
  const varName = decodeURIComponent(params.name);

  try {
    if (!env.DB) throw new Error("D1 'DB' binding not found.");

    if (request.method === "PUT") {
      const body = await request.json();
      const { value, is_enabled, is_secret, mode } = body;
      const dbValue = (typeof value === 'object') ? JSON.stringify(value) : String(value || '');

      await env.DB.prepare(`
        INSERT INTO variables (addr, name, value, is_enabled, is_secret, mode, ts)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(addr, name) DO UPDATE SET
          value = excluded.value,
          is_enabled = excluded.is_enabled,
          is_secret = excluded.is_secret,
          mode = excluded.mode,
          ts = excluded.ts
      `).bind(
        userAddr, varName, dbValue,
        is_enabled ? 1 : 0, is_secret ? 1 : 0, mode || 'single', Date.now()
      ).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (request.method === "DELETE") {
      await env.DB.prepare("DELETE FROM variables WHERE addr = ? AND name = ?")
        .bind(userAddr, varName).run();
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
