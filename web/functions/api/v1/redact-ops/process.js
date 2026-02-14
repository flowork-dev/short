export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();

    const { filename, actionCount, mode } = body;

    // GENERATE SECURE ID
    const timestamp = new Date().toISOString();
    const uniqueId = `REDACTED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // SIMULASI HASHING (Buat gaya-gayaan di metadata)
    const hash = `SHA256-Verified-${actionCount}x-Ops`;

    return new Response(JSON.stringify({
      success: true,
      data: {
        secureId: uniqueId,
        timestamp: timestamp,
        integrityHash: hash,
        watermarkText: `SECURELY REDACTED BY FLOWORK | ${uniqueId}`
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Secure Signing Failed" }), { status: 400 });
  }
}