//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\screen-intel\js\avatar-core.js total lines 48
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

window.AvatarManager = {
    themes: {},
    activeThemeId: 'neon',

    register(id, name, renderFn) {
        this.themes[id] = { name, render: renderFn };
    },

    getThemes() {
        return Object.keys(this.themes).map(k => ({ value: k, title: this.themes[k].name }));
    },

    render(ctx, x, y, size, img, volume) {
        const t = this.themes[this.activeThemeId];

        ctx.save();
        ctx.translate(x, y);


        let intensity = volume / 255;

        if (intensity < 0.1) intensity = 0;

        const kick = Math.pow(intensity, 3) * 0.5; // Max zoom tambah 50% (Gede banget)

        const idlePulse = Math.sin(Date.now() / 500) * 0.02; // +/- 2%

        const scaleFactor = 1 + kick + idlePulse;

        ctx.scale(scaleFactor, scaleFactor);

        if (t && t.render) {
            try {
                t.render(ctx, 0, 0, size, img, volume);
            } catch(e) {}
        } else if (img) {
            ctx.drawImage(img, -size/2, -size/2, size, size);
        }

        ctx.restore();
    }
};
