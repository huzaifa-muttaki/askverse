// ========================================
// ASKVERSE - Production JavaScript with Firebase
// ========================================

// Utility Functions
const utils = {
  showNotification: function(message, type = 'success') {
    const notification = document.createElement('div');
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };
    const icon = icons[type] || icons.info;
    
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span style="font-size: 18px; font-weight: bold;">${icon}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  escapeHTML: function(str = '') {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  },

  formatTimestamp: function(timestamp) {
    if (!timestamp) return 'Just now';
    const now = Date.now();
    const diff = now - (timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
};

// Modal Functions
function openModal() {
  const modal = document.getElementById('askModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('askModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Askverse loaded successfully!');
  
  initializeModals();
  initializeActionButtons();
  initializeFollowButtons();
  initializeTabs();
  initializeFilters();
  initializeSearch();
  initializeKeyboardShortcuts();
});

// Initialize Modal Functionality
function initializeModals() {
  const modal = document.getElementById('askModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
  }
}

// Initialize Action Buttons (Like, Comment, Share, Bookmark)
function initializeActionButtons() {
  const actionBtns = document.querySelectorAll('.action-btn');
  
  actionBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent card click
      const svg = this.querySelector('svg');
      if (!svg) return;

      const path = svg.querySelector('path');
      if (!path) return;

      const pathData = path.getAttribute('d') || '';
      
      if (pathData.includes('M14 10h4.764')) {
        handleLikeButton(this);
      } else if (pathData.includes('M5 5a2')) {
        handleBookmarkButton(this);
      } else if (pathData.includes('M8.684')) {
        handleShareButton(this);
      }
    });
  });
}

// Handle Like Button
function handleLikeButton(btn) {
  const isLiked = btn.style.color === 'rgb(0, 224, 199)' || btn.style.color === 'var(--av-accent)';
  const span = btn.querySelector('span');
  
  if (isLiked) {
    btn.style.color = '';
    if (span && span.textContent) {
      const count = parseInt(span.textContent);
      span.textContent = count - 1;
    }
  } else {
    btn.style.color = 'var(--av-accent)';
    btn.style.animation = 'pulse 0.3s ease';
    if (span && span.textContent) {
      const count = parseInt(span.textContent);
      span.textContent = count + 1;
    }
    setTimeout(() => btn.style.animation = '', 300);
  }
}

// Handle Bookmark Button
function handleBookmarkButton(btn) {
  const path = btn.querySelector('path');
  const isBookmarked = path.getAttribute('fill') && path.getAttribute('fill') !== 'none';
  
  if (isBookmarked) {
    path.setAttribute('fill', 'none');
    btn.style.color = '';
    utils.showNotification('Removed from saved', 'info');
  } else {
    path.setAttribute('fill', 'currentColor');
    btn.style.color = 'var(--av-accent)';
    btn.style.animation = 'pulse 0.3s ease';
    utils.showNotification('Saved! 📌', 'success');
    setTimeout(() => btn.style.animation = '', 300);
  }
}

// Handle Share Button
function handleShareButton(btn) {
  const url = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: url
    }).then(() => {
      utils.showNotification('Shared successfully!', 'success');
    }).catch(() => {
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

// Copy to Clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      utils.showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// Fallback Copy Method
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    utils.showNotification('Link copied to clipboard!', 'success');
  } catch (err) {
    utils.showNotification('Failed to copy link', 'error');
  }
  
  document.body.removeChild(textArea);
}

// Initialize Follow Buttons
function initializeFollowButtons() {
  const followBtns = document.querySelectorAll('.follow-btn');
  
  followBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isFollowing = this.textContent.trim() === 'Following';
      
      if (isFollowing) {
        this.textContent = 'Follow';
        utils.showNotification('Unfollowed', 'info');
      } else {
        this.textContent = 'Following';
        utils.showNotification('You are now following this expert! ✨', 'success');
      }
    });
  });
}

// Initialize Tab Functionality
function initializeTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// Initialize Filter Functionality
function initializeFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filterType = this.textContent.trim();
      utils.showNotification(`Showing ${filterType} leaderboard`, 'info');
    });
  });
}

// Initialize Search Functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm.length < 2) return;
      
      searchTimeout = setTimeout(() => {
        console.log('Searching for:', searchTerm);
        // TODO: Implement actual search with Firebase
      }, 300);
    });

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        this.value = '';
        this.blur();
      }
    });
  }
}

// Initialize Keyboard Shortcuts
function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }

    if (e.key === 'n' && !isTyping()) {
      e.preventDefault();
      openModal();
    }
  });
}

// Check if user is typing in an input
function isTyping() {
  const activeElement = document.activeElement;
  return activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );
}

// Make post cards clickable (except for buttons)
document.addEventListener('DOMContentLoaded', function() {
  const postCards = document.querySelectorAll('.post-card');
  
  postCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.action-btn') || 
          e.target.closest('button') || 
          e.target.closest('a')) {
        return;
      }
      
      window.location.href = 'question-detail.html';
    });
    
    card.style.cursor = 'pointer';
  });
});

// ========================================
// FIREBASE FUNCTIONS
// ========================================

// Load Questions Feed
async function loadFeed() {
  const feed = document.getElementById('feed');
  if (!feed) return;

  try {
    feed.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    const db = window._db;
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Import Firestore functions dynamically
    const { collection, query, orderBy, getDocs } = await import(
      'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js'
    );

    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    feed.innerHTML = '';

    if (snapshot.empty) {
      feed.innerHTML = '<div class="card"><p style="text-align:center;color:var(--av-muted)">No questions yet. Be the first to ask!</p></div>';
      return;
    }

    for (const docSnap of snapshot.docs) {
      const question = docSnap.data();
      const card = createQuestionCard(docSnap.id, question);
      feed.appendChild(card);
    }

    // Re-initialize action buttons for new cards
    initializeActionButtons();

  } catch (error) {
    console.error('Error loading feed:', error);
    feed.innerHTML = '<div class="card"><p style="color:var(--av-danger)">Failed to load questions. Please refresh.</p></div>';
  }
}

// Create Question Card Element
function createQuestionCard(id, question) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.questionId = id;

  const tagsHTML = (question.tags || [])
    .map(tag => `<span class="tag">#${utils.escapeHTML(tag)}</span>`)
    .join('');

  card.innerHTML = `
    <div class="post-header">
      <div class="post-author">
        <div class="avatar-medium">
          ${question.authorEmail ? question.authorEmail.substring(0, 2).toUpperCase() : 'AN'}
        </div>
        <div>
          <div class="author-info">
            <span class="author-name">${utils.escapeHTML(question.authorEmail || 'Anonymous')}</span>
          </div>
          <span class="post-time">${utils.formatTimestamp(question.createdAt)}</span>
        </div>
      </div>
      ${question.bounty > 0 ? `
        <div class="bounty-badge">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          ${question.bounty} credits
        </div>
      ` : ''}
    </div>

    <div class="post-content">
      <h3 class="post-title">${utils.escapeHTML(question.title)}</h3>
      ${question.body ? `<p style="color:var(--av-muted);margin:8px 0;">${utils.escapeHTML(question.body)}</p>` : ''}
      <div class="post-tags">${tagsHTML}</div>
    </div>

    <div class="post-actions">
      <button class="action-btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
        </svg>
        <span>${question.upvotes || 0}</span>
      </button>
      <button class="action-btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <span>${question.answerCount || 0} answers</span>
      </button>
      <button class="action-btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
        </svg>
      </button>
      <button class="action-btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
        </svg>
      </button>
    </div>
  `;

  return card;
}

// Post Question (Modal Form)
async function postQuestion(formData) {
  try {
    const auth = window._auth;
    const db = window._db;

    if (!auth.currentUser) {
      utils.showNotification('Please log in to post a question', 'error');
      return;
    }

    const { collection, addDoc, serverTimestamp } = await import(
      'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js'
    );

    await addDoc(collection(db, 'questions'), {
      title: formData.title,
      body: formData.body || '',
      tags: formData.tags,
      bounty: formData.bounty || 0,
      authorUid: auth.currentUser.uid,
      authorEmail: auth.currentUser.email,
      createdAt: serverTimestamp(),
      upvotes: 0,
      answerCount: 0
    });

    utils.showNotification('Question posted successfully! 🎉', 'success');
    closeModal();
    await loadFeed();

  } catch (error) {
    console.error('Error posting question:', error);
    utils.showNotification('Failed to post question', 'error');
  }
}

// Expose functions globally
window.utils = utils;
window.openModal = openModal;
window.closeModal = closeModal;
window.loadFeed = loadFeed;
window.postQuestion = postQuestion;