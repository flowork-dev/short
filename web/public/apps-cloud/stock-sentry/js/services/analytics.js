import { store } from '../store.js';

export const AnalyticsService = {
    getProfitAnalysis() {
        let revenue = 0;
        let cost = 0;

        // Filter: Hanya hitung yang AKTIF (tidak diarsip)
        const activeItems = store.inventory.filter(i => i.isActive !== false);

        activeItems.forEach(item => {
            revenue += (item.sellPrice * item.stock);
            cost += (item.buyPrice * item.stock);
        });

        return {
            revenue,
            cost,
            margin: revenue - cost
        };
    },

    getFastMoving() {
        // Sederhana: Ambil dari logs tipe 'OUT' terbanyak
        const counts = {};
        store.logs.filter(l => l.type === 'OUT').forEach(l => {
            counts[l.itemName] = (counts[l.itemName] || 0) + l.qty;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty]) => ({ name, qty }));
    },

    getDeadStock() {
        // Stok banyak tapi gak ada di logs 'OUT' 7 hari terakhir
        // Filter juga: hanya yang AKTIF
        return store.inventory
            .filter(i => i.isActive !== false && i.stock > 10)
            .slice(0, 5);
    }
};