//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\wa-bridge.js total lines 47 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';

export const WhatsAppService = {
    sendInvoice(customerPhone, items, total, payment) {
        if (!customerPhone) return;

        let msg = `*INVOICE PEMBELIAN*\n`;
        msg += `------------------\n`;
        items.forEach(i => {
            msg += `${i.name} x${i.qty} = ${i.sellPrice * i.qty}\n`;
        });
        msg += `------------------\n`;
        msg += `*TOTAL: ${total}*\n`;
        msg += `BAYAR: ${payment}\n`;
        msg += `KEMBALI: ${payment - total}\n`;
        msg += `\nTerima kasih sudah belanja!`;

        this.openWA(customerPhone, msg);
    },

    orderSupplier(item) {
        const phone = prompt("Masukkan Nomor WA Supplier (628xxx):");
        if(!phone) return;

        let msg = `Halo Bos, mau restock barang ini dong:\n\n`;
        msg += `Nama: *${item.name}*\n`;
        msg += `SKU: ${item.sku}\n`;
        msg += `Sisa Stok: ${item.stock}\n`;
        msg += `\nMohon infonya. Thanks!`;

        this.openWA(phone, msg);
    },

    openWA(phone, text) {
        let cleanPhone = phone.replace(/\D/g,'');
        if(cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
};
