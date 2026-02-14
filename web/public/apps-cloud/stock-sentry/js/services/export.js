//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\export.js total lines 27 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';

export const ExportService = {
    downloadExcel() {
        if (!window.XLSX) return alert("Excel Library belum siap!");
        const wb = XLSX.utils.book_new();

        const invData = store.inventory.map(i => ({
            SKU: i.sku, Name: i.name, Type: i.type || 'single',
            Stock: i.stock, Buy: i.buyPrice, Sell: i.sellPrice
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invData), "Stok");

        const logData = store.logs.map(l => ({
            Date: l.date, Type: l.type, Item: l.itemName, Qty: l.qty, Note: l.desc
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logData), "History");

        XLSX.writeFile(wb, `StockSentry_Report_${Date.now()}.xlsx`);
    }
};
