function copyCode(codeBox) {
    const preTags = codeBox.querySelectorAll("pre");
    const lines = Array.from(preTags).map(pre => pre.textContent).join("\n");
    const letters = lines.split("");

    navigator.clipboard.writeText(lines).then(() => {
        const canvas = document.createElement("canvas");
        canvas.width = codeBox.clientWidth;
        canvas.height = codeBox.clientHeight;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "9999";
        canvas.style.pointerEvents = "none";
        codeBox.style.position = "relative";
        codeBox.appendChild(canvas);
        
        const ctx = canvas.getContext("2d");
        ctx.font = "bold 14px 'Fira Code', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Create advanced particles with more properties
        const particles = letters.map((char, i) => ({
            char,
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 16 + Math.random() * 12,
            color: `hsl(${Math.random() * 360}, 100%, 65%)`,
            velocity: {
                x: (Math.random() - 0.5) * 18,
                y: (Math.random() - 0.5) * 18
            },
            gravity: 0.12,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.25,
            life: 100, // Reduced from 120
            phase: Math.random() * Math.PI * 2,
            trail: []
        }));
        
        // Enhanced explosion particles
        const explosionParticles = Array.from({ length: 75 }, () => ({
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: Math.random() * 10 + 3,
            color: `hsl(${Math.random() * 60 + 20}, 100%, 65%)`,
            velocity: {
                x: (Math.random() - 0.5) * 25,
                y: (Math.random() - 0.5) * 25
            },
            gravity: 0.08,
            life: 100, // Reduced from 120
            type: Math.random() > 0.5 ? "circle" : "star"
        }));
        
        // Multiple shockwaves
        const shockwaves = [
            { x: canvas.width / 2, y: canvas.height / 2, radius: 5, maxRadius: Math.max(canvas.width, canvas.height) * 0.9, thickness: 4, color: '#ff00c8', life: 80, speed: 18 }, // Reduced life
            { x: canvas.width / 2, y: canvas.height / 2, radius: 2, maxRadius: Math.max(canvas.width, canvas.height) * 0.7, thickness: 2, color: '#00ff9d', life: 60, speed: 12, delay: 8 } // Reduced life and delay
        ];
        
        // Gravity well effect
        const gravityWells = [{
            x: canvas.width / 2,
            y: canvas.height / 2,
            strength: 0.3,
            radius: 50,
            life: 40 // Reduced from 60
        }];
        
        let frame = 0;
        let badgeShown = false;
        
        function drawStar(x, y, size, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const x1 = x + size * Math.cos(angle);
                const y1 = y + size * Math.sin(angle);
                const x2 = x + size * 0.5 * Math.cos(angle + Math.PI / 5);
                const y2 = y + size * 0.5 * Math.sin(angle + Math.PI / 5);
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
        }
        
        function animate() {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dynamic background gradient
            const time = frame * 0.01;
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.8
            );
            gradient.addColorStop(0, `hsla(${Math.sin(time) * 60 + 300}, 100%, 50%, 0.4)`);
            gradient.addColorStop(0.7, `hsla(${Math.cos(time * 0.8) * 60 + 180}, 100%, 50%, 0.2)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw gravity wells
            gravityWells.forEach((well, index) => {
                well.life--;
                if (well.life > 0) {
                    const alpha = well.life / 40;
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.fillStyle = '#00ffff';
                    ctx.beginPath();
                    ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                } else {
                    gravityWells.splice(index, 1);
                }
            });
            
            // Update and draw shockwaves with delay
            shockwaves.forEach((wave, index) => {
                if (frame > (wave.delay || 0)) {
                    wave.radius += wave.speed;
                    wave.thickness -= 0.15;
                    wave.life -= 2.5;
                    
                    if (wave.thickness > 0 && wave.life > 0) {
                        ctx.beginPath();
                        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
                        ctx.strokeStyle = `${wave.color}${Math.min(1, wave.life / 100).toFixed(2)}`;
                        ctx.lineWidth = wave.thickness;
                        ctx.stroke();
                        
                        // Add glow effect
                        ctx.beginPath();
                        ctx.arc(wave.x, wave.y, wave.radius + 5, 0, Math.PI * 2);
                        ctx.strokeStyle = `${wave.color}${Math.min(0.3, wave.life / 300).toFixed(2)}`;
                        ctx.lineWidth = wave.thickness * 3;
                        ctx.stroke();
                    }
                }
            });
            
            // Update and draw explosion particles with different types
            explosionParticles.forEach((p, i) => {
                p.x += p.velocity.x;
                p.y += p.velocity.y;
                p.velocity.y += p.gravity;
                p.life -= 2.5; // Increased from 2.2
                
                // Apply gravity well effect
                gravityWells.forEach(well => {
                    if (well.life > 0) {
                        const dx = well.x - p.x;
                        const dy = well.y - p.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < well.radius * 2) {
                            const force = well.strength * (1 - distance / (well.radius * 2));
                            p.velocity.x += (dx / distance) * force;
                            p.velocity.y += (dy / distance) * force;
                        }
                    }
                });
                
                if (p.life > 0) {
                    ctx.globalAlpha = p.life / 100;
                    if (p.type === "star") {
                        drawStar(p.x, p.y, p.size, p.color);
                    } else {
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });
            ctx.globalAlpha = 1;
            
            // Update and draw text particles with trails
            particles.forEach((p, i) => {
                // Apply gravity well effect
                gravityWells.forEach(well => {
                    if (well.life > 0) {
                        const dx = well.x - p.x;
                        const dy = well.y - p.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < well.radius * 3) {
                            const force = well.strength * 0.7 * (1 - distance / (well.radius * 3));
                            p.velocity.x += (dx / distance) * force;
                            p.velocity.y += (dy / distance) * force;
                        }
                    }
                });
                
                p.x += p.velocity.x;
                p.y += p.velocity.y;
                p.velocity.y += p.gravity;
                p.rotation += p.rotationSpeed;
                p.life -= 1.0; // Increased from 0.7
                
                // Add position to trail (limit length)
                p.trail.push({x: p.x, y: p.y});
                if (p.trail.length > 6) p.trail.shift(); // Reduced from 8
                
                if (p.life > 0) {
                    const alpha = p.life / 100;
                    const glow = 3 + Math.sin(frame * 0.2 + p.phase) * 2;
                    
                    // Draw trail
                    p.trail.forEach((pos, index) => {
                        const trailAlpha = alpha * (index / p.trail.length) * 0.5;
                        ctx.globalAlpha = trailAlpha;
                        ctx.fillStyle = p.color;
                        ctx.shadowBlur = glow * 2;
                        ctx.shadowColor = p.color;
                        ctx.fillText(p.char, pos.x, pos.y);
                    });
                    
                    // Draw main character
                    ctx.globalAlpha = alpha;
                    ctx.shadowBlur = glow * 5;
                    ctx.shadowColor = p.color;
                    ctx.fillStyle = p.color;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillText(p.char, 0, 0);
                    ctx.restore();
                }
            });
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            
            // Show success badge earlier (changed from frame > 100 to frame > 60)
            if (frame > 60 && !badgeShown) {
                badgeShown = true;
                
                const badge = document.createElement("span");
                badge.className = "copied-badge";
                badge.textContent = "✅ COPIED!";
                codeBox.appendChild(badge);
                
                Object.assign(badge.style, {
                    position: "absolute",
                    top: "8px",
                    right: "10px",
                    fontSize: "0.8rem",
                    background: "linear-gradient(135deg, #20c997, #0f9)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    zIndex: "10000",
                    pointerEvents: "none",
                    opacity: "0",
                    transform: "scale(0.8)",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    boxShadow: "0 4px 15px rgba(32, 201, 151, 0.5)"
                });
                
                if (getComputedStyle(codeBox).position === "static") {
                    codeBox.style.position = "relative";
                }
                
                setTimeout(() => {
                    badge.style.opacity = "1";
                    badge.style.transform = "scale(1)";
                }, 50);
                
                setTimeout(() => {
                    badge.style.opacity = "0";
                    badge.style.transform = "scale(0.8) translateY(-10px)";
                    setTimeout(() => badge.remove(), 400);
                }, 2000);
            }
            
            // End animation earlier (changed from frame < 200 to frame < 120)
            if (frame < 120) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    if (canvas.parentNode) {
                        canvas.parentNode.removeChild(canvas);
                    }
                }, 200); // Reduced from 300
            }
        }

        animate();
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback: show simple badge on error
        const errorBadge = document.createElement("span");
        errorBadge.textContent = "❌ Copy Failed";
        errorBadge.style.cssText = "position:absolute; top:8px; right:10px; background:#dc3545; color:white; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; z-index:10000;";
        codeBox.appendChild(errorBadge);
        setTimeout(() => errorBadge.remove(), 2000);
    });
}
