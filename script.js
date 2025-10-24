// ===================================
// VENT DATA
// ===================================
const ventData = [
    {
        id: 1,
        emoji: "😤",
        category: "Work",
        time: "2 hours ago",
        text: "My boss called me 'lazy' in front of the whole team today. I've worked 60 hours this week. I fucking hate this job.",
        reactions: 73,
        comment: "Happened to me. I quit."
    },
    {
        id: 2,
        emoji: "💔",
        category: "Relationships",
        time: "3 hours ago",
        text: "She said she 'fell out of love.' After 3 years. No warning. How does that even happen?",
        reactions: 156,
        comment: "Going through this now"
    },
    {
        id: 3,
        emoji: "🥺",
        category: "Loneliness",
        time: "5 hours ago",
        text: "I'm surrounded by people but feel completely alone. Nobody actually knows me.",
        reactions: 201,
        comment: "This is too real"
    },
    {
        id: 4,
        emoji: "😨",
        category: "Money",
        time: "7 hours ago",
        text: "I make 'good money' but I'm broke by the 20th every month. What am I doing wrong?",
        reactions: 92,
        comment: "Same boat, friend"
    },
    {
        id: 5,
        emoji: "🤯",
        category: "Life",
        time: "9 hours ago",
        text: "I'm 26 and feel like I'm already behind. Everyone else has it figured out. I'm faking it.",
        reactions: 178,
        comment: "We're all faking it"
    }
];

// ===================================
// TESTIMONIALS ROTATION
// ===================================
const testimonials = [
    "Finally, somewhere I can be honest without judgment",
    "This helped more than my $200 therapy session",
    "I didn't know other people felt exactly like this"
];

let currentTestimonialIndex = 0;

function rotateTestimonials() {
    const testimonialElement = document.getElementById('rotating-testimonial');
    if (testimonialElement) {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
        testimonialElement.style.opacity = '0';
        
        setTimeout(() => {
            testimonialElement.textContent = `"${testimonials[currentTestimonialIndex]}"`;
            testimonialElement.style.opacity = '1';
        }, 500);
    }
}

// ===================================
// STICKY HEADER
// ===================================
let lastScrollTop = 0;
const header = document.getElementById('sticky-header');

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 600) {
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            header.classList.remove('header-visible');
            header.classList.add('header-hidden');
        } else {
            // Scrolling up
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
    } else {
        header.classList.add('header-hidden');
    }
    
    lastScrollTop = scrollTop;
}

// ===================================
// LIKE FUNCTIONALITY
// ===================================
let likedVents = JSON.parse(localStorage.getItem('likedVents')) || [];

function toggleLike(ventId) {
    const index = likedVents.indexOf(ventId);
    
    if (index > -1) {
        likedVents.splice(index, 1);
    } else {
        likedVents.push(ventId);
    }
    
    localStorage.setItem('likedVents', JSON.stringify(likedVents));
    renderVents();
}

// ===================================
// RENDER VENTS
// ===================================
function renderVents() {
    const container = document.getElementById('vents-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    ventData.forEach(vent => {
        const isLiked = likedVents.includes(vent.id);
        const displayReactions = isLiked ? vent.reactions + 1 : vent.reactions;
        
        const ventCard = document.createElement('div');
        ventCard.className = 'vent-card fade-in';
        
        ventCard.innerHTML = `
            <div class="vent-header">
                <div class="vent-emoji">${vent.emoji}</div>
                <div class="vent-content">
                    <div class="vent-meta">
                        <span class="vent-category">${vent.category}</span>
                        <span>•</span>
                        <span class="vent-time">
                            <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${vent.time}
                        </span>
                    </div>
                    <p class="vent-text">"${vent.text}"</p>
                    <div class="vent-actions">
                        <button class="like-button ${isLiked ? 'liked' : ''}" onclick="toggleLike(${vent.id})">
                            <svg class="heart-icon" viewBox="0 0 24 24" fill="${isLiked ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            ${displayReactions}
                        </button>
                        <div class="vent-comment">
                            <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            "${vent.comment}"
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(ventCard);
    });
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('MyMindSpace loaded successfully!');
    
    // Render vents
    renderVents();
    
    // Start testimonial rotation
    setInterval(rotateTestimonials, 4000);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Smooth scroll for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// ===================================
// LOG PAGE VIEWS (Optional Analytics)
// ===================================
console.log('Page loaded at:', new Date().toLocaleString());
