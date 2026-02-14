if(window.AvatarManager) {
    window.AvatarManager.register('coding', 'Matrix Stream', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const coreSize = size * 0.5;

        // --- 1. LOGIC DENYUT (KICK) 2X LIPAT ---
        const intensity = volume / 255;
        // Pangkat 2 + multiplier 0.8 biar loncatannya agresif
        const kick = Math.pow(intensity, 2) * 0.8;
        const pulse = 1 + kick;

        // --- 2. MATRIX RAIN BACKGROUND (Efek Hujan Angka) ---
        ctx.save();
        ctx.translate(x, y); // Fokus ke tengah

        // Bikin Masking Bulat (Biar hujan cuma ada di dalam lingkaran)
        ctx.beginPath();
        ctx.arc(0, 0, (size/2), 0, Math.PI * 2);
        ctx.clip();

        // Background Hitam Pekat
        ctx.fillStyle = '#000';
        ctx.fill();

        // Render Hujan Angka
        ctx.fillStyle = '#0F0'; // Hijau Hacker
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';

        // Bikin 10 kolom angka jatuh
        const columns = 8;
        for(let i=0; i<columns; i++) {
            // Posisi X kolom
            const colX = (i - columns/2) * (size / columns) * 1.5;

            // Kecepatan jatuh (Base speed + Volume Boost)
            // Tiap kolom punya speed beda biar natural
            const speed = 50 + (i * 10) + (kick * 300);

            // Posisi Y (Looping pake Modulo)
            const dropY = (time * speed) % size - (size/2);

            // Efek Trail (Bayangan angka)
            ctx.globalAlpha = 0.6 + (Math.random() * 0.4);
            const char = Math.random() > 0.5 ? "1" : "0";
            ctx.fillText(char, colX, dropY);

            // Angka kedua (trail)
            ctx.globalAlpha = 0.3;
            ctx.fillText(char, colX, dropY - 15);
        }
        ctx.restore();

        // --- 3. ROTATING CODE RING (Cincin Kode) ---
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse); // Ring ikut membesar pas bass

        // Rotasi: Pelan pas diem, Ngebut pas ngomong
        const rotSpeed = time * 0.5 + (intensity * 3);
        ctx.rotate(rotSpeed);

        // Lingkaran Putus-putus
        ctx.strokeStyle = '#0F0';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 15]); // Efek dash ala terminal

        ctx.beginPath();
        ctx.arc(0, 0, (coreSize/2) + 10, 0, Math.PI*2);
        ctx.stroke();

        // Hiasan Teks yang ikut muter
        ctx.fillStyle = '#0F0';
        ctx.font = '10px monospace';
        ctx.fillText("SYS_ROOT", (coreSize/2) + 15, 0);
        ctx.fillText("0x5F", -(coreSize/2) - 15, 0);

        ctx.restore();

        // --- 4. AVATAR CORE ---
        if(img) {
            ctx.save();
            ctx.translate(x, y);

            // Terapkan Pulse Agresif ke Avatar
            ctx.scale(pulse, pulse);

            ctx.beginPath();
            ctx.arc(0, 0, coreSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -coreSize/2, -coreSize/2, coreSize, coreSize);

            // Flash Hijau pas suara kenceng (Visual Feedback)
            if(intensity > 0.5) {
                ctx.fillStyle = `rgba(0, 255, 0, ${intensity * 0.3})`;
                ctx.fill();
            }

            // Scanline Horizontal (Garis scan tipis)
            ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
            const scanY = (time * 100) % coreSize - (coreSize/2);
            ctx.fillRect(-coreSize/2, scanY, coreSize, 5);

            ctx.restore();
        }
    });
}