if(window.AvatarManager) {
    window.AvatarManager.register('inferno', 'Blue Inferno', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        // --- LOGIC KICK ---
        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.2;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- FIRE PARTICLES ---
        // Kita gambar 3 layer api yang berputar & bergelombang
        const layers = 20;
        for(let i=0; i<layers; i++) {
            ctx.save();
            const angle = (Math.PI * 2 / layers) * i;

            // Tinggi api random + volume boost
            const flameHeight = (Math.sin(time * 10 + i) * 10) + (kick * 60) + 10;
            const dist = radius + flameHeight;

            // Rotasi api
            ctx.rotate(angle + (time * 2));

            // Warna: Biru -> Putih (Panas)
            const alpha = 0.5 + (kick * 0.5);
            ctx.fillStyle = `rgba(${0 + (kick*255)}, ${150 + (kick*100)}, 255, ${alpha})`;

            // Gambar lidah api (Segitiga panjang)
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(dist, -5); // Ujung atas
            ctx.lineTo(dist, 5);  // Ujung bawah
            ctx.fill();

            ctx.restore();
        }

        // --- CORE GLOW ---
        ctx.shadowBlur = 20 + (kick * 50);
        ctx.shadowColor = "#0088ff";

        if(img) {
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Inner Heat (Overlay kuning/putih pas teriak)
            if(intensity > 0.6) {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = `rgba(255, 200, 0, ${intensity * 0.4})`;
                ctx.fill();
            }
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    });
}