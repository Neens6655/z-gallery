document.addEventListener('DOMContentLoaded', () => {
  // 1. Z-Tilt (3D Hover Effect) - using event delegation for dynamic elements
  document.addEventListener('mousemove', e => {
    const tiltEl = e.target.closest('.z-tilt');
    if (tiltEl) {
      const rect = tiltEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      tiltEl.style.setProperty('--tilt-x', x.toFixed(2));
      tiltEl.style.setProperty('--tilt-y', y.toFixed(2));
    }
  });
  
  document.addEventListener('mouseout', e => {
    const tiltEl = e.target.closest('.z-tilt');
    // Important: check if we left the actual card, not just a child
    if (tiltEl && !tiltEl.contains(e.relatedTarget)) {
      tiltEl.style.setProperty('--tilt-x', 0);
      tiltEl.style.setProperty('--tilt-y', 0);
    }
  });

  // 2. Z-Parallax (Scroll Zoom/Translate)
  const parallaxElements = document.querySelectorAll('.z-parallax');
  if (parallaxElements.length > 0) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxElements.forEach(el => {
            const speed = 0.15;
            el.style.transform = `translateY(${scrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
});

// Cinematic Enhancements v2
document.addEventListener('DOMContentLoaded', () => {
    // Spotlight Mapping
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let currentX = mouseX, currentY = mouseY;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateSpotlight() {
        // smooth lerp
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;
        document.body.style.setProperty('--mouse-x', `${currentX}px`);
        document.body.style.setProperty('--mouse-y', `${currentY}px`);
        requestAnimationFrame(animateSpotlight);
    }
    requestAnimationFrame(animateSpotlight);

    // Typing Cursor
    const typedElements = document.querySelectorAll('.zs-typed[data-text]');
    typedElements.forEach(el => {
        const textToType = el.getAttribute('data-text');
        el.textContent = '';
        let i = 0;
        function typeWriter() {
            if (i < textToType.length) {
                el.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            }
        }
        setTimeout(typeWriter, 800);
    });
});
