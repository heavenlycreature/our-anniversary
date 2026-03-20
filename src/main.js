// ==========================================
// BACKGROUND HEARTS GENERATOR
// ==========================================
const heartsContainer = document.getElementById('floating-hearts');

// The SVG shape for the heart
const heartSVG = `<svg viewBox="0 0 24 24" class="w-full h-full fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

// How many hearts do you want? Change this number!
const totalHearts = 75; 

// Colors to randomly pick from
const heartColors = ['text-rose-200', 'text-rose-300', 'text-pink-200', 'text-pink-300'];

for (let i = 0; i < totalHearts; i++) {
    const heart = document.createElement('div');
    
    // Randomize size (between 0.5rem and 2rem)
    const size = Math.random() * 1.5 + 0.5;
    
    // Randomize position (0% to 100% of the screen)
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    
    // Randomize animation speed and delay so they don't move together
    const delay = Math.random() * 5; 
    const duration = Math.random() * 5 + 5; // Between 5s and 10s
    
    // Pick a random color
    const color = heartColors[Math.floor(Math.random() * heartColors.length)];

    // Apply the classes and inline styles
    heart.className = `absolute ${color} animate-float`;
    heart.style.width = `${size}rem`;
    heart.style.height = `${size}rem`;
    heart.style.left = `${left}%`;
    heart.style.top = `${top}%`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${duration}s`;
    heart.innerHTML = heartSVG;
    
    // Make some hearts blurry to create a 3D depth effect!
    if (Math.random() > 0.5) {
        heart.classList.add('blur-[2px]');
    }

    heartsContainer.appendChild(heart);
}

// ==========================================
// 1. LIGHTWEIGHT PARALLAX LOGIC (Fixed for scroll)
// ==========================================
const layers = document.querySelectorAll('.parallax-layer');
let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateParallax() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;

        layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed'));
            const x = currentX * speed * 1000; 
            const y = currentY * speed * 1000;
            layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        requestAnimationFrame(animateParallax);
    }
    
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animateParallax();
    }
}

// ==========================================
// 2. BOOK LOGIC & SCROLL OBSERVER
// ==========================================
const scrollContainer = document.getElementById('scroll-container');
const bookWrapper = document.getElementById('book-wrapper'); // Grab the new wrapper
const ribbonBow = document.getElementById('ribbon-bow');
const bookCover = document.getElementById('card-front');
const bookOpened = document.getElementById('book-opened');
const messages = document.querySelectorAll('.message');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const soundOnIcon = document.getElementById('sound-on-icon');
const soundOffIcon = document.getElementById('sound-off-icon');
let isMusicPlaying = false;
let musicStarted = false; // Tracks if they've initiated the music once
let isBookOpen = false;

// Function to open the book
ribbonBow.addEventListener('click', (e) => {
    e.stopPropagation();
    if(isBookOpen) return;
    
    isBookOpen = true;
    ribbonBow.classList.add('untie-bow');

    if (!musicStarted) {
        bgMusic.volume = 0.5; // Set volume to 50% so it's not too loud
        bgMusic.play().catch(error => console.log("Audio play failed:", error));
        isMusicPlaying = true;
        musicStarted = true;
        
        // Show the floating mute button smoothly
        musicToggle.classList.remove('hidden');
        musicToggle.classList.add('animate-fade-in'); 
    }
    
    // Slide the whole book to the center of the screen
    bookWrapper.classList.remove('md:-translate-x-1/4');
    
    setTimeout(() => {
        bookCover.classList.add('card-open-rotate');
    }, 200); 

    setTimeout(() => {
        bookCover.style.opacity = '0';
        bookCover.style.pointerEvents = 'none';
    }, 600); 

    setTimeout(() => {
        bookOpened.style.opacity = '1';
    }, 800);

    setTimeout(() => {
        messages.forEach((msg, index) => {
            setTimeout(() => {
                msg.classList.add('message-visible');
                
                if (index === messages.length - 1) {
                    setTimeout(() => {
                        scrollContainer.classList.remove('overflow-y-hidden');
                        scrollContainer.classList.add('overflow-y-auto');
                    }, 500);
                }
            }, index * 1200);
        });
    }, 1800); 
});

// Function to close the book when scrolling away
function closeBook() {
    if (!isBookOpen) return;
    isBookOpen = false;
    
    messages.forEach(msg => msg.classList.remove('message-visible'));
    bookOpened.style.opacity = '0';

    setTimeout(() => {
        bookCover.classList.remove('card-open-rotate');
        bookCover.style.opacity = '1';
        bookCover.style.pointerEvents = 'auto';
        
        // Slide the book back to its closed position
        bookWrapper.classList.add('md:-translate-x-1/4');
    }, 500); 
    
    setTimeout(() => {
        ribbonBow.classList.remove('untie-bow');
    }, 900); 
}

const gallerySection = document.getElementById('gallery-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            closeBook();
        }
    });
}, { threshold: 0.2 }); 

observer.observe(gallerySection);


// ==========================================
// 3. PHOTO STACK LOGIC
// ==========================================
const stackContainer = document.getElementById('photo-stack');
// Reverse array so the last DOM element (visually on top) is the first in our array
let cards = Array.from(document.querySelectorAll('.photo-card')).reverse();

// Set initial z-indexes to ensure proper stacking
function updateZIndexes() {
    cards.forEach((card, index) => {
        card.style.zIndex = cards.length - index;
    });
}
updateZIndexes();

stackContainer.addEventListener('click', () => {
    // 1. Grab the top card
    const topCard = cards[0];
    
    // 2. Animate it out of view
    topCard.classList.add('swipe-out');
    
    setTimeout(() => {
        // 3. Remove the animation class so it snaps back into the center
        topCard.classList.remove('swipe-out');
        
        // 4. Move the physical HTML element to the beginning of the container (visually back)
        stackContainer.insertBefore(topCard, stackContainer.firstChild);
        
        // 5. Update our array: move the first item to the end
        cards.push(cards.shift());
        
        // 6. Fix the z-indexes
        updateZIndexes();
    }, 500); // Wait for the CSS swipe-out transition to finish
});

// ==========================================
// 4. CLOSING STATEMENT LOGIC
// ==========================================
const restartBtn = document.getElementById('restart-btn');

restartBtn.addEventListener('click', () => {
    // Smoothly scroll the main container back to the very top
    scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==========================================
// 5. AUDIO TOGGLE LOGIC
// ==========================================
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    } else {
        bgMusic.play();
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
    }
    isMusicPlaying = !isMusicPlaying;
});