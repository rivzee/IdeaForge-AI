// ============================================
// AI PROJECT IDEA GENERATOR — Script v2.0
// ============================================

const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const charCounter = document.getElementById('char-counter');

// Sidebar Elements
const sidebar = document.getElementById('sidebar');
const newChatBtn = document.getElementById('new-chat-btn');
const historyList = document.getElementById('history-list');
const historyCount = document.getElementById('history-count');
const deleteAllBtn = document.getElementById('delete-all-btn');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mobileOverlay = document.getElementById('mobile-overlay');
const searchInput = document.getElementById('search-history');

// State
const STORAGE_KEY = 'ideaforge_sessions_v2';
let sessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentSessionId = null;

// --- Suggestion Pool (15 ide acak) ---
const SUGGESTION_POOL = [
    { icon: 'fa-cart-shopping', title: 'E-Commerce Cerdas', desc: 'Rekomendasi produk AI', prompt: 'Aplikasi e-commerce dengan sistem rekomendasi produk berbasis AI dan machine learning' },
    { icon: 'fa-leaf', title: 'Deteksi Penyakit Tanaman', desc: 'Computer Vision & CNN', prompt: 'Sistem pendeteksi penyakit tanaman dari foto daun menggunakan Computer Vision dan Deep Learning CNN' },
    { icon: 'fa-chart-line', title: 'IoT Dashboard', desc: 'Real-time monitoring', prompt: 'Dashboard analitik real-time untuk monitoring IoT sensor suhu dan kelembaban menggunakan MQTT dan WebSocket' },
    { icon: 'fa-graduation-cap', title: 'LMS Kampus', desc: 'Platform belajar online', prompt: 'Learning Management System untuk kampus dengan fitur video conference, quiz otomatis, dan tracking progress mahasiswa' },
    { icon: 'fa-hospital', title: 'Telemedicine App', desc: 'Konsultasi dokter online', prompt: 'Aplikasi telemedicine untuk konsultasi dokter online dengan fitur chat, video call, dan resep digital' },
    { icon: 'fa-robot', title: 'Chatbot CS AI', desc: 'Customer service otomatis', prompt: 'Chatbot customer service berbasis NLP yang bisa memahami bahasa Indonesia dan menjawab pertanyaan pelanggan secara otomatis' },
    { icon: 'fa-shield-halved', title: 'Cyber Security Tool', desc: 'Deteksi ancaman jaringan', prompt: 'Aplikasi monitoring keamanan jaringan yang mendeteksi ancaman dan serangan siber secara real-time menggunakan machine learning' },
    { icon: 'fa-utensils', title: 'Food Waste Tracker', desc: 'Kurangi pemborosan makanan', prompt: 'Aplikasi tracking food waste untuk restoran dan rumah tangga yang menggunakan AI untuk memprediksi kebutuhan bahan makanan' },
    { icon: 'fa-map-location-dot', title: 'Smart Tourism', desc: 'Wisata cerdas berbasis AR', prompt: 'Aplikasi wisata cerdas dengan augmented reality, rekomendasi tempat berbasis lokasi, dan panduan wisata AI' },
    { icon: 'fa-truck-fast', title: 'Sistem Logistik', desc: 'Optimasi rute pengiriman', prompt: 'Sistem manajemen logistik dengan optimasi rute pengiriman menggunakan algoritma A* dan tracking real-time' },
    { icon: 'fa-dna', title: 'Health Monitoring', desc: 'Wearable kesehatan AI', prompt: 'Aplikasi health monitoring yang terhubung dengan wearable device untuk memantau detak jantung, tidur, dan aktivitas fisik' },
    { icon: 'fa-money-bill-trend-up', title: 'FinTech Budgeting', desc: 'Manajemen keuangan AI', prompt: 'Aplikasi fintech untuk budgeting dan manajemen keuangan pribadi dengan analisis pengeluaran otomatis menggunakan AI' },
    { icon: 'fa-solar-panel', title: 'Smart Energy', desc: 'Monitor energi terbarukan', prompt: 'Sistem monitoring energi terbarukan untuk panel surya dengan prediksi output energi menggunakan machine learning' },
    { icon: 'fa-building-columns', title: 'Smart Parking', desc: 'Parkir cerdas IoT', prompt: 'Sistem smart parking berbasis IoT dengan deteksi slot kosong otomatis, pembayaran digital, dan navigasi indoor' },
    { icon: 'fa-language', title: 'Translator Real-time', desc: 'Terjemahan bahasa daerah', prompt: 'Aplikasi penerjemah bahasa daerah Indonesia real-time menggunakan NLP dan speech recognition untuk melestarikan bahasa lokal' }
];

function getRandomSuggestions(count = 3) {
    const shuffled = [...SUGGESTION_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function buildHeroHTML() {
    const picks = getRandomSuggestions(3);
    const cardsHTML = picks.map(s =>
        `<button class="suggestion-card" data-prompt="${s.prompt}">
            <div class="card-icon"><i class="fa-solid ${s.icon}"></i></div>
            <span class="card-title">${s.title}</span>
            <span class="card-desc">${s.desc}</span>
        </button>`
    ).join('');

    return `
    <div class="hero-screen">
        <span class="hero-badge"><i class="fa-solid fa-sparkles"></i> Powered by Google × Gemini Flash</span>
        <div class="hero-icon-wrap">
            <div class="hero-icon-bg"></div>
            <div class="hero-icon-inner">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
        </div>
        <h2>Apa yang ingin kamu <span class="hero-gradient-text">bangun hari ini?</span></h2>
        <p>Deskripsikan minat, teknologi, atau masalah yang ingin kamu selesaikan, lalu biarkan AI merancangkan idenya untukmu.</p>
        <div class="suggestion-grid">${cardsHTML}</div>
        <div class="hero-stats">
            <div class="stat-item"><div class="stat-value">∞</div><div class="stat-label">Ide Tersedia</div></div>
            <div class="stat-item"><div class="stat-value">&lt;2s</div><div class="stat-label">Waktu Respons</div></div>
            <div class="stat-item"><div class="stat-value">24/7</div><div class="stat-label">Selalu Online</div></div>
        </div>
    </div>`;
}

// --- Utilities ---
function saveSessions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getTimeString() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    if (sessions.length > 0) {
        loadSession(sessions[0].id);
    } else {
        startNewChat();
    }

    // Char counter
    input.addEventListener('input', () => {
        charCounter.textContent = `${input.value.length} / 500`;
    });

    // Suggestion card click delegation
    chatBox.addEventListener('click', (e) => {
        const card = e.target.closest('.suggestion-card');
        if (card && card.dataset.prompt) {
            input.value = card.dataset.prompt;
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt+N = New Chat (Ctrl+N bentrok dengan browser)
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            startNewChat();
        }
        // ? = Show shortcuts (only if not typing in input)
        if (e.key === '?' && document.activeElement !== input) {
            toggleShortcutsModal();
        }
        // Escape = Close shortcuts
        if (e.key === 'Escape') {
            const modal = document.getElementById('shortcuts-modal');
            if (modal.classList.contains('active')) modal.classList.remove('active');
        }
    });

    // Shortcuts modal close
    document.getElementById('shortcuts-close').onclick = () => {
        document.getElementById('shortcuts-modal').classList.remove('active');
    };
    document.querySelector('.shortcuts-backdrop').onclick = () => {
        document.getElementById('shortcuts-modal').classList.remove('active');
    };

    // Search history
    searchInput.addEventListener('input', () => {
        renderSidebar(searchInput.value.toLowerCase());
    });
});

// --- Sidebar ---
function renderSidebar(filter = '') {
    historyList.innerHTML = '';
    const filtered = filter
        ? sessions.filter(s => s.title.toLowerCase().includes(filter))
        : sessions;

    historyCount.textContent = sessions.length;

    if (filtered.length === 0 && filter) {
        historyList.innerHTML = `<div style="padding:16px 10px; color:var(--text-tertiary); font-size:0.8rem; text-align:center;">Tidak ditemukan</div>`;
        return;
    }

    filtered.forEach(sess => {
        const item = document.createElement('div');
        item.className = 'history-item-wrapper';
        if (sess.id === currentSessionId) item.classList.add('active');

        const btn = document.createElement('button');
        btn.className = 'history-item';
        if (sess.id === currentSessionId) btn.classList.add('active');
        btn.innerHTML = `<i class="fa-regular fa-message"></i> <span>${sess.title}</span>`;
        btn.onclick = () => {
            loadSession(sess.id);
            if (window.innerWidth <= 768) toggleSidebar();
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'history-delete-btn';
        delBtn.title = 'Hapus chat ini';
        delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSession(sess.id, item);
        };

        item.appendChild(btn);
        item.appendChild(delBtn);
        historyList.appendChild(item);
    });

    // Update session stats
    if (typeof updateSessionStats === 'function') updateSessionStats();
}

// --- Chat Session Management ---
function startNewChat() {
    currentSessionId = null;
    chatBox.innerHTML = buildHeroHTML();
    renderSidebar();
    input.focus();
}

newChatBtn.onclick = () => {
    startNewChat();
    if (window.innerWidth <= 768) toggleSidebar();
};

function toggleSidebar() {
    sidebar.classList.toggle('open');
    document.querySelector('.main-layout').classList.toggle('sidebar-open');
}
sidebarToggle.onclick = toggleSidebar;
mobileOverlay.onclick = toggleSidebar;

deleteAllBtn.onclick = () => {
    if (confirm('Yakin ingin menghapus semua riwayat chat?')) {
        sessions = [];
        saveSessions();
        startNewChat();
    }
};

// --- Delete Single Session ---
function deleteSession(id, wrapperEl) {
    // Animate out
    if (wrapperEl) {
        wrapperEl.classList.add('removing');
    }

    setTimeout(() => {
        sessions = sessions.filter(s => s.id !== id);
        saveSessions();

        if (currentSessionId === id) {
            // If we deleted the active session, switch
            if (sessions.length > 0) {
                loadSession(sessions[0].id);
            } else {
                startNewChat();
            }
        } else {
            renderSidebar(searchInput.value.toLowerCase());
        }

        showToast('Chat berhasil dihapus', 'success');
        updateSessionStats();
    }, 300);
}

function loadSession(id) {
    currentSessionId = id;
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    chatBox.innerHTML = '';
    session.messages.forEach(msg => {
        const el = buildMessage(msg.sender, msg.html, msg.time, msg.markdown || '');
        chatBox.appendChild(el);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
    renderSidebar();
}

// --- Message Building ---
function buildMessage(sender, contentHTML, time, originalMarkdown = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;

    const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
    const senderLabel = sender === 'user' ? 'Kamu' : 'IdeaForge AI';
    const timeStr = time || getTimeString();

    wrapper.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
        <div class="msg-body">
            <span class="msg-sender">${senderLabel}</span>
            <div class="message-content">${contentHTML}</div>
            <span class="msg-time">${timeStr}</span>
        </div>
    `;

    if (sender === 'bot' && !contentHTML.includes('typing-dots') && !contentHTML.includes('fa-spinner')) {
        const copyText = wrapper.querySelector('.message-content').innerText;
        const renderedHTML = wrapper.querySelector('.message-content').innerHTML;
        const actions = createActionButtons(copyText, renderedHTML, wrapper);
        wrapper.querySelector('.msg-body').appendChild(actions);
    }

    return wrapper;
}

function appendMessage(sender, text, isMarkdown = false) {
    const time = getTimeString();
    const html = (sender === 'bot' && isMarkdown && window.marked)
        ? marked.parse(text) : escapeHtml(text);
    // Simpan markdown asli untuk bot, teks biasa untuk user
    const rawMarkdown = (sender === 'bot' && isMarkdown) ? text : '';

    const el = buildMessage(sender, html, time, rawMarkdown);
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Persist
    if (currentSessionId === null) {
        currentSessionId = Date.now();
        const title = text.length > 30 ? text.substring(0, 30) + '…' : text;
        sessions.unshift({ id: currentSessionId, title, messages: [] });
    }

    const sess = sessions.find(s => s.id === currentSessionId);
    if (sess) {
        sess.messages.push({ sender, html, time, markdown: rawMarkdown, text: text });
        saveSessions();
        renderSidebar();
    }

    return el;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Form Submit ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage('user', userMessage);
    input.value = '';
    charCounter.textContent = '0 / 500';

    // Skeleton Loading + Typing label
    const loadingEl = buildMessage('bot',
        `<div class="typing-indicator">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <span class="typing-label">IdeaForge sedang berpikir...</span>
        </div>
        <div class="skeleton-container">
            <div class="skeleton-line skeleton-heading"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
        </div>`,
        getTimeString()
    );
    chatBox.appendChild(loadingEl);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Dynamic tab title
    document.title = '⏳ Generating... — IdeaForge AI';

    try {
        const sess = sessions.find(s => s.id === currentSessionId);
        let chatHistory = [];
        if (sess && sess.messages.length > 1) { 
            // Ambil semua pesan kecuali yang terakhir (karena yang terakhir adalah pesan user yang baru saja disubmit)
            chatHistory = sess.messages.slice(0, -1).map(m => {
                let msgText = m.text || m.markdown || '';
                if (!msgText && m.html) { // fallback untuk riwayat lama
                    const doc = new DOMParser().parseFromString(m.html, 'text/html');
                    msgText = doc.body.textContent || "";
                }
                return {
                    role: m.sender === 'bot' ? 'model' : 'user',
                    text: msgText
                };
            }).filter(m => m.text.trim() !== '');
        }

        const response = await fetch('/idea-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMessage,
                history: chatHistory
            }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        chatBox.removeChild(loadingEl);

        if (data && data.reply) {
            appendMessage('bot', data.reply, true);
            document.title = '✨ Ide Baru! — IdeaForge AI';
            setTimeout(() => { document.title = 'AI Project Idea Generator — IdeaForge'; }, 3000);
        } else {
            appendMessage('bot', 'Maaf, saya tidak mendapat ide saat ini. Coba ulangi pertanyaanmu.');
            document.title = 'AI Project Idea Generator — IdeaForge';
        }
    } catch (err) {
        console.error('API Error:', err);
        chatBox.removeChild(loadingEl);
        document.title = 'AI Project Idea Generator — IdeaForge';
        const errEl = buildMessage('bot',
            `<span style="color:var(--red-accent)"><i class="fa-solid fa-triangle-exclamation"></i> Gagal terhubung ke server. Pastikan server menyala dan coba lagi.</span>`,
            getTimeString()
        );
        chatBox.appendChild(errEl);
        showToast('Gagal terhubung ke server', 'error');
    }

    chatBox.scrollTop = chatBox.scrollHeight;
});

// --- Action Buttons ---
function createActionButtons(plainText, renderedHTML, botMessageEl) {
    const div = document.createElement('div');
    div.className = 'message-actions';

    // Copy
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Salin';
    copyBtn.onclick = async () => {
        try {
            await navigator.clipboard.writeText(plainText);
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Disalin!';
            showToast('Teks berhasil disalin ke clipboard', 'success');
            setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Salin', 2000);
        } catch(e) {
            showToast('Gagal menyalin teks', 'error');
        }
    };

    // Regenerate
    const regenBtn = document.createElement('button');
    regenBtn.className = 'action-btn regen-btn';
    regenBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Regenerate';
    regenBtn.onclick = () => {
        regenerateResponse(botMessageEl, regenBtn);
    };

    // PDF — menggunakan HTML yang sudah dirender di chat (sama persis)
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'action-btn';
    pdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> PDF';
    pdfBtn.onclick = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const overlay = document.createElement('div');
        overlay.id = 'pdf-render-zone';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:99999; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center;';

        const el = document.createElement('div');
        el.style.cssText = 'width:650px; background:#ffffff; padding:0; font-family: Inter, Segoe UI, sans-serif; color:#222;';

        el.innerHTML =
            // HEADER
            '<div style="background:#4f46e5; padding:22px 28px;">' +
                '<div style="font-size:18px; font-weight:800; color:#fff;">IdeaForge AI</div>' +
                '<div style="font-size:9px; color:rgba(255,255,255,0.7); margin-top:3px;">AI-Powered Project Idea Generator &nbsp;|&nbsp; ' + dateStr + ' &nbsp;|&nbsp; ' + timeStr + ' WIB</div>' +
            '</div>' +

            // CONTENT — HTML sama persis dari chat
            '<div id="pdf-body" style="padding:24px 28px; font-size:13px; line-height:1.8; color:#222;">' +
                '<style>' +
                    '#pdf-body h1, #pdf-body h2, #pdf-body h3 {' +
                        'color: #4f46e5; font-weight: 700; font-size: 14px;' +
                        'margin: 16px 0 6px 0; padding-bottom: 4px;' +
                        'border-bottom: 1px solid #e5e7eb;' +
                    '}' +
                    '#pdf-body h3:first-child { margin-top: 0; }' +
                    '#pdf-body p { margin: 0 0 8px 0; color: #333; }' +
                    '#pdf-body ul, #pdf-body ol { padding-left: 22px; margin: 4px 0 10px 0; }' +
                    '#pdf-body li { margin-bottom: 4px; color: #444; }' +
                    '#pdf-body strong { color: #111; font-weight: 700; }' +
                    '#pdf-body code { background:#eef2ff; padding:1px 4px; border-radius:3px; font-family:Consolas,monospace; font-size:11px; color:#4f46e5; }' +
                    '#pdf-body blockquote { border-left:3px solid #8b5cf6; padding-left:12px; color:#666; margin:8px 0; }' +
                    '#pdf-body em { color:#555; }' +
                '</style>' +
                renderedHTML +
            '</div>' +

            // FOOTER
            '<div style="padding:0 28px 16px 28px; border-top:1px solid #e5e7eb; margin:0 28px;">' +
                '<div style="font-size:8px; color:#999; padding-top:10px;">IdeaForge AI &mdash; Dokumen dihasilkan menggunakan Gemini Flash via Google AI &middot; &copy; ' + now.getFullYear() + '</div>' +
            '</div>';

        overlay.appendChild(el);
        document.body.appendChild(overlay);

        setTimeout(() => {
            if (window.html2pdf) {
                html2pdf().set({
                    margin: 0.3,
                    filename: 'IdeaForge_Ide_Proyek.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                }).from(el).save().then(() => {
                    document.body.removeChild(overlay);
                    showToast('PDF berhasil diunduh', 'success');
                }).catch(() => {
                    document.body.removeChild(overlay);
                    showToast('Gagal mengunduh PDF', 'error');
                });
            } else {
                document.body.removeChild(overlay);
                showToast('Library PDF gagal dimuat', 'error');
            }
        }, 300);
    };

    div.appendChild(copyBtn);
    div.appendChild(regenBtn);
    div.appendChild(pdfBtn);
    return div;
}

// --- Regenerate Response ---
let isRegenerating = false;

async function regenerateResponse(botMessageEl, regenBtn) {
    if (isRegenerating) return;

    // Find the user message that precedes this bot message
    const allMessages = Array.from(chatBox.querySelectorAll('.message'));
    const botIndex = allMessages.indexOf(botMessageEl);
    if (botIndex < 0) return;

    // Find the preceding user message
    let userMessageEl = null;
    let userMessageText = '';
    for (let i = botIndex - 1; i >= 0; i--) {
        if (allMessages[i].classList.contains('user-message')) {
            userMessageEl = allMessages[i];
            userMessageText = allMessages[i].querySelector('.message-content')?.innerText?.trim();
            break;
        }
    }

    if (!userMessageText) {
        showToast('Tidak bisa menemukan pesan asli', 'error');
        return;
    }

    isRegenerating = true;

    // Find the index of this bot message in the session
    const sess = sessions.find(s => s.id === currentSessionId);
    const botMsgIndex = findBotMessageIndex(botIndex);

    // Extract project title from bot response (first h3 heading)
    const botContent = botMessageEl.querySelector('.message-content');
    let projectTitle = '';
    const headings = botContent.querySelectorAll('h3');
    if (headings.length > 0) {
        // Get text after emoji from the first heading (e.g. "🏷️ Nama Proyek" → take next heading's content)
        // Look for the heading that contains the actual project name (usually content after "Nama Proyek" heading)
        for (let i = 0; i < headings.length; i++) {
            const headingText = headings[i].textContent.trim();
            if (headingText.includes('Nama Proyek') || headingText.includes('🏷')) {
                // The project name is usually the text right after this heading
                let nextEl = headings[i].nextElementSibling || headings[i].nextSibling;
                while (nextEl && nextEl.nodeType === 3 && nextEl.textContent.trim() === '') {
                    nextEl = nextEl.nextSibling;
                }
                if (nextEl) {
                    projectTitle = nextEl.textContent?.trim() || '';
                }
                break;
            }
        }
        // Fallback: if no "Nama Proyek" heading found, use first heading text
        if (!projectTitle) {
            projectTitle = headings[0].textContent.replace(/^[^\w\s]+/, '').trim();
        }
    }

    // Fallback: extract from plain text if no heading found
    if (!projectTitle) {
        const plainText = botContent.innerText;
        const nameMatch = plainText.match(/Nama Proyek[:\s]*\n?(.+)/i);
        if (nameMatch) {
            projectTitle = nameMatch[1].trim();
        }
    }

    // Animate the button to show loading
    regenBtn.classList.add('regenerating');
    regenBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Generating...';
    regenBtn.disabled = true;

    // Fade out old content
    const msgContent = botMessageEl.querySelector('.message-content');
    const msgTime = botMessageEl.querySelector('.msg-time');
    const msgActions = botMessageEl.querySelector('.message-actions');
    
    msgContent.classList.add('regen-fade-out');

    // After fade out, show skeleton
    await sleep(300);
    
    msgContent.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <span class="typing-label">Regenerating "${projectTitle || 'ide'}" dengan variasi baru...</span>
        </div>
        <div class="skeleton-container">
            <div class="skeleton-line skeleton-heading"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
        </div>`;
    msgContent.classList.remove('regen-fade-out');
    msgContent.classList.add('regen-fade-in');
    if (msgActions) msgActions.style.display = 'none';

    document.title = '🔄 Regenerating... — IdeaForge AI';

    try {
        // Build request body with regenerate context
        const requestBody = { message: userMessageText };
        if (projectTitle) {
            requestBody.regenerate = true;
            requestBody.projectTitle = projectTitle;
        }

        const response = await fetch('/idea-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (data && data.reply) {
            const newTime = getTimeString();
            const newHTML = window.marked ? marked.parse(data.reply) : escapeHtml(data.reply);

            // Fade out skeleton, then fade in new content
            msgContent.classList.remove('regen-fade-in');
            msgContent.classList.add('regen-fade-out');
            await sleep(250);

            msgContent.innerHTML = newHTML;
            msgContent.classList.remove('regen-fade-out');
            msgContent.classList.add('regen-fade-in');
            msgTime.textContent = newTime + ' (regenerated)';

            // Rebuild action buttons
            if (msgActions) msgActions.remove();
            const newPlainText = msgContent.innerText;
            const newRenderedHTML = msgContent.innerHTML;
            const newActions = createActionButtons(newPlainText, newRenderedHTML, botMessageEl);
            botMessageEl.querySelector('.msg-body').appendChild(newActions);

            // Update session storage
            if (sess && botMsgIndex >= 0 && botMsgIndex < sess.messages.length) {
                sess.messages[botMsgIndex] = {
                    sender: 'bot',
                    html: newHTML,
                    time: newTime + ' (regenerated)',
                    markdown: data.reply,
                    text: data.reply
                };
                saveSessions();
            }

            document.title = '✨ Ide Baru! — IdeaForge AI';
            showToast('Respons berhasil di-regenerate!', 'success');
            setTimeout(() => { document.title = 'AI Project Idea Generator — IdeaForge'; }, 3000);
        } else {
            restoreBotMessage(msgContent, msgActions, 'Maaf, gagal mendapatkan ide baru. Coba lagi.');
            showToast('Gagal regenerate', 'error');
        }
    } catch (err) {
        console.error('Regenerate Error:', err);
        restoreBotMessage(msgContent, msgActions, 
            `<span style="color:var(--red-accent)"><i class="fa-solid fa-triangle-exclamation"></i> Gagal regenerate. Pastikan server menyala.</span>`);
        showToast('Gagal terhubung ke server', 'error');
        document.title = 'AI Project Idea Generator — IdeaForge';
    }

    isRegenerating = false;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function findBotMessageIndex(domBotIndex) {
    // Count how many bot messages appear up to domBotIndex
    const allMessages = Array.from(chatBox.querySelectorAll('.message'));
    let botCount = -1;
    for (let i = 0; i <= domBotIndex && i < allMessages.length; i++) {
        if (allMessages[i].classList.contains('bot-message')) {
            botCount++;
        }
    }
    // Map to session messages array
    const sess = sessions.find(s => s.id === currentSessionId);
    if (!sess) return -1;
    let count = -1;
    for (let i = 0; i < sess.messages.length; i++) {
        if (sess.messages[i].sender === 'bot') {
            count++;
            if (count === botCount) return i;
        }
    }
    return -1;
}

function restoreBotMessage(msgContent, msgActions, fallbackHTML) {
    msgContent.classList.remove('regen-fade-out');
    msgContent.innerHTML = fallbackHTML;
    msgContent.classList.add('regen-fade-in');
    if (msgActions) msgActions.style.display = '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Toast Notification System ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
        success: 'fa-check',
        error: 'fa-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Auto remove after 3s
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Shortcuts Modal ---
function toggleShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    modal.classList.toggle('active');
}

// --- Delete All with Toast ---
deleteAllBtn.onclick = () => {
    if (sessions.length === 0) {
        showToast('Tidak ada riwayat untuk dihapus', 'warning');
        return;
    }
    if (confirm('Hapus semua riwayat chat?')) {
        sessions = [];
        saveSessions();
        startNewChat();
        showToast('Semua riwayat berhasil dihapus', 'success');
        updateSessionStats();
    }
};

// --- Scroll to Bottom Button ---
const scrollBtn = document.getElementById('scroll-bottom-btn');
chatBox.addEventListener('scroll', () => {
    const distFromBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
    if (distFromBottom > 200) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }
});
scrollBtn.onclick = () => {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
};

// --- Session Stats ---
function updateSessionStats() {
    const totalSessions = sessions.length;
    const totalIdeas = sessions.reduce((sum, s) => {
        return sum + s.messages.filter(m => m.sender === 'bot').length;
    }, 0);
    const sessEl = document.getElementById('stat-total-sessions');
    const ideasEl = document.getElementById('stat-total-ideas');
    if (sessEl) sessEl.textContent = totalSessions;
    if (ideasEl) ideasEl.textContent = totalIdeas;
}
updateSessionStats();

// --- 3D Tilt on Suggestion Cards ---
chatBox.addEventListener('mousemove', (e) => {
    const cards = chatBox.querySelectorAll('.suggestion-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const rotateX = ((y / rect.height) - 0.5) * -12;
            const rotateY = ((x / rect.width) - 0.5) * 12;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        }
    });
});
chatBox.addEventListener('mouseleave', () => {
    const cards = chatBox.querySelectorAll('.suggestion-card');
    cards.forEach(card => {
        card.style.transform = '';
    });
});
