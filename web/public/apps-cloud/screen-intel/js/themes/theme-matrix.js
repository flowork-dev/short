if(window.AvatarManager) {
    window.AvatarManager.register('matrix_rain', 'Matrix Stream', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        // --- 1. LOGIC KICK (MATRIX PULSE) ---
        const intensity = volume / 255;
        // Pangkat 2 biar responsif sama suara, multiplier 1.0
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);

        // Terapkan Pulse (Zoom In/Out)
        ctx.scale(pulse, pulse);

        // --- 2. BACKGROUND & RAIN ---
        // Bikin lingkaran background hitam
        ctx.beginPath();
        ctx.arc(0, 0, radius + 10, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Hitam pekat
        ctx.fill();
        ctx.clip(); // Clip biar hujan cuma di dalam lingkaran

        // DIGITAL RAIN (Hujan Angka Vertikal)
        ctx.fillStyle = '#0F0';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        const columns = 10; // Jumlah jalur hujan
        const colWidth = (size + 20) / columns;

        for(let i=0; i<columns; i++) {
            // Posisi X per kolom
            const cx = (i * colWidth) - (size/2) + (colWidth/2);

            // Speed beda-beda tiap kolom + Speed Boost pas teriak
            const speed = 50 + (i * 15) + (kick * 300);

            // Posisi Y turun terus (Looping)
            const cy = (time * speed) % (size + 40) - (size/2) - 20;

            // Gambar Stream (Ekor)
            // Karakter utama (Terang)
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#0F0';
            const charHead = Math.random() > 0.5 ? "1" : "0";
            ctx.fillText(charHead, cx, cy);
            ctx.shadowBlur = 0; // Reset blur

            // Karakter Ekor 1 (Redup)
            ctx.globalAlpha = 0.5;
            ctx.fillText(Math.random() > 0.5 ? "1" : "0", cx, cy - 12);

            // Karakter Ekor 2 (Pudar)
            ctx.globalAlpha = 0.2;
            ctx.fillText(Math.random() > 0.5 ? "1" : "0", cx, cy - 24);
        }

        ctx.restore(); // Restore clip hujan

        // --- 3. ROTATING CODE RINGS ---
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // Ring 1: Muter Kanan (Lambat)
        ctx.rotate(time * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI*2);
        ctx.strokeStyle = '#0F0';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.stroke();

        // Ring 2: Muter Kiri (Cepat pas Kick)
        ctx.rotate(-time * (1 + kick * 5));
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 + intensity})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();

        ctx.restore();

        // --- 4. AVATAR CORE ---
        if(img) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulse, pulse);

            // Crop Avatar (Sedikit lebih kecil dari ring)
            const coreSize = size * 0.9;
            ctx.beginPath();
            ctx.arc(0, 0, coreSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -coreSize/2, -coreSize/2, coreSize, coreSize);

            // Green Tint Overlay (Makin hijau pas suara kenceng)
            if(intensity > 0.1) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(0, 255, 0, ${intensity * 0.4})`;
                ctx.fillRect(-coreSize/2, -coreSize/2, coreSize, coreSize);
            }

            // Scanline (Garis Hijau Turun)
            ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
            const scanY = (time * 100) % coreSize - (coreSize/2);
            ctx.fillRect(-coreSize/2, scanY, coreSize, 2);

            ctx.restore();
        }
    });
}