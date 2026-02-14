//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\stock-sentry\js\services\predictor.js total lines 36 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { store } from '../store.js';

export const PredictionService = {
    getDailyUsage(itemName) {
        const daysToAnalyze = 30;
        const now = new Date();
        let totalQtyOut = 0;
        let firstDate = now;

        store.logs.forEach(log => {
            const logDate = new Date(log.date);
            const diffTime = Math.abs(now - logDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (log.itemName === itemName && log.type === 'OUT' && diffDays <= daysToAnalyze) {
                totalQtyOut += Math.abs(log.qty);
                if (logDate < firstDate) firstDate = logDate;
            }
        });

        const dateDiff = Math.max(1, Math.ceil(Math.abs(now - firstDate) / (1000 * 60 * 60 * 24)));
        return totalQtyOut / dateDiff; // Rata-rata per hari
    },

    predictDaysLeft(item) {
        const dailyUsage = this.getDailyUsage(item.name);
        if (dailyUsage === 0) return 999; // Gak pernah laku = Aman selamanya
        return Math.floor(item.stock / dailyUsage);
    }
};
