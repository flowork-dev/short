if(window.AvatarManager) {
    window.AvatarManager.register('focus', 'Cinematic Focus', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;

        // --- 1. LOGIC KICK (DENYUT AGRESIF) ---
        const intensity = volume / 255;
        // Pangkat 2 biar sensitif sama bass, multiplier gede biar loncat
        const kick = Math.pow(intensity, 2) * 0.6;
        const pulse = 1 + kick;

        // Camera Shake Effect (Getar kalau suara kenceng)
        let shakeX = 0, shakeY = 0;
        if(volume > 50) {
            const shakeAmt = kick * 10; // Max getar 10px
            shakeX = (Math.random() - 0.5) * shakeAmt;
            shakeY = (Math.random() - 0.5) * shakeAmt;
        }

        // --- 2. AVATAR (LENS SUBJECT) ---
        if(img) {
            ctx.save();
            ctx.translate(x, y);

            // Zoom Effect (Lens Breathing)
            ctx.scale(pulse, pulse);

            // Frame Kotak dengan Round Corner
            const frameSize = size * 0.7;
            ctx.beginPath();
            // Fallback kalau roundRect gak support di browser lama
            if (ctx.roundRect) ctx.roundRect(-frameSize/2, -frameSize/2, frameSize, frameSize, 15);
            else ctx.rect(-frameSize/2, -frameSize/2, frameSize, frameSize);

            ctx.clip();
            ctx.drawImage(img, -frameSize/2, -frameSize/2, frameSize, frameSize);

            // Efek Flash Exposure (Kamera kena cahaya pas teriak)
            if(intensity > 0.6) {
                ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.2})`;
                ctx.fill();
            }

            ctx.restore();
        }

        // --- 3. DYNAMIC BRACKETS (FOCUS UI) ---
        // UI ikut bergetar (Camera Shake)
        ctx.save();
        ctx.translate(x + shakeX, y + shakeY);

        // Bracket melebar sesuai volume
        const bracketSize = (size * 0.8) + (kick * 100);
        const b = bracketSize / 2;
        const corner = 20 + (kick * 20); // Siku memanjang pas bass

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2 + (kick * 5); // Garis menebal pas bass

        // Glow Effect pas Bass
        if(intensity > 0.3) {
            ctx.shadowBlur = 10 + (kick * 20);
            ctx.shadowColor = "white";
        }

        ctx.beginPath();
        // Top Left
        ctx.moveTo(-b, -b + corner); ctx.lineTo(-b, -b); ctx.lineTo(-b + corner, -b);
        // Top Right
        ctx.moveTo(b - corner, -b); ctx.lineTo(b, -b); ctx.lineTo(b, -b + corner);
        // Bottom Left
        ctx.moveTo(-b, b - corner); ctx.lineTo(-b, b); ctx.lineTo(-b + corner, b);
        // Bottom Right
        ctx.moveTo(b - corner, b); ctx.lineTo(b, b); ctx.lineTo(b, b - corner);
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset Glow

        // --- 4. HUD INFO (REC & DATA) ---

        // REC Indicator (Kedip Cepat pas suara kenceng)
        const blinkSpeed = intensity > 0.5 ? 50 : 500;
        if (Date.now() % blinkSpeed < blinkSpeed / 2) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(-b, -b - 15, 4, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.fillStyle = "white";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("REC", -b + 10, -b - 12);

        // Center Crosshair (Target bidik)
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();

        // Audio Level Bar (Visualizer di bawah)
        ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
        const barW = size * 0.6;
        const barH = 4;
        const level = barW * intensity; // Panjang bar sesuai volume

        // Background Bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(-barW/2, b + 15, barW, barH);

        // Active Level Bar
        ctx.fillStyle = intensity > 0.8 ? "red" : "#00f3ff"; // Merah kalau peak
        ctx.fillRect(-barW/2, b + 15, level, barH);

        // Text Info
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        const db = Math.round(volume/2.5); // Fake DB calculation
        ctx.fillText(`MIC_GAIN: ${db}% | ISO: ${800 + Math.round(kick*1000)}`, 0, b + 35);

        ctx.restore();
    });
}