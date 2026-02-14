//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\sonic-ripper\process.js total lines 41 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * SONIC RIPPER - SERVER LOGGING
 * Mencatat statistik penggunaan (Tanpa simpan file user).
 */

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers });
    }

    try {
        const formData = await context.request.formData();
        const action = formData.get('action'); // 'extract' atau 'mute'

        return new Response(JSON.stringify({
            success: true,
            status: "LOGGED",
            action: action,
            timestamp: Date.now()
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), { status: 500, headers });
    }
}
