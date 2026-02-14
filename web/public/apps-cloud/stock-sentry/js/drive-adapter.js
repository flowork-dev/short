//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\drive-adapter.js total lines 51 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { ref } from 'vue';

export const userContext = ref(null);
export const isDriveConnected = ref(false); // <--- INI YANG HILANG SEBELUMNYA

export async function secureFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (response.status === 401) window.parent.postMessage({ type: 'FLOWORK_AUTH_REQUIRED' }, '*');
        if (response.status === 402) window.parent.postMessage({ type: 'FLOWORK_PAYMENT_REQUIRED' }, '*');
        return response;
    } catch (e) {
        console.error("Network Error:", e);
        throw e;
    }
}

export function initFloworkBridge() {
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'FLOWORK_IDENTITY_SYNC') {
            userContext.value = event.data.user;
            console.log("[Adapter] User Synced:", event.data.user);
        }
    });
    window.parent.postMessage({ type: 'FLOWORK_APP_READY' }, '*');
}

export const DriveAdapter = {
    async init() {
        console.log("[Drive] Initializing...");
        setTimeout(() => {
            console.log("[Drive] Connected!");
            isDriveConnected.value = true; // Update state global
            window.dispatchEvent(new CustomEvent('auth-success'));
        }, 1000);
    },

    async saveData(data) {
        if (!isDriveConnected.value) return;
        console.log("[Drive] Saving data...", data);
        setTimeout(() => {
            console.log("[Drive] Data Saved!");
        }, 500);
    }
};
