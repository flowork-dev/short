//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\shard-x\process.js total lines 47 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * SHARD X - SERVER SIDE PROCESSOR
 * Full CORS Enabled. No Tier Check (Free Mode).
 */
export async function onRequest(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',  // Buka gerbang buat semua domain
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*', // Terima semua header
        'Access-Control-Max-Age': '86400',
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    if (context.request.method === "POST") {
        return new Response(JSON.stringify({
            success: true,
            message: "Shard X Engine Active. Encryption handled client-side for Zero-Knowledge privacy.",
            timestamp: Date.now()
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    });
}
