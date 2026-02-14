//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\marketplace\list.js total lines 60 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const type = url.searchParams.get('type'); // 'preset', 'module', dll
  const author = url.searchParams.get('author');
  const limit = 50;

  const cacheKey = new URL(request.url);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (response) {
      return response;
  }

  try {
    let sql = "SELECT * FROM marketplace WHERE 1=1";
    const params = [];

    if (type && type !== 'all') {
        sql += " AND type = ?";
        params.push(type);
    }
    if (author) {
        sql += " AND author = ?";
        params.push(author.toLowerCase());
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const stmt = env.DB.prepare(sql).bind(...params);
    const { results } = await stmt.all();

    response = new Response(JSON.stringify(results || []), {
      status: 200,
      headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300" // Cache for 5 minutes (300 seconds)
      }
    });

    context.waitUntil(cache.put(cacheKey, response.clone())); // Store in cache asynchronously

    return response;

  } catch (e) {
    if (e.message && e.message.includes("no such table")) {
        return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
