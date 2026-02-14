//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\outbound.js total lines 60 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';
import { Logger } from './logger.js';
import { reactive } from 'vue';

export const cartState = reactive({ items: [], customerName: '' });

export const OutboundService = {
    addToCart(item) {
        const existing = cartState.items.find(c => c.id === item.id);
        if (existing) existing.qty++;
        else cartState.items.push({ ...item, qty: 1 });
    },

    removeItem(index) { cartState.items.splice(index, 1); },

    processCheckout() {
        if (cartState.items.length === 0 || !cartState.customerName) return false;

        const sjItems = [];

        cartState.items.forEach(cItem => {
            const invItem = store.inventory.find(i => i.id === cItem.id);

            if (invItem) {
                if (invItem.type === 'bundle' && invItem.components) {
                    invItem.components.forEach(comp => {
                        const childItem = store.inventory.find(ci => ci.id === comp.id);
                        if (childItem) {
                            const qtyToDeduct = comp.qty * cItem.qty; // Resep x Jumlah Beli
                            childItem.stock -= qtyToDeduct;
                            Logger.log('OUT', childItem.name, -qtyToDeduct, `Bundle Sold: ${invItem.name}`);
                        }
                    });
                    invItem.stock -= cItem.qty;
                } else {
                    invItem.stock -= cItem.qty;
                }

                Logger.log('OUT', invItem.name, -cItem.qty, `Sent to: ${cartState.customerName}`);
                sjItems.push({ name: invItem.name, sku: invItem.sku, qty: cItem.qty });
            }
        });

        this.printSuratJalan(sjItems, cartState.customerName);
        cartState.items = [];
        cartState.customerName = '';
        return true;
    },

    printSuratJalan(items, customer) {
        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`<html><body><h1>SURAT JALAN</h1><p>Yth: ${customer}</p><ul>${items.map(i=>`<li>${i.name} (${i.qty})</li>`).join('')}</ul><script>window.print()</script></body></html>`);
    }
};
