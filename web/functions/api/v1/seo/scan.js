//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : functions/api/v1/seo/scan.js
// Description: Advanced SEO & AI-Readiness Scanner running on Edge.
// Checks for: Meta, Canonical, H1 Structure, JSON-LD Schema, and OG Tags.
//#######################################################################

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const body = await request.json();
    const targetUrl = body.url;

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Fetch HTML Target
    // User-Agent diset ke Googlebot agar server target tidak memblokir
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch URL. Status: ${response.status}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const html = await response.text();

    // 2. Helper Regex Functions (Edge-safe parsing)
    const getTagContent = (tag, attr, name) => {
      const regex = new RegExp(`<${tag}[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const getElementText = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const getLinkHref = (rel) => {
      const regex = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    // 3. Extract Data Points
    const title = getElementText('title');
    const description = getTagContent('meta', 'name', 'description');
    const h1 = getElementText('h1');
    const canonical = getLinkHref('canonical');
    const ogImage = getTagContent('meta', 'property', 'og:image');

    // Check JSON-LD (AI Readiness)
    const hasJsonLd = /<script type=["']application\/ld\+json["']>/.test(html);

    // Check Robots
    const robotsMeta = getTagContent('meta', 'name', 'robots');

    // Count Words (Rough estimate for Thin Content detection)
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = cleanText.split(' ').length;

    // 4. Analysis Logic & Scoring
    let score = 100;
    let issues = [];
    let passed = [];

    // --- Check Title ---
    if (!title) {
      score -= 20;
      issues.push("Missing Title Tag (Critical for SEO)");
    } else if (title.length < 10 || title.length > 70) {
      score -= 5;
      issues.push(`Title length is ${title.length} chars (Recommended: 30-60)`);
    } else {
      passed.push("Title Tag is optimized");
    }

    // --- Check Description ---
    if (!description) {
      score -= 20;
      issues.push("Missing Meta Description (Low CTR risk)");
    } else if (description.length < 50 || description.length > 160) {
      score -= 5;
      issues.push(`Description length is ${description.length} chars (Recommended: 50-160)`);
    } else {
      passed.push("Meta Description is optimized");
    }

    // --- Check H1 ---
    if (!h1) {
      score -= 10;
      issues.push("Missing H1 Tag (Structure issue)");
    } else {
      passed.push("H1 Tag present");
    }

    // --- Check Canonical (DUPLICATE CONTENT PREVENTION) ---
    if (!canonical) {
      score -= 15;
      issues.push("Missing Canonical Tag (Risk of Duplicate Content)");
    } else {
      passed.push("Canonical Tag is set");
    }

    // --- Check JSON-LD (AI READINESS) ---
    if (!hasJsonLd) {
      score -= 10;
      issues.push("No JSON-LD Schema found (AI/Rich Snippet opportunity missed)");
    } else {
      passed.push("JSON-LD Schema detected (AI Ready)");
    }

    // --- Check Social/OG ---
    if (!ogImage) {
      score -= 5;
      issues.push("Missing OG Image (Bad social sharing preview)");
    } else {
      passed.push("Social Preview Image set");
    }

    // --- Check Content Depth ---
    if (wordCount < 300) {
      score -= 10;
      issues.push(`Thin Content detected (${wordCount} words). Google prefers > 300 words.`);
    } else {
      passed.push(`Content depth good (${wordCount} words)`);
    }

    // 5. Construct Result
    const result = {
      url: targetUrl,
      scan_time: new Date().toISOString(),
      score: Math.max(0, score),
      meta: {
        title: title || 'N/A',
        description: description || 'N/A',
        h1: h1 || 'N/A',
        canonical: canonical || 'N/A',
        word_count: wordCount
      },
      analysis: {
        issues,
        passed
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Scanner Error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}