if(window.AvatarManager) {
    window.AvatarManager.register('hud_tech', 'Cyber HUD (Jarvis)', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        // --- 1. LOGIC KICK (REACTOR PULSE) ---
        const intensity = volume / 255;
        // Pangkat 2 + multiplier 1.0 biar loncatannya tajam & responsif
        const kick = Math.pow(intensity, 2) * 1.0;

        // Rotasi Speed Boost (Muter ngebut pas ngomong)
        const speed = time * 0.5 + (kick * 5);

        ctx.save();
        ctx.translate(x, y);

        // Apply Pulse ke seluruh elemen
        const pulse = 1 + (kick * 0.3); // Zoom in/out ritmis
        ctx.scale(pulse, pulse);

        // --- 2. OUTER RING (TARGETING SYSTEM) ---
        ctx.save();
        ctx.rotate(speed); // Muter searah jarum jam

        // Lingkaran Putus-putus Luar
        ctx.beginPath();
        // Radius melebar drastis pas bass
        const r1 = radius + 10 + (kick * 30);
        ctx.arc(0, 0, r1, 0, Math.PI * 2);

        ctx.strokeStyle = `rgba(0, 243, 255, ${0.3 + intensity})`; // Makin terang pas bass
        ctx.lineWidth = 2 + (kick * 2);
        ctx.setLineDash([20, 10, 5, 10]); // Pola dash tech
        ctx.stroke();

        // Hiasan segitiga di cincin luar
        for(let i=0; i<4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.moveTo(r1 + 5, 0);
            ctx.lineTo(r1 + 10, -3);
            ctx.lineTo(r1 + 10, 3);
            ctx.fill();
        }
        ctx.restore();

        // --- 3. INNER RING (REACTOR CORE) ---
        ctx.save();
        ctx.rotate(-speed * 1.5); // Muter berlawanan arah & lebih cepat

        const r2 = radius + 5;
        ctx.beginPath();
        ctx.arc(0, 0, r2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 243, 255, 0.8)`;
        ctx.lineWidth = 2;
        // Dash berubah sesuai volume (Glitch effect)
        const dashA = 5 + (kick * 20);
        ctx.setLineDash([dashA, 5]);
        ctx.stroke();

        // Arc Reactor Glow
        if(intensity > 0.5) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#00f3ff";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();

        // --- 4. AUDIO REACT BARS (CIRCULAR EQ) ---
        const bars = 16;
        const step = (Math.PI * 2) / bars;
        ctx.save();
        for(let i=0; i<bars; i++) {
            ctx.rotate(step);
            // Panjang bar random + volume kick
            const barLen = 5 + (kick * 40 * Math.random());

            ctx.fillStyle = i % 2 === 0 ? '#00f3ff' : 'rgba(0, 243, 255, 0.3)';
            ctx.fillRect(radius + 20 + (kick*10), -2, barLen, 4);
        }
        ctx.restore();

        // --- 5. AVATAR & HUD OVERLAY ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Tech Scanline (Laser scan turun naik)
            const scanY = (Math.sin(time * 5) * radius);
            ctx.fillStyle = "rgba(0, 243, 255, 0.3)";
            ctx.fillRect(-radius, scanY, size, 2);

            // Flash Biru pas Peak
            if(intensity > 0.7) {
                ctx.fillStyle = "rgba(0, 243, 255, 0.2)";
                ctx.fill();
            }
            ctx.restore();
        }

        // --- 6. DATA TEXT (JARVIS ANALYSIS) ---
        if(intensity > 0.1) {
            ctx.fillStyle = '#00f3ff';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';

            // Random numbers effect
            const val1 = Math.floor(Math.random() * 999);
            const val2 = Math.floor(intensity * 100);

            ctx.fillText(`SYS_CORE: ${val1}`, 0, radius + 20 + (kick*10));
            ctx.fillText(`PWR_LVL: ${val2}%`, 0, -radius - 15 - (kick*10));

            // Warning Box kalau volume peak
            if(intensity > 0.8) {
                ctx.fillStyle = 'red';
                ctx.fillText("[ WARNING: OVERLOAD ]", 0, 0);
            }
        }

        ctx.restore();
    });
}