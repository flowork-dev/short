import { store } from '../store.js';
import { Logger } from './logger.js';

export const InventoryService = {
    add(itemData) {
        if (!itemData.name || !itemData.sku) return false;

        // --- FIX: CEK DUPLICATE SKU ---
        const exists = store.inventory.find(i => i.sku === itemData.sku);
        if (exists) {
            alert(`GAGAL: SKU ${itemData.sku} sudah digunakan oleh barang: ${exists.name}`);
            return false;
        }
        // ------------------------------

        store.inventory.unshift({
            id: Date.now(), type: 'single', ...itemData,
            location: store.settings.activeLocation, lastUpdated: new Date().toISOString(),
            isActive: true
        });
        Logger.log('NEW', itemData.name, itemData.stock, 'Barang Baru Ditambahkan');
        return true;
    },

    addBatch(baseItem, variants) {
        let count = 0;
        // --- FIX: Cek SKU Induk Dulu ---
        if (store.inventory.find(i => i.sku === baseItem.sku)) {
             alert(`GAGAL: SKU Induk ${baseItem.sku} sudah ada!`);
             return 0;
        }

        variants.forEach((v, index) => {
            if(!v.trim()) return;
            const newSku = `${baseItem.sku}-${v.trim()}`;

            // Cek SKU Varian
            if (store.inventory.find(i => i.sku === newSku)) return; // Skip jika varian ini ada

            const newItem = {
                ...baseItem, id: Date.now() + index, type: 'single',
                name: `${baseItem.name} - ${v.trim()}`, sku: newSku,
                location: store.settings.activeLocation, lastUpdated: new Date().toISOString(),
                isActive: true
            };
            store.inventory.unshift(newItem);
            count++;
        });
        Logger.log('NEW', baseItem.name, count, `Varian Generated (${variants.length})`);
        return count;
    },

    addBundle(bundleData, components) {
        // Cek SKU Bundle
        if (store.inventory.find(i => i.sku === bundleData.sku)) {
            alert(`GAGAL: SKU Paket ${bundleData.sku} sudah ada!`);
            return false;
        }

        store.inventory.unshift({
            id: Date.now(), type: 'bundle', ...bundleData,
            components: JSON.parse(JSON.stringify(components)),
            location: store.settings.activeLocation, lastUpdated: new Date().toISOString(),
            isActive: true
        });
        Logger.log('NEW', bundleData.name, bundleData.stock, 'Paket Bundle Dibuat');
        return true;
    },

    adjustStock(item, actualQty, reason) {
        const oldQty = item.stock;
        const diff = actualQty - oldQty;
        if (diff === 0) return false;
        item.stock = parseInt(actualQty);
        const type = diff > 0 ? 'ADJUST_IN' : 'ADJUST_OUT';
        Logger.log(type, item.name, diff, `Manual: ${reason}`);
        return true;
    },

    toggleArchive(item, reason) {
        const currentState = item.isActive !== false;
        item.isActive = !currentState;
        const action = item.isActive ? 'RESTORE' : 'ARCHIVE';
        Logger.log('SYSTEM', item.name, 0, `${action}: ${reason}`);
        return true;
    },

    printLabel(item) {
        const win = window.open('', '', 'width=400,height=400');
        win.document.write(`<html><body style="text-align:center;font-family:monospace;"><h2>${item.name}</h2><div id="q"></div><p>${item.sku}</p><script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script><script>new QRCode(document.getElementById("q"),{text:"${item.sku}",width:128,height:128});setTimeout(()=>window.print(),500);</script></body></html>`);
    }
};