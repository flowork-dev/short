//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\omega-link\seal.js total lines 42 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * OMEGA LINK - CHRONO SEALER
 * Server memberikan Timestamp yang valid dan 'Salt' unik.
 * Client menggunakan ini untuk membungkus pesan, sehingga waktu expiry valid dan tidak bisa di-bypass dengan mengubah jam lokal.
 */

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const formData = await context.request.formData();
        const duration = parseInt(formData.get('duration') || 5); // menit

        const now = Date.now();
        const expiry = now + (duration * 60 * 1000);

        const seed = crypto.randomUUID().split('-')[0].toUpperCase();

        return new Response(JSON.stringify({
            success: true,
            server_time: now,
            expiry_time: expiry,
            seal_seed: seed // Client wajib pakai ini sebagai prefix kunci
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
