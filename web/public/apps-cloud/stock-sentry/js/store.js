//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\store.js total lines 44 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { reactive, watch } from 'vue';
import { DriveAdapter, isDriveConnected } from './drive-adapter.js';

export const store = reactive({
    inventory: [],
    purchaseOrders: [],
    logs: [],
    settings: {
        activeLocation: 'MAIN' // Multi-gudang tetap ada untuk labeling
    }
});

export const StorageManager = {
    init() {
        const saved = localStorage.getItem('ss_admin_v1');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                store.inventory = data.inv || [];
                store.purchaseOrders = data.po || [];
                store.logs = data.logs || [];
            } catch (e) { console.error("Data Corrupt", e); }
        }

        watch(store, () => {
            const payload = {
                inv: store.inventory,
                po: store.purchaseOrders,
                logs: store.logs
            };
            localStorage.setItem('ss_admin_v1', JSON.stringify(payload));

            if (isDriveConnected.value) {
                DriveAdapter.saveData(payload);
            }
        }, { deep: true });
    }
};
