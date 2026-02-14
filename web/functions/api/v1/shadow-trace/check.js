//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\shadow-trace\check.js total lines 73 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * SHADOW TRACE - ENGINE V3.4 (SERVER-SIDE)
 * Logic hidden from frontend to prevent HTTrack scraping.
 */

export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    const platform = searchParams.get('platform');
    const username = searchParams.get('username');

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (!platform || !username) {
        return new Response(JSON.stringify({ error: "BAD_REQUEST" }), { status: 400, headers });
    }

    try {
        const config = {
            'Instagram': `https://www.instagram.com/${username}/`,
            'TikTok': `https://www.tiktok.com/@${username}`,
            'Twitter': `https://twitter.com/${username}`,
            'GitHub': `https://api.github.com/users/${username}`,
            'YouTube': `https://www.youtube.com/@${username}`,
            'Reddit': `https://www.reddit.com/user/${username}`,
            'Pinterest': `https://www.pinterest.com/${username}`,
            'Snapchat': `https://www.snapchat.com/add/${username}`
        };

        const url = config[platform];
        if (!url) return new Response(JSON.stringify({ exists: false }), { status: 200, headers });

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        /**
         * Detection Logic:
         * 200: Public Profile Found
         * 301/302: Path Exists (Redirected to login/other)
         * 403: Path exists but forbidden (Private Profile)
         */
        let isExists = false;
        if (response.status === 200 || response.status === 301 || response.status === 302 || response.status === 403) {
            isExists = true;
        }

        if (platform === 'GitHub' && response.status === 404) isExists = false;

        return new Response(JSON.stringify({
            exists: isExists,
            status: response.status,
            platform: platform
        }), { status: 200, headers });

    } catch (e) {
        return new Response(JSON.stringify({ error: "NETWORK_FAILURE" }), { status: 500, headers });
    }
}
