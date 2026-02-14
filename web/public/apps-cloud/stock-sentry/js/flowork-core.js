//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\flowork-core.js total lines 48 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { ref } from 'vue';

export const userContext = ref(null);

export async function secureFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            window.parent.postMessage({ type: 'FLOWORK_AUTH_REQUIRED' }, '*');
            throw new Error("AUTH_REQUIRED");
        }

        if (response.status === 402) {
            window.parent.postMessage({ type: 'FLOWORK_PAYMENT_REQUIRED' }, '*');
            throw new Error("PAYMENT_REQUIRED");
        }

        if (response.status === 429) {
            window.parent.postMessage({ type: 'FLOWORK_RATE_LIMITED' }, '*');
            throw new Error("RATE_LIMITED");
        }

        return response;
    } catch (e) {
        console.error("[SecureFetch] Ops Error:", e);
        throw e;
    }
}

export function initFloworkBridge() {
    window.addEventListener('message', (event) => {
        const data = event.data;

        if (data.type === 'FLOWORK_USER_SYNC') {
            console.log("[Bridge] Identity Synced:", data.user);
            userContext.value = data.user;
        }
    });

    window.parent.postMessage({ type: 'FLOWORK_APP_READY' }, '*');
}
