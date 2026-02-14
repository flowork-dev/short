// WEBSITE https://flowork.cloud
// File NAME: functions/api/v1/stock-sentry/process.js

// Import Middleware Tiering
import { enforceSmartTiering } from '../_tierMiddleware.js';

// Standar Header CORS [cite: 1928-1930]
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Address"
};

export async function onRequest(context) {
    const { request } = context;

    // Handle Preflight Request
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 1. Tier & Auth Check (Standar Flowork) [cite: 1938]
        // Mengamankan API agar hanya bisa diakses user yang valid
        const { apikey, tier } = await enforceSmartTiering(
            context,
            'GOOGLE_DRIVE_KEY', // Target Variable
            'LAST_STOCK_UPDATE' // Rate Limit Scope
        );

        // 2. Parse Input (Jika ada input dari frontend)
        const url = new URL(request.url);
        // Contoh logika ambil data query
        // const query = url.searchParams.get("q");

        // 3. Logika Utama (Simulasi atau Real implementation di sini)
        // Disini tempat kode asli Anda (drive-adapter.js atau flowork-core.js logic)
        // ...

        const resultData = {
            status: "OK",
            tier_used: tier,
            message: "Stock Sentry Logic executed successfully."
        };

        // 4. Return JSON Response [cite: 2027]
        return new Response(JSON.stringify(resultData), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });

    } catch (err) {
        // Error Handling Standard [cite: 2028-2032]
        const status = err.status || 500;
        const message = err.body?.message || err.message || "System Failure";

        return new Response(JSON.stringify({
            error: message,
            message: message
        }), {
            status: status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }
}