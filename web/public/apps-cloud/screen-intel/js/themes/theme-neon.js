if(window.AvatarManager) {
    window.AvatarManager.register('neon', 'Neon Pulse', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        // --- 1. LOGIC KICK (JEDAG JEDUG) ---
        const intensity = volume / 255;
        // Pangkat 2 biar responsif + multiplier 1.2 biar agresif
        const kick = Math.pow(intensity, 2) * 1.2;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);

        // --- 2. SHOCKWAVE RIPPLES (Gelombang Kejut) ---
        // Muncul lingkaran-lingkaran di luar avatar yang membesar sesuai volume
        if (intensity > 0.05) {
            const ripples = 3;
            for(let i=1; i<=ripples; i++) {
                ctx.beginPath();
                // Jarak antar ripple melebar drastis pas teriak
                const r = radius + (i * 5) + (kick * 40 * i);
                ctx.arc(0, 0, r, 0, Math.PI * 2);

                // Opacity menurun makin jauh
                const alpha = Math.max(0, (0.6 - (i*0.15)) * intensity);
                ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Apply Zoom Pulse ke Core & Rings
        ctx.scale(pulse, pulse);

        // --- 3. DUAL ROTATING RINGS ---

        // Ring 1: Cyan (Slow Rotate)
        ctx.save();
        ctx.rotate(time); // Muter santai
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 20]); // Dashed neon

        // GLOW EFFECT (Makin terang pas bass)
        ctx.shadowBlur = 10 + (kick * 30);
        ctx.shadowColor = '#00f3ff';
        ctx.stroke();
        ctx.restore();

        // Ring 2: Magenta (Fast Reverse Rotate)
        ctx.save();
        ctx.rotate(-time * 2); // Muter balik lebih cepat
        ctx.beginPath();
        ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff00ff'; // Warna kontras (Cyberpunk style)
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();

        // --- 4. AVATAR CORE ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Inner Flash (Muka jadi terang pas bass)
            if(intensity > 0.4) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = `rgba(0, 243, 255, ${intensity * 0.3})`;
                ctx.fill();
            }
            ctx.restore();
        }

        // --- 5. ORBITING PARTICLES ---
        // Partikel kecil yang muter di sekeliling
        const particles = 6;
        for(let i=0; i<particles; i++) {
            const angle = (time * 0.8) + (i * (Math.PI * 2 / particles));
            // Partikel mental jauh pas bass
            const dist = radius + 10 + (kick * 20);
            const px = Math.cos(angle) * dist;
            const py = Math.sin(angle) * dist;

            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(px, py, 2, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    });
}