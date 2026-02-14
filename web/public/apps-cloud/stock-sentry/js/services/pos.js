//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\pos.js
//#######################################################################

import { store } from '../store.js';
import { Logger } from './logger.js';
import { WhatsAppService } from './wa-bridge.js';
import { reactive } from 'vue';

export const posState = reactive({
    cart: [],
    customerPhone: '',
    discount: 0,
    cashGiven: 0
});

export const POSService = {
    addToCart(item) {
        // VALIDASI 1: Stok Habis
        if (item.stock <= 0) {
            return { success: false, message: 'Stok Habis!' };
        }

        const existing = posState.cart.find(c => c.id === item.id);

        // VALIDASI 2: Stok di keranjang melebihi stok gudang
        if (existing && existing.qty >= item.stock) {
            return { success: false, message: 'Stok Maksimal Tercapai' };
        }

        if (existing) existing.qty++;
        else posState.cart.push({ ...item, qty: 1 });

        return { success: true };
    },

    calculateTotal() {
        const subtotal = posState.cart.reduce((acc, item) => acc + (item.sellPrice * item.qty), 0);
        return subtotal - posState.discount;
    },

    processPayment() {
        const total = this.calculateTotal();

        // VALIDASI UANG (Tanpa Alert)
        if (posState.cashGiven < total) {
            return {
                success: false,
                message: `Uang Kurang Rp${new Intl.NumberFormat('id-ID').format(total - posState.cashGiven)}`
            };
        }

        if (posState.cart.length === 0) {
            return { success: false, message: 'Keranjang Kosong' };
        }

        // PROSES PENGURANGAN STOK
        // Karena 'store.inventory' reaktif, perubahan di sini otomatis update Analytics di app.html
        posState.cart.forEach(cItem => {
            const invItem = store.inventory.find(i => i.id === cItem.id);
            if (invItem) {
                // Logic Bundle
                if (invItem.type === 'bundle' && invItem.components) {
                    invItem.components.forEach(comp => {
                        const child = store.inventory.find(x => x.id === comp.id);
                        if(child) child.stock -= (comp.qty * cItem.qty);
                    });
                }
                // Kurangi Stok Utama
                invItem.stock -= cItem.qty;
                Logger.log('SALE', invItem.name, -cItem.qty, `POS Sale`);
            }
        });

        this.printThermalReceipt(posState.cart, total, posState.cashGiven, posState.discount);

        if (posState.customerPhone) {
            WhatsAppService.sendInvoice(posState.customerPhone, posState.cart, total, posState.cashGiven);
        }

        // Reset State
        posState.cart = [];
        posState.cashGiven = 0;
        posState.discount = 0;

        return { success: true };
    },

    printThermalReceipt(items, total, cash, discount) {
        const win = window.open('', '', 'width=300,height=600');
        win.document.write(`
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', monospace; width: 58mm; font-size: 10px; margin: 0; padding: 5px; }
                    .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                    .flex { display: flex; justify-content: space-between; }
                    .center { text-align: center; }
                </style>
            </head>
            <body>
                <div class="center">
                    <strong>TOKO STOCK SENTRY</strong><br>
                    Jl. Digital No. 1
                </div>
                <div class="line"></div>
                ${items.map(i => `
                    <div>${i.name}</div>
                    <div class="flex">
                        <span>${i.qty} x ${i.sellPrice}</span>
                        <span>${i.qty * i.sellPrice}</span>
                    </div>
                `).join('')}
                <div class="line"></div>
                <div class="flex"><span>DISKON:</span><span>-${discount}</span></div>
                <div class="flex" style="font-size:12px; font-weight:bold;"><span>TOTAL:</span><span>${total}</span></div>
                <div class="flex"><span>TUNAI:</span><span>${cash}</span></div>
                <div class="flex"><span>KEMBALI:</span><span>${cash - total}</span></div>
                <div class="line"></div>
                <div class="center">Terima Kasih!</div>
                <script>window.print();</script>
            </body>
            </html>
        `);
    }
};