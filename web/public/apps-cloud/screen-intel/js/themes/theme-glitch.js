if(window.AvatarManager) {
    window.AvatarManager.register('glitch', 'System Failure', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;

        // --- 1. LOGIC KICK (HARD BASS) ---
        const intensity = volume / 255;
        // Pangkat 2 + multiplier 1.0 biar loncatannya tajam
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        // Base Size
        const radius = size / 2;

        ctx.save();
        ctx.translate(x, y); // Fokus ke tengah

        // Apply Pulse
        ctx.scale(pulse, pulse);

        // --- 2. GLITCH SLICE EFFECT (Potongan Gambar) ---
        if(img) {
            // Berapa banyak potongan horizontal
            const slices = 20;
            const sliceH = size / slices;

            for(let i=0; i<slices; i++) {
                // Posisi Y awal potongan
                const sy = (i * sliceH) - radius;

                // Geser Kiri/Kanan Acak (Jitter)
                // Makin kenceng suara, makin jauh gesernya
                let offsetX = 0;

                // Efek gelombang sinus berjalan + Random Jitter pas teriak
                const wave = Math.sin((time * 10) + (i * 0.5)) * (5 + (kick * 20));

                if(Math.random() > 0.8) { // 20% kemungkinan glitch parah
                    offsetX = (Math.random() - 0.5) * (kick * 50);
                } else {
                    offsetX = wave * 0.2; // Gelombang halus
                }

                // Render Potongan Gambar
                // Kita crop gambar aslinya per-baris
                ctx.save();
                ctx.beginPath();
                ctx.rect(-radius + offsetX, sy, size, sliceH);
                ctx.clip();

                // Geser gambar sesuai offset
                ctx.drawImage(img, -radius + offsetX, -radius, size, size);

                // Tambah warna RGB split di pinggiran potongan
                if(intensity > 0.2) {
                    ctx.globalCompositeOperation = 'screen';
                    if(i % 2 === 0) {
                        ctx.fillStyle = `rgba(255, 0, 0, 0.5)`; // Merah
                        ctx.fillRect(-radius + offsetX - 5, sy, size, sliceH);
                    } else {
                        ctx.fillStyle = `rgba(0, 255, 255, 0.5)`; // Cyan
                        ctx.fillRect(-radius + offsetX + 5, sy, size, sliceH);
                    }
                }

                ctx.restore();
            }
        }

        // --- 3. ANALOG NOISE & SCANLINES ---
        // Garis-garis TV Rusak (Scanlines)
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        for(let i=0; i<size; i+=4) {
            ctx.fillRect(-radius, -radius + i, size, 1);
        }

        // White Noise Bar (Garis putih random berjalan)
        if(Math.random() > 0.9 || intensity > 0.5) {
            const barH = Math.random() * 10 + 2;
            const barY = (Math.random() * size) - radius;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
            ctx.fillRect(-radius, barY, size, barH);
        }

        // --- 4. RING GLITCH ---
        // Cincin luarnya juga ikut rusak/putus-putus
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + intensity})`;
        ctx.lineWidth = 2;

        // Dash array berubah-ubah sesuai waktu & volume
        const dash1 = 5 + (Math.random() * 20);
        const dash2 = 5 + (Math.random() * 50 * kick);
        ctx.setLineDash([dash1, dash2]);

        // Rotasi cincin acak
        ctx.rotate(time * (1 + kick * 5));
        ctx.stroke();

        ctx.restore();
    });
}