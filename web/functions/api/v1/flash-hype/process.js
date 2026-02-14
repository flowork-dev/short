//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\flash-hype\process.js total lines 50 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * FLASH HYPE - SERVER SIDE PROCESSOR
 * Fix: Auto-Delete with Safety Buffer
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
        const input = await context.request.json();
        const { productName, originalPrice, promoPrice, endTime, image, links, message } = input;

        const endMs = Number(endTime);
        const nowMs = Date.now();

        let ttlSeconds = Math.floor((endMs - nowMs) / 1000);

        ttlSeconds += 1800;

        if (ttlSeconds < 60) ttlSeconds = 60;

        const id = crypto.randomUUID().split('-')[0];

        const payload = JSON.stringify({
            productName, originalPrice, promoPrice,
            endTime: endMs,
            image, links, message
        });

        await context.env.GHOST_VAULT.put(id, payload, { expirationTtl: ttlSeconds });

        return new Response(JSON.stringify({ success: true, id: id }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
