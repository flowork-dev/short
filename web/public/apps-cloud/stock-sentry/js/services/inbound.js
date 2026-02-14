//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\inbound.js total lines 36 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';
import { Logger } from './logger.js';

export const InboundService = {
    createPO(supplier, items) {
        if (items.length === 0) return false;

        store.purchaseOrders.unshift({
            id: Date.now(),
            poNumber: `PO-${Date.now().toString().slice(-6)}`,
            supplier: supplier,
            date: new Date().toISOString(),
            status: 'PENDING',
            items: JSON.parse(JSON.stringify(items)) // Deep copy biar aman
        });
        return true;
    },

    receivePO(po) {
        po.items.forEach(poItem => {
            const invItem = store.inventory.find(i => i.id === poItem.id);
            if (invItem) {
                invItem.stock += parseInt(poItem.qty);
                Logger.log('IN', invItem.name, poItem.qty, `PO Received: ${po.poNumber}`);
            }
        });
        po.status = 'RECEIVED';
        po.receivedDate = new Date().toISOString();
    }
};
