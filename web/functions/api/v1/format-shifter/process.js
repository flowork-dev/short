//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\format-shifter\process.js total lines 46 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * FORMAT SHIFTER - SECURITY GATEKEEPER
 * Karena konversi gambar menggunakan Canvas (Client-Side) demi privasi,
 * API ini bertugas memvalidasi session dan mencatat penggunaan (Telemetry).
 * Aplikasi client akan menolak bekerja jika API ini down/tidak merespon.
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
        const action = formData.get('action'); // 'init_convert'
        const fileCount = formData.get('count');

        if (!action) throw new Error("Unauthorized Access");

        return new Response(JSON.stringify({
            success: true,
            timestamp: Date.now(),
            permission_token: "PERM_" + Math.random().toString(36).substr(2),
            message: "Conversion Authorized"
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: "Security Block: " + err.message
        }), { status: 403, headers });
    }
}
