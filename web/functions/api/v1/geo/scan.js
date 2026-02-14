//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\geo\scan.js total lines 116
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { enforceSmartTiering } from '../_tierMiddleware.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const loc = url.searchParams.get("loc");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Address"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    if (!query || !loc) {
        return new Response(JSON.stringify({ error: "INVALID_INPUT", message: "Query dan Lokasi harus diisi." }), { status: 400, headers });
    }

    const { apiKey, tier } = await enforceSmartTiering(
        context,
        'GOOGLE_MAPS_KEY',       // Target Variable
        'LAST_GEO_SCAN_TS'       // Rate Limit Tracker
    );

    const gUrl = `https://places.googleapis.com/v1/places:searchText`;
    const fieldMask = [
        "places.displayName", "places.formattedAddress", "places.rating", "places.userRatingCount",
        "places.regularOpeningHours", "places.types", "places.location", "places.internationalPhoneNumber",
        "places.websiteUri", "places.priceLevel", "places.paymentOptions", "places.parkingOptions",
        "nextPageToken"
    ].join(",");

    let allPlaces = [];
    let nextPageToken = "";
    let pageCount = 0;

    const MAX_PAGES = (tier === 'guest') ? 1 : 3;

    do {
        const payload = {
            textQuery: `${query} in ${loc}`,
            pageSize: 20 // Max Google limit per page
        };

        if (nextPageToken) {
            payload.pageToken = nextPageToken;
        }

        const gRes = await fetch(gUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': fieldMask
            },
            body: JSON.stringify(payload)
        });

        const gData = await gRes.json();

        if (gData.error) {
            if (gData.error.code === 429 || gData.error.status === 'RESOURCE_EXHAUSTED') {
                throw { status: 429, message: "Provider Quota Exceeded (Google Maps)" };
            }
            throw new Error(`Vector Engine Error: ${gData.error.message}`);
        }

        if (gData.places) {
            allPlaces = allPlaces.concat(gData.places);
        }

        nextPageToken = gData.nextPageToken;
        pageCount++;

    } while (nextPageToken && pageCount < MAX_PAGES);

    const cleanResults = allPlaces.map(p => ({
        name: p.displayName?.text || "Unknown Target",
        address: p.formattedAddress || "No Address Data",
        rating: p.rating || "N/A",
        user_ratings_total: p.userRatingCount || 0,
        open: p.regularOpeningHours?.openNow,
        types: p.types,
        geo: { lat: p.location?.latitude, lng: p.location?.longitude },
        phone: p.internationalPhoneNumber || null,
        website: p.websiteUri || null,
        price: p.priceLevel || null,
        payment: p.paymentOptions || {},
        parking: p.parkingOptions || {}
    }));

    return new Response(JSON.stringify({
        results: cleanResults,
        total_scanned: cleanResults.length,
        tier_used: tier,
        status: "OK"
    }), { status: 200, headers });

  } catch (err) {
    const status = err.status || 500;
    const message = err.body?.message || err.message || "System Failure";
    return new Response(JSON.stringify({ error: message, message: message }), { status: status, headers });
  }
}
