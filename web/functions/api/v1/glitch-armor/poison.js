//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\glitch-armor\poison.js total lines 66 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * GLITCH ARMOR - FREE TIER ENDPOINT
 * Logic: Bypass semua tier check, allow semua origin (CORS), terima data telemetry.
 */

export async function onRequest(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',  // Buka buat semua domain
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*', // Bolehin semua header custom
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            status: 204, // No Content
            headers: corsHeaders
        });
    }

    if (context.request.method === "POST") {
        try {
            const body = await context.request.json();


            return new Response(JSON.stringify({
                success: true,
                message: "Glitch Armor Injection Successful (Free Mode)",
                data: {
                    tier: "GUEST_UNLIMITED", // Kita kasih label keren
                    protected_size: body.size || 0,
                    timestamp: Date.now()
                }
            }), {
                status: 200, // OK
                headers: corsHeaders
            });

        } catch (err) {
            return new Response(JSON.stringify({
                success: false,
                error: "INVALID_PAYLOAD",
                message: err.message
            }), {
                status: 400, // Bad Request
                headers: corsHeaders
            });
        }
    }

    return new Response(JSON.stringify({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Use POST to inject poison."
    }), {
        status: 405,
        headers: corsHeaders
    });
}
