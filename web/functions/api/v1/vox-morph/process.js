//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\vox-morph\process.js total lines 55 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * VOX MORPH - LOGIC CORE
 * Preset configuration disimpan di server (Cloudflare Worker)
 * agar tidak bisa di-scrape via Inspect Element.
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
        const requestType = formData.get('action'); // 'get_preset'

        let result = {};

        if (requestType === 'get_preset') {
            const presetName = formData.get('preset_name');

            const secretPresets = {
                'demon': { pitch: 0.6, reverb: 0.4, delay: 0.05 },
                'chipmunk': { pitch: 1.5, filter: 15000 },
                'robot': { mod_freq: 50, drive: 50 },
                'radio': { low: 3000, high: 500 }
            };

            result = secretPresets[presetName] || {};
        }

        return new Response(JSON.stringify({
            success: true,
            data: result
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), { status: 500, headers });
    }
}
