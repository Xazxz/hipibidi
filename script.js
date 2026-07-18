
const state = {
    currentState: 0,
    totalStates: 7,
    isTransitioning: false,
    stars: []
};


const elements = {
    mainCard: document.getElementById('mainCard'),
    contentStates: document.querySelectorAll('.content-state'),
    progressDots: document.querySelectorAll('.dot'),
    cursorTrail: document.getElementById('cursorTrail'),
    starfield: document.getElementById('starfield'),
    shootingStars: document.getElementById('shootingStars'),
    constellationSvg: document.getElementById('constellationSvg'),
    ambientParticles: document.getElementById('ambientParticles'),
    bgMusic: document.getElementById('bgMusic'),
    musicToggle: document.getElementById('musicToggle')
};


function init() {
    createStarfield();
    createConstellations();
    createAmbientParticles();
    setupEventListeners();
    setupMusicPlayer();
    updateProgressDots();
    entranceAnimation();
    startShootingStars();
}

function entranceAnimation() {
    elements.mainCard.style.opacity = '0';
    elements.mainCard.style.transform = 'translateY(40px) scale(0.95)';

    requestAnimationFrame(() => {
        setTimeout(() => {
            elements.mainCard.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            elements.mainCard.style.opacity = '1';
            elements.mainCard.style.transform = 'translateY(0) scale(1)';
        }, 400);
    });
}

function createStarfield() {
    const starCount = window.innerWidth < 600 ? 100 : 200;

    for (let i = 0; i < starCount; i++) {
        createStar();
    }
}

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';

    const x = Math.random() * 100;
    const y = Math.random() * 100;

    const rand = Math.random();
    let size, isBright, isCross;

    if (rand > 0.97) {
        // cross shaped bright star (3%)
        size = 8 + Math.random() * 4;
        isBright = true;
        isCross = true;
    } else if (rand > 0.92) {
        // bright star (5%)
        size = 2 + Math.random() * 1.5;
        isBright = true;
        isCross = false;
    } else if (rand > 0.75) {
        // medium star (17%)
        size = 1.2 + Math.random() * 0.8;
        isBright = false;
        isCross = false;
    } else {
        // small star (75%)
        size = 0.5 + Math.random() * 0.8;
        isBright = false;
        isCross = false;
    }

    const duration = 2 + Math.random() * 5;
    const delay = Math.random() * 6;
    const minOpacity = 0.15 + Math.random() * 0.25;
    const maxOpacity = 0.6 + Math.random() * 0.4;

    star.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        --duration: ${duration}s;
        --delay: ${delay}s;
        --min-opacity: ${minOpacity};
        --max-opacity: ${maxOpacity};
        --scale: ${isCross ? 1.1 : 1.3};
    `;

    if (isBright) star.classList.add('bright');
    if (isCross) star.classList.add('cross');

    elements.starfield.appendChild(star);

    // Store position for constellation
    state.stars.push({ x, y, bright: isBright });
}

function createConstellations() {
    // get bright stars for constellation points
    const brightStars = state.stars.filter(s => s.bright);

    if (brightStars.length < 3) return;

    // create a few constellation-like connections
    const numConnections = Math.min(brightStars.length - 1, 5);

    for (let i = 0; i < numConnections; i++) {
        const star1 = brightStars[i];
        const star2 = brightStars[(i + 1) % brightStars.length];

        // only connect if they're reasonably close
        const distance = Math.sqrt(
            Math.pow(star1.x - star2.x, 2) +
            Math.pow(star1.y - star2.y, 2)
        );

        if (distance < 40) {
            createConstellationLine(star1, star2, i * 0.5);
        }
    }
}

function createConstellationLine(star1, star2, delay) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    line.setAttribute('x1', `${star1.x}%`);
    line.setAttribute('y1', `${star1.y}%`);
    line.setAttribute('x2', `${star2.x}%`);
    line.setAttribute('y2', `${star2.y}%`);
    line.classList.add('constellation-line');
    line.style.animationDelay = `${delay}s`;

    elements.constellationSvg.appendChild(line);
}


function createAmbientParticles() {
    const count = window.innerWidth < 600 ? 10 : 20;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'ambient-particle';

        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 12 + Math.random() * 8;
        const size = 1 + Math.random() * 2;

        particle.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;

        elements.ambientParticles.appendChild(particle);
    }
}


function startShootingStars() {
    function scheduleNext() {
        const delay = 4000 + Math.random() * 10000;
        setTimeout(() => {
            createShootingStar();
            scheduleNext();
        }, delay);
    }

    setTimeout(scheduleNext, 3000);
}

function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';

    // Start from upper-left portion of screen, fall to bottom-right
    const startX = 5 + Math.random() * 50;  // 5-55% from left
    const startY = 5 + Math.random() * 30;  // top 5-35%
    const length = 80 + Math.random() * 60;

    shootingStar.style.cssText = `
        left: ${startX}%;
        top: ${startY}%;
        width: ${length}px;
    `;

    elements.shootingStars.appendChild(shootingStar);

    setTimeout(() => shootingStar.remove(), 1000);
}


// ====================================
function setupEventListeners() {
    elements.mainCard.addEventListener('click', handleCardInteraction);

    // Touch support
    let touchStartY = 0;
    let touchStartX = 0;

    elements.mainCard.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    elements.mainCard.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const diffY = Math.abs(touchStartY - touchEndY);
        const diffX = Math.abs(touchStartX - touchEndX);

        // Tap detection (not swipe)
        if (diffY < 15 && diffX < 15) {
            handleCardInteraction(e);
        }
    });

    // Swipe support
    setupSwipeSupport();

    // Desktop cursor trail
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.addEventListener('mousemove', handleCursorTrail);
        elements.mainCard.addEventListener('mousemove', handleCardHover);
        elements.mainCard.addEventListener('mouseleave', handleCardLeave);
    }

    // Progress dots
    elements.progressDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goToState(parseInt(dot.dataset.dot));
        });
    });

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);
}

function setupSwipeSupport() {
    let startX = 0;

    elements.mainCard.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    elements.mainCard.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;

        if (Math.abs(diffX) > 60) {
            if (diffX > 0) {
                goToState((state.currentState + 1) % state.totalStates);
            } else {
                goToState((state.currentState - 1 + state.totalStates) % state.totalStates);
            }
        }
    }, { passive: true });
}

// ====================================
// INTERACTION HANDLERS
// ====================================
function handleCardInteraction(e) {
    if (state.isTransitioning) return;

    createRipple(e);

    // Occasional shooting star on tap
    if (Math.random() > 0.6) {
        createShootingStar();
    }

    goToState((state.currentState + 1) % state.totalStates);
}

function handleCursorTrail(e) {
    elements.cursorTrail.style.left = `${e.clientX}px`;
    elements.cursorTrail.style.top = `${e.clientY}px`;
}

function handleCardHover(e) {
    const rect = elements.mainCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    elements.mainCard.style.transform = `
        translateY(-6px) 
        scale(1.01)
        rotateY(${x * 5}deg) 
        rotateX(${-y * 5}deg)
    `;
}

function handleCardLeave() {
    elements.mainCard.style.transform = '';
}

function handleKeyboard(e) {
    if (state.isTransitioning) return;

    switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
            e.preventDefault();
            goToState((state.currentState + 1) % state.totalStates);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            goToState((state.currentState - 1 + state.totalStates) % state.totalStates);
            break;
    }
}

// ====================================
// STATE TRANSITIONS
// ====================================
function goToState(targetState) {
    if (targetState === state.currentState || state.isTransitioning) return;

    state.isTransitioning = true;

    const card = elements.mainCard;
    const currentContent = elements.contentStates[state.currentState];
    const nextContent = elements.contentStates[targetState];

    // ── Phase 0: Apply card-level motion blur ──────────────────
    card.classList.remove('motion-blur-clear');
    card.classList.add('motion-blur');

    // ── Phase 1: Trigger EXIT animation on current state ───────
    currentContent.classList.add('exiting');
    currentContent.classList.remove('active');

    // Wait for exit to complete (≈ 380 ms)
    setTimeout(() => {
        // Clean up exiting state
        currentContent.classList.remove('exiting');

        // ── Phase 2: Set up ENTER state (invisible, below, blurred) ─
        nextContent.classList.add('entering');

        // Force a reflow so the browser registers the starting state
        // before we add enter-active (otherwise the transition is skipped)
        // eslint-disable-next-line no-unused-expressions
        nextContent.offsetHeight;

        // ── Phase 3: Trigger ENTER animation ─────────────────────────
        nextContent.classList.add('enter-active');

        // Start clearing the card blur a bit after enter begins
        setTimeout(() => {
            card.classList.remove('motion-blur');
            card.classList.add('motion-blur-clear');
        }, 80);

        // When enter is done, swap to the stable .active class
        setTimeout(() => {
            nextContent.classList.remove('entering', 'enter-active');
            nextContent.classList.add('active');

            // Clean up card blur helper classes
            card.classList.remove('motion-blur-clear');

            state.currentState = targetState;
            updateProgressDots();

            if (targetState === state.totalStates - 1) {
                triggerFinalCelebration();
            }

            state.isTransitioning = false;
        }, 560); // slightly longer than enter-active transition (550 ms)
    }, 390); // slightly longer than exiting transition (380 ms)
}

function updateProgressDots() {
    elements.progressDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentState);
    });
}

// ====================================
// VISUAL EFFECTS
// ====================================
function createRipple(e) {
    const rect = elements.mainCard.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    let x, y;

    if (e.type.includes('touch') && e.changedTouches) {
        x = e.changedTouches[0].clientX - rect.left;
        y = e.changedTouches[0].clientY - rect.top;
    } else if (e.clientX) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    } else {
        x = rect.width / 2;
        y = rect.height / 2;
    }

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
    `;

    elements.mainCard.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}

function triggerFinalCelebration() {
    // Burst of shooting stars
    for (let i = 0; i < 4; i++) {
        setTimeout(() => createShootingStar(), i * 300);
    }
}

// ====================================
// MUSIC PLAYER
// ====================================
function setupMusicPlayer() {
    if (!elements.bgMusic || !elements.musicToggle) return;

    let isPlaying = false;
    let hasAutoPlayed = false;

    // Set initial volume
    elements.bgMusic.volume = 0.5;

    // Try to autoplay immediately (may be blocked by browser)
    const tryAutoPlay = () => {
        if (hasAutoPlayed) return;

        elements.bgMusic.play().then(() => {
            hasAutoPlayed = true;
            elements.musicToggle.classList.add('playing');
            isPlaying = true;
        }).catch(e => {
            // Autoplay blocked - will play on first interaction
            console.log('Autoplay blocked, waiting for user interaction');
        });
    };

    // Try autoplay immediately
    tryAutoPlay();

    // Also try on first user interaction (for browsers that block autoplay)
    const playOnInteraction = () => {
        if (!hasAutoPlayed) {
            tryAutoPlay();
        }
        // Remove listeners after first successful play
        if (hasAutoPlayed) {
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
        }
    };

    document.addEventListener('click', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);

    // Toggle button
    elements.musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            elements.bgMusic.pause();
            elements.musicToggle.classList.remove('playing');
        } else {
            elements.bgMusic.play().catch(e => {
                console.log('Music play failed:', e);
            });
            elements.musicToggle.classList.add('playing');
        }
        isPlaying = !isPlaying;
        hasAutoPlayed = true;
    });

    // Update button state if music ends or plays
    elements.bgMusic.addEventListener('play', () => {
        elements.musicToggle.classList.add('playing');
        isPlaying = true;
    });

    elements.bgMusic.addEventListener('pause', () => {
        elements.musicToggle.classList.remove('playing');
        isPlaying = false;
    });
}

// ====================================
// START
// ====================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

