//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\google\youtube\channel.js total lines 48 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { enforceSmartTiering } from '../../_tierMiddleware.js';

export async function onRequestGet(context) {
    const { request } = context;
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, X-User-Address" };
    if (request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const { apiKey, tier, isPrivate } = await enforceSmartTiering(context, 'YOUTUBE_API_KEY', 'LAST_CHANNEL_SCAN_TS');
        const urlParams = new URL(request.url).searchParams;
        const channelId = urlParams.get("id");

        if (!channelId) return new Response(JSON.stringify({ error: "MISSING_ID", message: "Channel ID required" }), { status: 400, headers });

        const googleRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`);
        if (!googleRes.ok) {
             const errJson = await googleRes.json();
             if (errJson.error?.errors?.[0]?.reason === 'quotaExceeded') throw { status: 429, body: { error: "QUOTA_EXCEEDED", message: "Shared Key Quota Limit." } };
            throw new Error(`Google API Error: ${errJson.error?.message || googleRes.statusText}`);
        }

        const googleData = await googleRes.json();
        if (!googleData.items || googleData.items.length === 0) return new Response(JSON.stringify({ error: "CHANNEL_NOT_FOUND" }), { status: 404, headers });

        const item = googleData.items[0];
        const uploadsPlaylist = item.contentDetails?.relatedPlaylists?.uploads;
        let latestVideoId = null;
        if (uploadsPlaylist) {
            try {
                const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=1&key=${apiKey}`);
                const plData = await plRes.json();
                latestVideoId = plData.items?.[0]?.snippet?.resourceId?.videoId;
            } catch (e) { }
        }

        return new Response(JSON.stringify({ success: true, tier, unlimited: isPrivate, stats: item.statistics, latestVideoId }), { status: 200, headers });
    } catch (err) {
        const status = err.status || 500;
        const body = err.body || { error: "SYSTEM_FAILURE", message: err.message };
        return new Response(JSON.stringify(body), { status, headers });
    }
}
