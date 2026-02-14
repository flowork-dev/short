if(window.AvatarManager) {
    window.AvatarManager.register('hacker', 'Anonymous Hacker', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        // --- 1. LOGIC KICK (HARD BASS) ---
        const intensity = volume / 255;
        // Pangkat 2 biar responsif sama bass, multiplier 1.0 biar loncat tinggi
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        // --- 2. SHAKE EFFECT (Getar Layar) ---
        let shakeX = 0, shakeY = 0;
        if(volume > 30) {
            const shakeAmount = kick * 15; // Max getar 15px
            shakeX = (Math.random() - 0.5) * shakeAmount;
            shakeY = (Math.random() - 0.5) * shakeAmount;
        }

        ctx.save();
        ctx.translate(x + shakeX, y + shakeY); // Pindah ke tengah + getar

        // Terapkan Pulse ke SEMUA elemen
        ctx.scale(pulse, pulse);

        // --- 3. BINARY RING (Lingkaran Angka 0 1) ---
        ctx.save();
        // Rotasi: Pelan pas diem, Ngebut pas ngomong
        const binSpeed = time * 0.5 + (kick * 5);
        ctx.rotate(binSpeed);

        ctx.fillStyle = '#0F0'; // Hijau Hacker
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        const binCount = 16; // Jumlah angka melingkar
        for(let i=0; i<binCount; i++) {
            ctx.save();
            // Putar kanvas untuk setiap angka
            ctx.rotate((Math.PI * 2 / binCount) * i);
            // Gambar angka di luar radius avatar
            // Jaraknya menjauh kalau ada kick
            const dist = radius + 10 + (kick * 20);
            ctx.fillText(Math.random() > 0.5 ? "1" : "0", 0, -dist);
            ctx.restore();
        }
        ctx.restore();

        // --- 4. TARGET LOCK RING (Muter Lawan Arah) ---
        ctx.save();
        ctx.rotate(-time * 1.5); // Muter ke kiri
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + intensity})`;
        ctx.lineWidth = 2 + (kick * 3); // Menebal pas bass
        ctx.setLineDash([5, 15]); // Garis putus-putus

        ctx.beginPath();
        ctx.arc(0, 0, radius + 2, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();

        // --- 5. AVATAR CORE ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Glitch Tint (Kedip Hijau/Merah pas suara kenceng)
            if(intensity > 0.5) {
                ctx.globalCompositeOperation = 'source-atop';
                // Random warna: Hijau (Hacker) atau Merah (Error)
                ctx.fillStyle = Math.random() > 0.7 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 0, 0.4)';
                ctx.fillRect(-radius, -radius, size, size);
            }
            ctx.restore();
        }

        // --- 6. HUD DATA TEXT ---
        if(intensity > 0.1) {
            ctx.fillStyle = '#0F0';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            // Teks muncul di bawah avatar
            const dataVal = Math.round(intensity * 100);
            ctx.fillText(`DECRYPT: ${dataVal}%`, 0, radius + 25);
        }

        ctx.restore();
    });
}