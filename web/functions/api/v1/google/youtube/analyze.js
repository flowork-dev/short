//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\google\youtube\analyze.js total lines 159 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { enforceSmartTiering } from '../../_tierMiddleware.js';

export async function onRequestGet(context) {
    const { request } = context;
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Address"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const { apiKey, tier, isPrivate } = await enforceSmartTiering(
            context,
            'YOUTUBE_API_KEY',
            'LAST_GENERATE_TS'
        );

        const urlParams = new URL(request.url).searchParams;
        const videoUrl = urlParams.get("url");

        if (!videoUrl) return new Response(JSON.stringify({ error: "MISSING_URL" }), { status: 400, headers });

        const vidMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        const videoId = vidMatch ? vidMatch[1] : null;

        if (!videoId) return new Response(JSON.stringify({ error: "INVALID_URL", message: "Link-nya ga valid, Bestie." }), { status: 400, headers });

        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,topicDetails&id=${videoId}&key=${apiKey}`);

        if (!vidRes.ok) {
            const errJson = await vidRes.json();
            if (errJson.error?.errors?.[0]?.reason === 'quotaExceeded') {
                 throw { status: 429, body: { error: "QUOTA_EXCEEDED", message: "Limit Harian Abis. Pake API Key sendiri dong." } };
            }
            throw new Error(`YouTube API Error: ${errJson.error?.message || vidRes.statusText}`);
        }

        const vidJson = await vidRes.json();
        if (!vidJson.items?.length) return new Response(JSON.stringify({ error: "VIDEO_NOT_FOUND" }), { status: 404, headers });
        const vidItem = vidJson.items[0];

        const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${vidItem.snippet.channelId}&key=${apiKey}`);
        const chJson = await chRes.json();
        const chItem = chJson.items[0];

        const commRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&order=relevance&key=${apiKey}`);
        const commJson = await commRes.json();
        const comments = commJson.items || [];


        const channelCreated = new Date(chItem.snippet.publishedAt);
        const diffWeeks = Math.max(1, Math.ceil(Math.abs(new Date() - channelCreated) / (1000 * 60 * 60 * 24 * 7)));
        const velocity = (parseInt(chItem.statistics.videoCount)/diffWeeks).toFixed(1);

        const categories = {
            '1': 'Film & Animation', '2': 'Autos & Vehicles', '10': 'Music', '15': 'Pets & Animals', '17': 'Sports',
            '18': 'Short Movies', '19': 'Travel & Events', '20': 'Gaming', '21': 'Videoblogging', '22': 'People & Blogs',
            '23': 'Comedy', '24': 'Entertainment', '25': 'News & Politics', '26': 'Howto & Style', '27': 'Education',
            '28': 'Science & Technology', '29': 'Nonprofits & Activism', '30': 'Movies', '31': 'Anime/Animation',
            '32': 'Action/Adventure', '33': 'Classics', '34': 'Comedy', '35': 'Documentary', '36': 'Drama',
            '37': 'Family', '38': 'Foreign', '39': 'Horror', '40': 'Sci-Fi/Fantasy', '41': 'Thriller', '42': 'Shorts'
        };
        const catName = categories[vidItem.snippet.categoryId] || "Unknown Category";

        const linkPatterns = [
            { type: "Affiliate", regex: /(amzn\.to|shopee\.co|tokopedia\.link|lazada\.co|blibli\.com)/i },
            { type: "Donation", regex: /(saweria\.co|ko-fi\.com|patreon\.com|paypal\.me|trakteer\.id)/i },
            { type: "Social", regex: /(instagram\.com|tiktok\.com|twitter\.com|facebook\.com|linkedin\.com)/i },
            { type: "Course", regex: /(gumroad\.com|udemy\.com|notion\.so)/i }
        ];
        const urls = [...new Set((vidItem.snippet.description || "").match(/(https?:\/\/[^\s]+)/g) || [])];
        const incomeSources = [];
        urls.forEach(u => { for(let p of linkPatterns) if(p.regex.test(u)) { incomeSources.push({type:p.type, url:u}); break; } });

        const momentsMap = {};
        const tsRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
        comments.forEach(c => {
            const txt = c.snippet.topLevelComment.snippet.textDisplay;
            const m = txt.match(tsRegex);
            if(m) m.forEach(t => momentsMap[t] = (momentsMap[t] || 0)+1);
        });
        const goldenMoments = Object.entries(momentsMap)
            .sort((a,b)=>b[1]-a[1])
            .slice(0,5)
            .map(x=>({timestamp:x[0], mentions:x[1]}));

        const vViews = parseInt(vidItem.statistics.viewCount||0);
        const cViews = parseInt(chItem.statistics.viewCount||0) * 0.03;

        let seo = 0; const aud = [];
        const tLen = vidItem.snippet.title.length;
        const dLen = vidItem.snippet.description.length;
        const tags = vidItem.snippet.tags || [];
        const isHD = vidItem.contentDetails.definition === 'hd';
        const hasCC = vidItem.contentDetails.caption === 'true';

        if(tLen>=30 && tLen<=70) { seo+=20; aud.push({msg:"Title Length Perfect", pass:true}); } else aud.push({msg:"Title Length Bad", pass:false});
        if(dLen>300) { seo+=20; aud.push({msg:"Description Rich", pass:true}); } else aud.push({msg:"Description Thin", pass:false});
        if(tags.length>=10) { seo+=20; aud.push({msg:`Tags Active (${tags.length})`, pass:true}); } else aud.push({msg:"Tags Low/Missing", pass:false});
        if(isHD) { seo+=20; aud.push({msg:"High Definition (HD)", pass:true}); } else aud.push({msg:"Standard Definition (SD)", pass:false});
        if(hasCC) { seo+=20; aud.push({msg:"Closed Captions (CC)", pass:true}); } else aud.push({msg:"No Captions", pass:false});

        return new Response(JSON.stringify({
            success: true,
            tier: tier,
            unlimited: isPrivate,
            video: {
                id: videoId,
                stats: vidItem.statistics,
                tags: tags,
                thumbnails: vidItem.snippet.thumbnails,
                snippet: {
                    title: vidItem.snippet.title,
                    publishedAt: vidItem.snippet.publishedAt,
                    description: vidItem.snippet.description,
                    categoryId: vidItem.snippet.categoryId,
                    categoryName: catName,
                    defaultAudioLanguage: vidItem.snippet.defaultAudioLanguage,
                    liveBroadcastContent: vidItem.snippet.liveBroadcastContent
                },
                details: {
                    licensed: vidItem.contentDetails.licensedContent,
                    definition: vidItem.contentDetails.definition,
                    duration: vidItem.contentDetails.duration,
                    caption: vidItem.contentDetails.caption,
                    dimension: vidItem.contentDetails.dimension
                }
            },
            channel: {
                id: vidItem.snippet.channelId,
                title: chItem.snippet.title,
                thumbnail: chItem.snippet.thumbnails.default.url,
                stats: chItem.statistics,
                country: chItem.snippet.country || "GLOBAL",
                velocity: velocity
            },
            revenue: {
                video: `$${Math.floor(vViews/1000*0.5).toLocaleString()} - $${Math.floor(vViews/1000*4).toLocaleString()}`,
                channel: `$${Math.floor(cViews/1000*0.5).toLocaleString()} - $${Math.floor(cViews/1000*4).toLocaleString()}`
            },
            intel: { income: incomeSources, moments: goldenMoments },
            seo: { score: seo, audit: aud }
        }), { status: 200, headers });

    } catch (err) {
        const status = err.status || 500;
        const body = err.body || { error: "ENGINE_FAILURE", message: err.message };
        return new Response(JSON.stringify(body), { status, headers });
    }
}
