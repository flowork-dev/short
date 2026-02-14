if(window.AvatarManager) {
    window.AvatarManager.register('glitch_pro', 'System Failure (RGB)', (ctx, x, y, size, img, volume) => {

        // --- 1. LOGIC KICK (HARD BASS) ---
        const intensity = volume / 255;
        // Pangkat 2 + multiplier 1.2 biar loncatannya jauh & kasar
        const kick = Math.pow(intensity, 2) * 1.2;
        const radius = size / 2;

        // Screen Shake (Getar satu avatar)
        let shakeX = 0, shakeY = 0;
        if(intensity > 0.1) {
            const shakeAmp = kick * 40; // Max getar 40px (Gede banget)
            shakeX = (Math.random() - 0.5) * shakeAmp;
            shakeY = (Math.random() - 0.5) * shakeAmp;
        }

        ctx.save();
        // Pindahkan titik tengah + efek getar
        ctx.translate(x + shakeX, y + shakeY);

        // Fungsi Helper Gambar Layer (Biar code rapi)
        const drawLayer = (offsetX, offsetY, color, composite) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2); // Gambar di 0,0 relatif
            ctx.clip();

            ctx.globalCompositeOperation = composite || 'screen';
            ctx.globalAlpha = 0.8;

            // Gambar Avatar
            ctx.drawImage(img, -radius + offsetX, -radius + offsetY, size, size);

            // Tint Warna
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = color;
            ctx.fillRect(-radius, -radius, size, size);

            ctx.restore();
        };

        if(img) {
            // RGB SPLIT DISTANCE (Makin teriak makin jauh pisahnya)
            const split = (kick * 50) + 2;

            // Layer Merah (Geser Kiri Atas)
            if(intensity > 0.05) {
                drawLayer(-split, -split/2, 'rgba(255, 0, 0, 0.6)', 'lighten');
            }

            // Layer Biru (Geser Kanan Bawah)
            if(intensity > 0.05) {
                drawLayer(split, split/2, 'rgba(0, 255, 255, 0.6)', 'lighten');
            }

            // Layer Hijau (Random Jitter - Muncul pas teriak doang)
            if(intensity > 0.6) {
                const randX = (Math.random() - 0.5) * split * 2;
                const randY = (Math.random() - 0.5) * split * 2;
                drawLayer(randX, randY, 'rgba(0, 255, 0, 0.5)', 'lighten');
            }

            // LAYER UTAMA (Normal - Tengah)
            // Ada efek zoom "Snap" dikit
            const snap = 1 + (kick * 0.1);
            ctx.scale(snap, snap);

            ctx.save();
            ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);
            ctx.restore();

            // DIGITAL ARTIFACTS (Kotak-kotak Rusak)
            // Muncul acak menutupi muka kalau volume tinggi
            if(intensity > 0.3) {
                const blocks = Math.floor(kick * 8); // Jumlah blok rusak
                ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';

                for(let i=0; i<blocks; i++) {
                    const bw = Math.random() * size * 0.6; // Lebar blok
                    const bh = Math.random() * 20 + 5;     // Tinggi blok tipis
                    const bx = (Math.random() * size) - radius;
                    const by = (Math.random() * size) - radius;

                    // Gambar blok random
                    ctx.fillRect(bx, by, bw, bh);
                }
            }

            // HORIZONTAL NOISE LINE (Garis TV Rusak)
            if(intensity > 0.1) {
                ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.4})`;
                const scanH = Math.random() * 5 + 2;
                const scanY = (Date.now() % 150 / 150 * size) - radius; // Gerak cepat ke bawah
                ctx.fillRect(-radius, scanY, size, scanH);
            }

            // FLASH PUTIH (Overexposure pas peak)
            if(intensity > 0.8) {
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.fill();
            }
        }

        ctx.restore();
    });
}