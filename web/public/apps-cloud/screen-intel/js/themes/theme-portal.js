if(window.AvatarManager) {
    // Variable state untuk animasi tunnel & stars (disimpan di luar render loop)
    const portalState = {
        rings: [],
        stars: [],
        lastTime: 0
    };

    // Init Stars sekali aja
    for(let i=0; i<50; i++) {
        portalState.stars.push({
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            z: Math.random() * 2 // Kedalaman
        });
    }

    window.AvatarManager.register('portal', 'Quantum Tunnel', (ctx, x, y, size, img, volume) => {
        const now = Date.now();
        const time = now / 1000;

        // --- 1. LOGIC KICK (WARP DRIVE) ---
        const intensity = volume / 255;
        // Pangkat 2 biar responsif + multiplier
        const kick = Math.pow(intensity, 2) * 1.5;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);

        // --- 2. STARFIELD BACKGROUND (Efek Ruang Angkasa) ---
        // Bikin Masking Lingkaran Luar biar bintang gak bocor
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        ctx.clip();

        // Background Gelap
        ctx.fillStyle = "rgba(0, 0, 20, 0.5)";
        ctx.fill();

        portalState.stars.forEach(star => {
            // Gerakkan bintang mendekat (Zoom)
            // Speed dasar + Speed boost pas teriak
            star.z -= 0.01 + (kick * 0.1);

            if(star.z <= 0) {
                // Reset bintang ke belakang kalau udah lewat layar
                star.z = 2;
                star.x = (Math.random() - 0.5) * 1000;
                star.y = (Math.random() - 0.5) * 1000;
            }

            // Proyeksi 3D sederhana
            const sx = star.x / star.z;
            const sy = star.y / star.z;
            const sz = (2 - star.z) * 2; // Ukuran bintang

            ctx.fillStyle = `rgba(255, 255, 255, ${1 - (star.z/2)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, sz, 0, Math.PI*2);
            ctx.fill();
        });

        // --- 3. LOGIC TUNNEL SPAWN ---
        // Spawn ring baru. Makin kenceng suara, makin sering spawn (Rapat)
        if (now - portalState.lastTime > 200 - (kick * 150)) {
            portalState.rings.push({ scale: 0.05, opacity: 0, rotation: Math.random() * Math.PI });
            portalState.lastTime = now;
        }

        // --- 4. RENDER HEXAGON TUNNEL ---
        portalState.rings.forEach((ring, index) => {
            // Speed ring membesar (Melesat ke kamera)
            ring.scale += 0.005 + (kick * 0.05);

            // Opacity logic: Muncul pelan -> Terang -> Hilang
            if(ring.scale < 0.2) ring.opacity += 0.05;
            else ring.opacity -= 0.01;

            if (ring.scale > 2 || ring.opacity <= 0) {
                portalState.rings.splice(index, 1);
            } else {
                ctx.save();
                ctx.scale(ring.scale, ring.scale);
                // Tunnel ikut muter pelan + ngebut pas kick
                ctx.rotate(ring.rotation + (time * 0.5) + (kick));

                ctx.beginPath();
                const hexSize = size * 2;
                for (let i = 0; i < 6; i++) {
                    ctx.lineTo(hexSize * Math.cos(i * Math.PI / 3), hexSize * Math.sin(i * Math.PI / 3));
                }
                ctx.closePath();

                ctx.strokeStyle = `rgba(0, 243, 255, ${ring.opacity})`;
                ctx.lineWidth = 5 / ring.scale; // Garis tebal di jauh, tipis di dekat

                // Glow effect pas teriak
                if(intensity > 0.5) {
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = "#00f3ff";
                }

                ctx.stroke();
                ctx.restore();
            }
        });

        // Reset Clip Background
        ctx.restore();

        // --- 5. AVATAR (BLACK HOLE) ---
        if(img) {
            ctx.save();
            ctx.translate(x, y); // Pindah lagi ke tengah (karena restore di atas reset matrix)

            // Apply Pulse
            ctx.scale(pulse, pulse);

            const smallSize = size * 0.6; // Ukuran dasar

            // Aura Sedotan (Black Hole)
            const grad = ctx.createRadialGradient(0, 0, smallSize/3, 0, 0, smallSize);
            grad.addColorStop(0, "rgba(0, 0, 0, 0)");
            grad.addColorStop(1, `rgba(0, 243, 255, ${intensity * 0.8})`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, smallSize, 0, Math.PI*2);
            ctx.fill();

            // Gambar Avatar
            ctx.beginPath();
            ctx.arc(0, 0, smallSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -smallSize/2, -smallSize/2, smallSize, smallSize);

            // Inner Shadow (Biar kelihatan masuk ke dalam)
            ctx.shadowBlur = 20;
            ctx.shadowColor = "black";
            ctx.lineWidth = 5;
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.stroke();

            ctx.restore();

            // Ring Statis Paling Depan
            ctx.beginPath();
            ctx.arc(x, y, (smallSize/2) + 5 + (kick*10), 0, Math.PI*2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + intensity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}