//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\trend\analyze.js total lines 131 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { enforceSmartTiering } from '../_tierMiddleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const keyword = url.searchParams.get("q");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Address"
  };

  try {
    const { apiKey, tier } = await enforceSmartTiering(
        context,
        'YOUTUBE_API_KEY',
        'LAST_TREND_SCAN'
    );

    if (!keyword) return new Response(JSON.stringify({ error: "KEYWORD_REQUIRED" }), { status: 400, headers });

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${encodeURIComponent(keyword)}&type=video&order=date&maxResults=30&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
        const errJson = await searchRes.json();
        if (errJson.error?.errors?.[0]?.reason === 'quotaExceeded') {
            throw { status: 429, body: { error: "QUOTA_EXCEEDED", message: "Shared Key Limit Reached. Login & use your own Key." } };
        }
        throw new Error("YouTube API: " + (errJson.error?.message || searchRes.statusText));
    }

    const searchData = await searchRes.json();
    if (!searchData.items || searchData.items.length === 0) {
        return new Response(JSON.stringify({ results: [], summary: {} }), { status: 200, headers });
    }

    const videoIds = searchData.items.map(item => item.id.videoId).join(",");
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}&key=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    let totalVelocity = 0;
    let totalEngagement = 0;
    let shortCount = 0;
    let longCount = 0;
    let keywordMap = {};
    const now = new Date();

    const analyzedVideos = statsData.items.map(vid => {
        const publishedAt = new Date(vid.snippet.publishedAt);
        const ageInHours = Math.max(0.5, (now - publishedAt) / (1000 * 60 * 60));

        const views = parseInt(vid.statistics.viewCount || 0);
        const likes = parseInt(vid.statistics.likeCount || 0);
        const comments = parseInt(vid.statistics.commentCount || 0);

        const velocity = views / ageInHours;
        const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

        const duration = vid.contentDetails.duration;
        const isShort = duration.includes("M") ? (parseInt(duration.split("M")[0].replace("PT","")) < 1) : true;
        if(isShort) shortCount++; else longCount++;

        const words = vid.snippet.title.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
        words.forEach(w => {
            if(w.length > 3 && w !== keyword.toLowerCase()) {
                keywordMap[w] = (keywordMap[w] || 0) + 1;
            }
        });

        totalVelocity += velocity;
        totalEngagement += engagementRate;

        return {
            id: vid.id,
            title: vid.snippet.title,
            channel: vid.snippet.channelTitle,
            published: vid.snippet.publishedAt,
            thumb: vid.snippet.thumbnails.medium.url,
            stats: { views, likes, comments },
            velocity: velocity.toFixed(0),
            er: engagementRate.toFixed(2),
            age_hours: ageInHours.toFixed(1),
            is_short: isShort
        };
    });

    analyzedVideos.sort((a, b) => b.velocity - a.velocity);

    const avgVelocity = totalVelocity / analyzedVideos.length;

    let signal = "NEUTRAL";
    let signalColor = "grey";
    if (avgVelocity > 1000) { signal = "VIRAL (STRONG BUY)"; signalColor = "green"; }
    else if (avgVelocity > 200) { signal = "RISING (BUY)"; signalColor = "cyan"; }
    else if (avgVelocity < 20) { signal = "DEAD (SELL)"; signalColor = "red"; }

    const topKeywords = Object.entries(keywordMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(k => k[0]);

    const summary = {
        keyword: keyword,
        sample_size: analyzedVideos.length,
        avg_velocity: avgVelocity.toFixed(0) + " v/h",
        avg_engagement: (totalEngagement / analyzedVideos.length).toFixed(2) + "%",
        market_signal: signal,
        signal_color: signalColor,
        best_format: shortCount > longCount ? "SHORTS" : "LONG-FORM",
        winning_keywords: topKeywords
    };

    return new Response(JSON.stringify({
        success: true,
        tier: tier,
        summary: summary,
        data: analyzedVideos
    }), { status: 200, headers });

  } catch (err) {
    const status = err.status || 500;
    const body = err.body || { error: "SYSTEM_FAILURE", message: err.message };
    return new Response(JSON.stringify(body), { status, headers });
  }
}
