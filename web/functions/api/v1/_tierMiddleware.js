//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\_tierMiddleware.js total lines 126 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

const CONSTANTS = {

    ADMIN_WALLETS: [
        "0x9f655D3e73FF7347aeabe61E475102d9914C8403", // Admin 1
        "0x9f655D3e73FF7347aeabe61E475102d9914C8403",               // Admin 2 (Ganti punya lu)
        "0x9f655D3e73FF7347aeabe61E475102d9914C8403"                 // Admin 3 (Ganti punya lu)
    ],

    COOLDOWN: {
        USER: 0,
        ADMIN: 0
    }
};

function isSystemAdmin(address) {
    if (!address) return false;
    return CONSTANTS.ADMIN_WALLETS.includes(address) ||
           CONSTANTS.ADMIN_WALLETS.map(a => a.toLowerCase()).includes(address.toLowerCase());
}

/**
 * FUNGSI UTAMA: TIER GUARDIAN
 * @param {Object} context - Context dari Cloudflare Pages
 * @param {String} keyName - Nama Variable API Key (cth: 'YOUTUBE_API_KEY')
 * @param {String} limitScope - Nama Variable untuk Limit (cth: 'LAST_CHANNEL_SCAN_TS')
 */
export async function enforceSmartTiering(context, keyName, limitScope) {
    const { request, env } = context;

    const origin = request.headers.get("Origin");
    const allowedDomain = "https://flowork.cloud";

    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1") && origin !== allowedDomain) {
        throw {
            status: 403,
            body: { error: "FORBIDDEN_ORIGIN", message: "Access denied. Request stolen." }
        };
    }

    const userAddress = request.headers.get("X-User-Address");

    const isAdmin = isSystemAdmin(userAddress);

    let tier = isAdmin ? "ADMIN" : "USER";
    let waitTimeMs = isAdmin ? CONSTANTS.COOLDOWN.ADMIN : CONSTANTS.COOLDOWN.USER;

    let apiKey = null;
    let isPrivate = true; // Selalu dianggap private (milik user) atau pinjaman (buat admin)

    if (isAdmin) {
        try {
            const res = await env.DB.prepare(`
                SELECT value, addr
                FROM variables
                WHERE name = ?
                AND value IS NOT NULL
                AND value != ''
                ORDER BY ts ASC
                LIMIT 1
            `).bind(keyName).first();

            if (res?.value) {
                apiKey = res.value;
                const borrowedAddr = res.addr;

                const now = Date.now();
                await env.DB.prepare(`
                    UPDATE variables
                    SET ts = ?
                    WHERE name = ? AND addr = ?
                `).bind(now, keyName, borrowedAddr).run();

            }
        } catch(e) {
            try {
                const res = await env.DB.prepare("SELECT value FROM variables WHERE name = ? AND addr = ?")
                    .bind(keyName, userAddress.toLowerCase()).first();
                if (res?.value) apiKey = res.value;
            } catch(ex) {}
        }

    } else {
        if (userAddress) {
            try {
                const res = await env.DB.prepare("SELECT value FROM variables WHERE name = ? AND addr = ?")
                    .bind(keyName, userAddress.toLowerCase()).first();
                if (res?.value) {
                    apiKey = res.value;
                }
            } catch(e) {}
        }
    }

    if (!apiKey) {
        throw {
            status: 402, // 402 Payment Required -> Memicu Popup "Isi Bensin/Config" di Frontend
            body: {
                error: "MISSING_CONFIG",
                message: `Neural Link broken. Please inject ${keyName} in Settings to proceed.`
            }
        };
    }

    try {
        const now = Date.now();
        const effectiveAddr = userAddress || 'guest';

        if (!isAdmin && userAddress) {
             await env.DB.prepare(`
                UPDATE variables
                SET ts = ?
                WHERE name = ? AND addr = ?
            `).bind(now, keyName, userAddress.toLowerCase()).run();
        }

    } catch(e) {
    }

    return { apiKey, tier, isPrivate };
}
