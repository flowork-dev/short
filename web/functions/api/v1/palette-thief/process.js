export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    let targetUrl = body.url;

    if (!targetUrl) throw new Error("URL Target Kosong");
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    // 1. FETCH TARGET (Pura-pura jadi Browser Chrome biar gak diblok)
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`Gagal akses target: ${response.status}`);
    const htmlText = await response.text();

    // 2. EXTRACTION LOGIC (REGEX MINING)
    // Cari Hex Codes (3 atau 6 digit)
    const hexRegex = /#([0-9a-fA-F]{3}){1,2}\b/g;
    // Cari RGB/RGBA (Optional, buat V2 bisa dikembangin)
    const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/g;

    const hexMatches = htmlText.match(hexRegex) || [];

    // 3. CLEANING & SORTING
    // Hapus duplikat pake Set, lalu jadiin Array
    const uniqueColors = [...new Set(hexMatches.map(c => c.toLowerCase()))];

    // Limit biar gak overload (Max 50 warna dominan)
    const finalPalette = uniqueColors.slice(0, 50);

    return new Response(JSON.stringify({
      success: true,
      data: {
        url: targetUrl,
        totalFound: uniqueColors.length,
        colors: finalPalette,
        timestamp: new Date().toISOString()
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Target Website Protected / Not Found"
    }), { status: 400 });
  }
}