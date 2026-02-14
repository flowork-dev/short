if(window.AvatarManager) {
    window.AvatarManager.register('spectrum', 'Circular Spectrum', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        // --- 1. LOGIC KICK (DJ BASS) ---
        const intensity = volume / 255;
        // Pangkat 2 biar responsif + Multiplier
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);

        // Apply Zoom Pulse ke SEMUA (Avatar + Spectrum)
        ctx.scale(pulse, pulse);

        // --- 2. ROTATING SPECTRUM BARS ---
        ctx.save();

        // Rotasi: Base speed + Turbo speed pas teriak
        const spin = (time * 0.5) + (kick * 2);
        ctx.rotate(spin);

        const bars = 60; // Lebih rapat biar modern
        const step = (Math.PI * 2) / bars;

        for (let i = 0; i < bars; i++) {
            ctx.save();
            ctx.rotate(i * step);

            // Logic Panjang Bar:
            // 1. Base length (biar gak botak)
            // 2. Kick (Lonjakan volume)
            // 3. Sinewave (Gelombang air biar estetik)
            const wave = Math.sin((i * 0.5) + (time * 5)) * 10;
            const barLen = 10 + (kick * 60) + wave;

            // Warna Dinamis: Ungu -> Cyan -> Putih (Peak)
            if(intensity > 0.8) ctx.fillStyle = '#fff';
            else if(intensity > 0.4) ctx.fillStyle = '#54d7f6'; // Cyan
            else ctx.fillStyle = '#706bf3'; // Ungu

            // Gambar Bar
            // Mulai dari luar lingkaran avatar (radius)
            ctx.fillRect(-2, radius + 5, 4, barLen);

            // Refleksi Bar (Bayangan kecil di dalam)
            ctx.globalAlpha = 0.3;
            ctx.fillRect(-1, radius - 5, 2, -barLen * 0.2);

            ctx.restore();
        }
        ctx.restore();

        // --- 3. INNER RING GLOW ---
        ctx.beginPath();
        ctx.arc(0, 0, radius + 2, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(84, 215, 246, ${0.5 + intensity})`; // Makin terang
        ctx.lineWidth = 2 + (kick * 3); // Makin tebal
        ctx.stroke();

        // --- 4. AVATAR CORE ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();

            // Sedikit rotasi berlawanan arah buat avatar (biar dinamis)
            ctx.rotate(-spin * 0.2);
            ctx.drawImage(img, -radius, -radius, size, size);

            // Flash Beat Overlay
            if(intensity > 0.6) {
                ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.2})`;
                ctx.fill();
            }
            ctx.restore();
        }

        // --- 5. ORBITAL LINE ---
        // Garis tipis muter cepet di luar spectrum
        ctx.save();
        ctx.rotate(-time * 2);
        ctx.beginPath();
        const orbitRad = radius + 20 + (kick * 60); // Ikut melebar jauh
        ctx.arc(0, 0, orbitRad, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 40]);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    });
}