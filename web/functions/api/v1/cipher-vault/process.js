//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\cipher-vault\process.js total lines 49 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * CIPHER VAULT - SECURITY GATEWAY
 * Logic: Generate Crypto Parameters (Salt/IV) di server.
 * Ini bikin scraper bingung karena mereka butuh API ini buat dapet parameter enkripsi.
 * Tapi file asli user TIDAK PERNAH dikirim ke sini.
 */
export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { action } = await context.request.json();

        const serverSalt = crypto.randomUUID();
        const serverIV = crypto.randomUUID().replace(/-/g, '').substring(0, 12); // 12 bytes for GCM

        if (!action) throw new Error("Invalid Handshake");

        return new Response(JSON.stringify({
            success: true,
            message: "Secure Tunnel Established.",
            payload: {
                session_salt: serverSalt,
                session_iv: serverIV,
                timestamp: Date.now()
            }
        }), { status: 200, headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: "Handshake Failed: " + err.message
        }), { status: 500, headers: corsHeaders });
    }
}
