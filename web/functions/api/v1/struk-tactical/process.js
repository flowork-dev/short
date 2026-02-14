export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();

    // [ANTI-SCRAPE LOGIC]
    // Kita validasi dan hitung total di server
    // Biar gak ada yang inject angka sembarangan di frontend

    const items = body.items || [];
    const taxRate = parseFloat(body.taxRate) || 0;

    let subtotal = 0;
    const processedItems = items.map(item => {
      const qty = parseInt(item.qty) || 1;
      const price = parseFloat(item.price) || 0;
      const total = qty * price;
      subtotal += total;

      return {
        ...item,
        qty,
        price,
        total,
        // Format Rupiah di server biar konsisten
        formattedPrice: new Intl.NumberFormat('id-ID').format(price),
        formattedTotal: new Intl.NumberFormat('id-ID').format(total)
      };
    });

    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    return new Response(JSON.stringify({
      success: true,
      data: {
        items: processedItems,
        subtotal: subtotal,
        taxAmount: taxAmount,
        grandTotal: grandTotal,
        formattedSubtotal: new Intl.NumberFormat('id-ID').format(subtotal),
        formattedTax: new Intl.NumberFormat('id-ID').format(taxAmount),
        formattedGrandTotal: new Intl.NumberFormat('id-ID').format(grandTotal),
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}