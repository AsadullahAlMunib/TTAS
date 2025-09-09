function copyCode(codeBox) {
    const pre = codeBox.querySelector("pre");
    const rawHTML = pre.textContent;

    // Create badge if not exists
    let badge = codeBox.querySelector(".copied-badge");
    if (!badge) {
        badge = document.createElement("span");
        badge.className = "copied-badge";
        badge.textContent = "Copied";
        codeBox.appendChild(badge);
    
        // Style badge via JS
        Object.assign(badge.style, {
            position: "absolute",
            top: "6px",
            right: "10px",
            fontSize: "0.75rem",
            background: "#20c997",
            color: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            pointerEvents: "none",
            opacity: "0",
            transform: "scale(1)",
            fontWeight: "bold"
        });
    
        // Ensure parent is styled for positioning
        Object.assign(codeBox.style, {
            position: "relative",
            overflow: "hidden"
        });
    }

    // Copy to clipboard
    navigator.clipboard.writeText(rawHTML).then(() => {
        // Show "Copied!" in <pre>
        pre.textContent = "✅ Copied!";
        pre.style.color = "#20c997";
        pre.style.fontWeight = "bold";
    
        // Animate badge: bounce + fade
        badge.style.opacity = "1";
        let frame = 0;
        const totalFrames = 30;
        const bounce = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
            badge.style.transform = `scale(${scale})`;
            badge.style.opacity = `${1 - progress}`;
            if (frame >= totalFrames) {
                clearInterval(bounce);
                badge.style.opacity = "0";
                badge.style.transform = "scale(1)";
            }
        }, 30);
    
        // Restore original code
        setTimeout(() => {
            pre.textContent = rawHTML;
            pre.style.color = "";
            pre.style.fontWeight = "";
        }, totalFrames * 30 + 100);
    }).catch(err => {
        console.error("Copy failed:", err);
    });
}