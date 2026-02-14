//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\returns.js total lines 32 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';
import { Logger } from './logger.js';

export const ReturnService = {
    processReturn(item, qty, type, reason) {
        const invItem = store.inventory.find(i => i.id === item.id);
        if (!invItem) return false;

        const quantity = parseInt(qty);

        if (type === 'CUSTOMER_RETURN') {
            invItem.stock += quantity;
            Logger.log('IN', invItem.name, quantity, `Retur Customer: ${reason}`);
        }
        else if (type === 'SUPPLIER_RETURN') {
            if (invItem.stock < quantity) {
                alert("Stok tidak cukup untuk retur ke supplier!");
                return false;
            }
            invItem.stock -= quantity;
            Logger.log('OUT', invItem.name, -quantity, `Retur Supplier: ${reason}`);
        }

        return true;
    }
};
