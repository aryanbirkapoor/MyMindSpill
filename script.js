// =====================================
// FIREBASE DATABASE (initialized in index.html)
// =====================================
let ventData = [];

// =====================================
// LOAD VENTS FROM FIREBASE (REAL-TIME)
// =====================================
function loadVents() {
    db.collection('vents')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        ventData = [];
        let totalReactions = 0;
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            ventData.push({
                id: doc.id,
                ...data
            });
            totalReactions += data.reactions || 0;
        });
        
        // Update stats
        const totalVentsDisplay = document.getElementById('total-vents-display');
        if (totalVentsDisplay) {
            totalVentsDisplay.textContent = `${ventData.length} people`;
        }
        
        renderVents();
    }, (error) => {
        console.error('Error loading vents:', error);
    });
}

// =====================================
// TESTIMONIALS ROTATION
// =====================================
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

// =====================================
// STICKY HEADER
// =====================================
let lastScrollTop = 0;

function handleScroll() {
    const header = document.getElementById('sticky-header');
    if (!header) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 600) {
        if (scrollTop > lastScrollTop) {
            header.classList.remove('header-visible');
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
    } else {
        header.classList.add('header-hidden');
    }
    
    lastScrollTop = scrollTop;
}

// =====================================
// USER ID
// =====================================
function getUserId() {
    let userId = localStorage.getItem('mymindspill-userId');
    if (!userId) {
        userId = 'user-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('mymindspill-userId', userId);
    }
    return userId;
}

// =====================================
// MODERATION - BAD WORD FILTER
// =====================================
const bannedWords = [
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell', 'cunt', 'dick', 'pussy', 
    'bastard', 'slut', 'whore', 'fag', 'faggot', 'nigger', 'nigga', 'retard', 
    'rape', 'kill yourself', 'kys', 'suicide', 'kill', 'murder', 'bomb', 
    'terrorist', 'nazi', 'hitler', 'violence', 'drugs', 'cocaine', 'meth'
];

function containsBadWords(text) {
    const lowerText = text.toLowerCase();
    // Allow common swear words in vents, but block hate speech and violence
    const blockedWords = ['nigger', 'nigga', 'fag', 'faggot', 'rape', 'kill yourself', 'kys', 'bomb', 'terrorist', 'nazi'];
    return blockedWords.some(word => lowerText.includes(word));
}

// =====================================
// RATE LIMITING
// =====================================
let lastCommentTime = {};
let lastVentTime = 0;

function canComment(ventId) {
    const now = Date.now();
    const lastTime = lastCommentTime[ventId] || 0;
    const timeSinceLastComment = now - lastTime;
    
    if (timeSinceLastComment < 30000) {
        const secondsLeft = Math.ceil((30000 - timeSinceLastComment) / 1000);
        alert(`⏰ Please wait ${secondsLeft} seconds before commenting again.`);
        return false;
    }
    
    lastCommentTime[ventId] = now;
    return true;
}

function canPostVent() {
    const now = Date.now();
    const timeSinceLastVent = now - lastVentTime;
    
    if (timeSinceLastVent < 60000) {
        const secondsLeft = Math.ceil((60000 - timeSinceLastVent) / 1000);
        alert(`⏰ Please wait ${secondsLeft} seconds before posting another vent.`);
        return false;
    }
    
    lastVentTime = now;
    return true;
}

// =====================================
// SUBMISSION FORM
// =====================================
function showSubmissionForm() {
    const formHTML = `
        <div id="submission-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;" onclick="closeFormIfClickedOutside(event)">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 30px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; margin: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: white; font-size: 24px; font-weight: bold; margin: 0;">Share Your Mind 🧠</h2>
                    <button onclick="closeSubmissionForm()" style="background: none; border: none; color: white; font-size: 32px; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: white;">Choose Emoji</label>
                        <select id="vent-emoji" style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; font-size: 24px;">
                            <option value="😤">😤 Frustrated</option>
                            <option value="💔">💔 Heartbroken</option>
                            <option value="😢">😢 Sad</option>
                            <option value="😰">😰 Anxious</option>
                            <option value="😡">😡 Angry</option>
                            <option value="🙃">🙃 Confused</option>
                            <option value="😔">😔 Disappointed</option>
                            <option value="😞">😞 Worried</option>
                            <option value="😩">😩 Exhausted</option>
                            <option value="🤯">🤯 Overwhelmed</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: white;">Category</label>
                        <select id="vent-category" style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; font-size: 16px;">
                            <option value="Work">Work</option>
                            <option value="Relationships">Relationships</option>
                            <option value="Loneliness">Loneliness</option>
                            <option value="Money">Money</option>
                            <option value="Life">Life</option>
                            <option value="Family">Family</option>
                            <option value="Health">Health</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: white;">Your Vent (Anonymous)</label>
                        <textarea
                            id="vent-text"
                            placeholder="Let it all out... no one will know it's you"
                            style="width: 100%; padding: 15px; border-radius: 10px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; min-height: 120px; font-size: 16px; resize: vertical; font-family: inherit;"
                            maxlength="500"
                            oninput="updateCharCount()"
                        ></textarea>
                        <div style="text-align: right; font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 5px;">
                            <span id="char-count">0/500</span>
                        </div>
                    </div>

                    <button
                        onclick="submitVent()"
                        style="width: 100%; background: rgba(255,255,255,0.9); color: #667eea; padding: 15px; border-radius: 10px; border: none; font-weight: bold; font-size: 18px; cursor: pointer; transition: all 0.3s;"
                        onmouseover="this.style.background='white'"
                        onmouseout="this.style.background='rgba(255,255,255,0.9)'"
                    >
                        📤 Post Anonymously
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
}

function closeFormIfClickedOutside(event) {
    if (event.target.id === 'submission-overlay') {
        closeSubmissionForm();
    }
}

function closeSubmissionForm() {
    const overlay = document.getElementById('submission-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function updateCharCount() {
    const textarea = document.getElementById('vent-text');
    const counter = document.getElementById('char-count');
    if (textarea && counter) {
        counter.textContent = `${textarea.value.length}/500`;
    }
}

function submitVent() {
    if (!canPostVent()) return;
    
    const emoji = document.getElementById('vent-emoji').value;
    const category = document.getElementById('vent-category').value;
    const text = document.getElementById('vent-text').value.trim();
    
    if (!text) {
        alert('❌ Please write your vent!');
        return;
    }
    
    if (text.length < 10) {
        alert('❌ Vent too short. Please write at least 10 characters.');
        return;
    }
    
    if (containsBadWords(text)) {
        alert('❌ Your vent contains harmful language. Please be respectful.');
        return;
    }
    
    // ADD TO FIREBASE
    db.collection('vents').add({
        emoji: emoji,
        category: category,
        text: text,
        timestamp: Date.now(),
        reactions: 0,
        comments: [],
        likedBy: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        closeSubmissionForm();
        alert('✅ Your vent has been posted anonymously! 💙');
    })
    .catch((error) => {
        console.error('Error posting vent:', error);
        alert('❌ Error posting vent. Please try again.');
    });
}

// =====================================
// LIKE FUNCTIONALITY
// =====================================
function toggleLike(ventId) {
    const userId = getUserId();
    const vent = ventData.find(v => v.id === ventId);
    
    if (!vent) return;
    
    const likedBy = vent.likedBy || [];
    const hasLiked = likedBy.includes(userId);
    
    if (hasLiked) {
        db.collection('vents').doc(ventId).update({
            reactions: firebase.firestore.FieldValue.increment(-1),
            likedBy: firebase.firestore.FieldValue.arrayRemove(userId)
        });
    } else {
        db.collection('vents').doc(ventId).update({
            reactions: firebase.firestore.FieldValue.increment(1),
            likedBy: firebase.firestore.FieldValue.arrayUnion(userId)
        });
    }
}

// =====================================
// COMMENT FUNCTIONALITY
// =====================================
let activeCommentSection = null;

function toggleComments(ventId) {
    if (activeCommentSection === ventId) {
        activeCommentSection = null;
    } else {
        activeCommentSection = ventId;
    }
    renderVents();
}

function addComment(ventId) {
    if (!canComment(ventId)) return;
    
    const input = document.getElementById(`comment-input-${ventId}`);
    const commentText = input.value.trim();
    
    if (!commentText) {
        alert('❌ Please write a comment first!');
        return;
    }
    
    if (commentText.length < 3) {
        alert('❌ Comment too short. Please write at least 3 characters.');
        return;
    }
    
    if (commentText.length > 200) {
        alert('❌ Comment too long. Maximum 200 characters.');
        return;
    }
    
    if (containsBadWords(commentText)) {
        alert('❌ Your comment contains harmful language. Please be respectful.');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        text: commentText,
        timestamp: Date.now(),
        reported: false
    };
    
    db.collection('vents').doc(ventId).update({
        comments: firebase.firestore.FieldValue.arrayUnion(newComment)
    })
    .then(() => {
        input.value = '';
        alert('✅ Comment posted successfully!');
    })
    .catch((error) => {
        console.error('Error posting comment:', error);
        alert('❌ Error posting comment. Please try again.');
    });
}

function reportComment(ventId, commentId) {
    db.collection('reports').add({
        ventId: ventId,
        commentId: commentId,
        timestamp: Date.now(),
        reportedAt: new Date().toLocaleString()
    })
    .then(() => {
        alert('✅ Comment reported. Thank you for keeping our community safe!');
    })
    .catch((error) => {
        console.error('Error reporting comment:', error);
        alert('❌ Error reporting comment. Please try again.');
    });
}

// =====================================
// GET TIME AGO
// =====================================
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// =====================================
// RENDER VENTS
// =====================================
function renderVents() {
    const container = document.getElementById('vents-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const userId = getUserId();
    
    if (ventData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #ccc; grid-column: 1/-1;">
                <p style="font-size: 20px; margin-bottom: 20px;">No vents yet. Be the first to share! 🌟</p>
                <button onclick="showSubmissionForm()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 30px; border: none; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 16px;">
                    Share Your Mind
                </button>
            </div>
        `;
        return;
    }
    
    ventData.forEach(vent => {
        const hasLiked = (vent.likedBy || []).includes(userId);
        const showComments = activeCommentSection === vent.id;
        const comments = vent.comments || [];
        
        const ventCard = document.createElement('div');
        ventCard.className = 'vent-card fade-in';
        
        ventCard.innerHTML = `
            <div class="vent-header">
                <div class="vent-emoji">${vent.emoji}</div>
                <div class="vent-content">
                    <div class="vent-meta">
                        <span class="vent-category">${vent.category}</span>
                        <span>•</span>
                        <span class="vent-time">${getTimeAgo(vent.timestamp)}</span>
                    </div>
                    <p class="vent-text">${vent.text}</p>
                    <div class="vent-actions">
                    <button class="like-button ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${vent.id}')">
                        <svg class="comment-icon" viewBox="0 0 24 24" fill="${hasLiked ? 'currentColor' : 'none'}" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        ${vent.reactions || 0}
                    </button>
                    
                    <button class="comment-button" onclick="toggleComments('${vent.id}')">
                        <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        ${comments.length}
                    </button>
                </div>
                
                ${showComments ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <input 
                                type="text" 
                                id="comment-input-${vent.id}"
                                placeholder="Write a supportive comment... (3-200 chars)"
                                style="flex: 1; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 14px;"
                                onkeypress="if(event.key==='Enter') addComment('${vent.id}')"
                                maxlength="200"
                            />
                            <button 
                                onclick="addComment('${vent.id}')"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: bold; white-space: nowrap;"
                            >
                                Send
                            </button>
                        </div>
                        
                        ${comments.length === 0 ? `
                            <p style="text-align: center; color: rgba(255,255,255,0.5); font-size: 14px; padding: 20px;">
                                No comments yet. Be the first to share support! 💙
                            </p>
                        ` : ''}
                        
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${comments.map(comment => `
                                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                                    <p style="margin: 0 0 8px 0; color: white; font-size: 14px; word-wrap: break-word;">${comment.text}</p>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-size: 12px; color: rgba(255,255,255,0.5);">${getTimeAgo(comment.timestamp)}</span>
                                        <button 
                                            onclick="reportComment('${vent.id}', ${comment.id})"
                                            style="background: none; border: none; color: rgba(255,100,100,0.5); font-size: 11px; cursor: pointer; padding: 5px;"
                                        >
                                            🚩 Report
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    container.appendChild(ventCard);
});
// =====================================
// SCROLL ANIMATIONS
// =====================================
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

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// =====================================
// SMOOTH SCROLL
// =====================================
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

// =====================================
// INITIALIZATION
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('MyMindSpill with Firebase loaded! 🚀');
    console.log('Database connected and ready.');
    
    // Load vents from Firebase
    loadVents();
    
    // Start testimonial rotation
    setInterval(rotateTestimonials, 4000);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
});