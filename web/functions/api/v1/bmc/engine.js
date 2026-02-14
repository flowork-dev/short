//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\bmc\engine.js total lines 44 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * BUSINESS CANVAS - SYNC NODE
 * Menerima payload JSON dari client, validasi, dan simpan (simulasi).
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
        const data = await context.request.json();

        const requiredKeys = ['kp', 'ka', 'kr', 'vp', 'cr', 'ch', 'cs', 'cst', 'rs'];
        const missing = requiredKeys.filter(k => !data.hasOwnProperty(k));

        if (missing.length > 0) {
            throw new Error(`Data korup. Kehilangan sektor: ${missing.join(', ')}`);
        }

        let totalCards = 0;
        Object.values(data).forEach(arr => totalCards += arr.length);

        return new Response(JSON.stringify({
            success: true,
            message: `Berhasil sinkronisasi ${totalCards} strategi ke Neural Core.`,
            timestamp: new Date().toISOString()
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
