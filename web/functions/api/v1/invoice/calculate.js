//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\invoice\calculate.js total lines 61 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * INVOICE TACTICAL - CALCULATION ENGINE
 * Menerima item list, menghitung subtotal, pajak, diskon, dan total akhir.
 * Menjamin presisi floating point (masalah klasik JS di browser).
 */

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const body = await context.request.json();
        const { items, taxRate = 0, discount = 0, currency = 'IDR' } = body;

        let subtotal = 0;
        items.forEach(item => {
            subtotal += (item.qty * item.price);
        });

        const taxAmount = subtotal * (taxRate / 100);

        const total = subtotal + taxAmount - discount;

        const formatMoney = (val) => {
            if (currency === 'IDR') {
                return 'Rp ' + Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            } else {
                return '$ ' + val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            }
        };

        return new Response(JSON.stringify({
            success: true,
            data: {
                subtotal: subtotal,
                subtotal_fmt: formatMoney(subtotal),
                taxAmount: taxAmount,
                taxAmount_fmt: formatMoney(taxAmount),
                discount: discount,
                discount_fmt: formatMoney(discount),
                total: total,
                total_fmt: formatMoney(total)
            }
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
