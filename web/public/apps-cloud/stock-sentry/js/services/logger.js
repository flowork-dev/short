//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\logger.js total lines 23
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';

export const Logger = {
    log(type, itemName, qty, description = '-') {
        // Kita simpan deskripsi alasan di sini
        store.logs.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            type,
            itemName,
            qty,
            description: description // <--- INI PENTING
        });

        // Batasi cuma simpan 500 log terakhir biar browser gak berat
        if (store.logs.length > 500) store.logs.pop();
    }
};