//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\transfer.js total lines 49 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';
import { Logger } from './logger.js';

export const TransferService = {
    moveStock(sourceItem, targetLocation, qty, note) {
        const quantity = parseInt(qty);

        if (sourceItem.stock < quantity) {
            alert(`Stok di ${sourceItem.location} tidak cukup! Sisa: ${sourceItem.stock}`);
            return false;
        }

        if (sourceItem.location === targetLocation) {
            alert("Lokasi asal dan tujuan tidak boleh sama!");
            return false;
        }

        sourceItem.stock -= quantity;

        let targetItem = store.inventory.find(i =>
            i.sku === sourceItem.sku && i.location === targetLocation
        );

        if (targetItem) {
            targetItem.stock += quantity;
        } else {
            store.inventory.unshift({
                id: Date.now(), // ID baru
                name: sourceItem.name,
                sku: sourceItem.sku,
                stock: quantity,
                buyPrice: sourceItem.buyPrice,
                sellPrice: sourceItem.sellPrice,
                minStock: sourceItem.minStock,
                location: targetLocation // Lokasi baru
            });
        }

        Logger.log('MUTASI', sourceItem.name, 0, `Transfer ${quantity} Pcs: ${sourceItem.location} -> ${targetLocation} (${note})`);

        return true;
    }
};
