let ALL_LEVELS_DATA = null;
let VALID_WORDS = new Set();
let currentLevel = 1;
let isRomajiVisible = false; // Default: OFF

// PEMETAAN ROMAJI
const ROMAJI_MAP = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': '(stop)'
};

const DECK_DATA = {
    3: ['ん','い','う','え','あ','し','た','の','る','か','て'],
    2: ['さ','と','na','も','こ','は','ま','ya','yo','き'],
    1: ['り','お','く','가','ぎ','ぐ','ご','ba','pa','ふ','ひ','へ','ほ','わ','ち','つ']
};

let deck = []; let hand = []; let selectedLetters = [];
let timeLeft = 90; let yokaiHP = 100; let gameActive = false;
let timerInt = null;
let hasUsedHintThisLevel = false;

// FUNGSI TOGGLE ROMAJI
function toggleRomaji() {
    isRomajiVisible = !isRomajiVisible;
    const btn = document.getElementById('romaji-toggle-btn');
    btn.innerText = `Romaji: ${isRomajiVisible ? 'ON' : 'OFF'}`;
    
    // Update semua elemen kartu secara real-time
    renderHand();
    renderWordZone();
    renderSupportButtons();
}

async function loadDatabase() {
    try {
        const res = await fetch('database.json');
        const data = await res.json();
        ALL_LEVELS_DATA = data.levels;
        renderSupportButtons(); // Inisialisasi awal
        initLevel(currentLevel);
    } catch (e) { console.error("Database error", e); }
}

function buildDeck() {
    deck = [];
    for (let n in DECK_DATA) {
        DECK_DATA[n].forEach(c => { for(let i=0; i < parseInt(n); i++) deck.push(c); });
    }
    shuffle(deck);
}

function initLevel(level) {
    currentLevel = level;
    const data = ALL_LEVELS_DATA[level];
    if(!data) return;

    VALID_WORDS = new Set(data.words);
    yokaiHP = 100; timeLeft = 90; hand = []; selectedLetters = [];
    hasUsedHintThisLevel = false;
    
    const hintBtn = document.getElementById('hint-btn');
    if(hintBtn) {
        hintBtn.disabled = false;
        hintBtn.innerText = "Onmyouroku";
        hintBtn.style.opacity = "1";
    }

    const banner = document.getElementById('level-banner');
    if(banner) banner.innerText = `Level ${level} (${data.category})`;
    
    document.getElementById('modal-overlay').style.display = 'none';
    
    buildDeck();
    drawCards();
    updateUI();
    if (!gameActive) { gameActive = true; startTimer(); }
}

function startTimer() {
    if(timerInt) clearInterval(timerInt);
    timerInt = setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft--; updateUI();
            if (timeLeft <= 0) { gameActive = false; showEndModal(false); }
        }
    }, 1000);
}

function updateUI() {
    const fill = document.getElementById('hp-fill');
    if (fill) fill.style.width = yokaiHP + "%";
    document.getElementById('time-val').innerText = timeLeft;
    document.getElementById('deck-val').innerText = deck.length;
}

function confirmWord() {
    const word = selectedLetters.join('');
    if (VALID_WORDS.has(word)) {
        // Damage minimal 5 hit neko (100 HP / (2 huruf * 10 dmg) = 5 hit)
        yokaiHP = Math.max(0, yokaiHP - (word.length * 10));
        const main = selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c));
        deck.push(...main); 
        shuffle(deck);
        selectedLetters = []; 
        drawCards(); 
        if (yokaiHP <= 0) { gameActive = false; showEndModal(true); }
    } else {
        timeLeft = Math.max(0, timeLeft - 5);
        showFlashError();
        clearWord();
    }
    renderWordZone();
    updateUI();
}

function showFlashError() {
    const timerSection = document.querySelector('.timer-section');
    if(timerSection) {
        timerSection.style.color = "#ff4d4d";
        timerSection.style.transform = "scale(1.2)";
        setTimeout(() => {
            timerSection.style.color = "white";
            timerSection.style.transform = "scale(1)";
        }, 500);
    }
}

function shuffleDeck() {
    if (timeLeft <= 3) return;
    timeLeft -= 3;
    showFlashError();
    const main = hand.concat(selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c)));
    deck.push(...main); hand = []; selectedLetters = [];
    shuffle(deck); drawCards(); renderWordZone(); updateUI();
}

function drawCards() {
    while (hand.length < 7 && deck.length >= 7) {
        let trial = deck.slice(0, 7);
        if (canFormWord(trial) || deck.length < 14) {
            hand.push(...deck.splice(0, 7 - hand.length));
            break;
        }
        shuffle(deck);
    }
    renderHand();
}

function canFormWord(test) {
    for (let w of VALID_WORDS) {
        let t = [...test]; let m = 0;
        for (let c of w) {
            let i = t.indexOf(c);
            if (i !== -1) { m++; t[i] = null; }
        }
        if (m === w.length) return true;
    }
    return false;
}

// RENDER HAND
function renderHand() {
    const el = document.getElementById('player-hand');
    if (!el) return;
    el.innerHTML = '';
    const hiddenClass = isRomajiVisible ? '' : 'hidden'; 
    
    hand.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="kana">${c}</div>
            <div class="romaji ${hiddenClass}">${ROMAJI_MAP[c] || ''}</div>
        `;
        card.onclick = () => {
            if (selectedLetters.length < 5) {
                selectedLetters.push(hand.splice(i, 1)[0]);
                renderHand(); renderWordZone();
            }
        };
        el.appendChild(card);
    });
}

// RENDER FIELD / WORD ZONE
function renderWordZone() {
    const slots = document.querySelectorAll('.letter-slot');
    const hiddenClass = isRomajiVisible ? '' : 'hidden';

    slots.forEach((s, i) => {
        const char = selectedLetters[i];
        if (char) {
            s.innerHTML = `
                <div class="kana-small">${char}</div>
                <div class="romaji-tiny ${hiddenClass}">${ROMAJI_MAP[char] || ''}</div>
            `;
            s.classList.add('active');
        } else {
            s.innerHTML = "";
            s.classList.remove('active');
        }
    });
    document.getElementById('confirm-btn').disabled = selectedLetters.length < 2;
}

// RENDER KARTU BANTU
function renderSupportButtons() {
    const container = document.getElementById('support-container');
    const supports = ['ゃ', 'ゅ', 'ょ', 'っ'];
    const hiddenClass = isRomajiVisible ? '' : 'hidden';

    container.innerHTML = '';
    supports.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'btn-support';
        btn.innerHTML = `
            <span>${s}</span>
            <span class="romaji-support ${hiddenClass}">${ROMAJI_MAP[s] || ''}</span>
        `;
        btn.onclick = () => addSupport(s);
        container.appendChild(btn);
    });
}

function showHint() {
    if (hasUsedHintThisLevel) return;
    const cards = document.querySelectorAll('.hand .card');
    VALID_WORDS.forEach(w => {
        let t = [...hand]; let match = [];
        for (let c of w) {
            let idx = t.indexOf(c);
            if (idx !== -1) { match.push(idx); t[idx] = null; }
            else { match = []; break; }
        }
        match.forEach(idx => { if(cards[idx]) cards[idx].classList.add('hint-glow'); });
    });
    hasUsedHintThisLevel = true;
    const hintBtn = document.getElementById('hint-btn');
    if(hintBtn) {
        hintBtn.disabled = true;
        hintBtn.innerText = "Sudah Digunakan";
        hintBtn.style.opacity = "0.5";
    }
    setTimeout(() => { cards.forEach(c => c.classList.remove('hint-glow')); }, 3000);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function clearWord() {
    selectedLetters.forEach(c => { if (!['ゃ','ゅ','ょ','っ'].includes(c)) hand.push(c); });
    selectedLetters = []; renderHand(); renderWordZone();
}

function addSupport(c) {
    if (selectedLetters.length < 5) {
        selectedLetters.push(c);
        renderWordZone();
    }
}

function showEndModal(isWin) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    overlay.style.display = 'flex';
    title.innerText = isWin ? "RITUAL BERHASIL!" : "RITUAL GAGAL!";
    title.style.color = isWin ? "#d4af37" : "#ff4d4d";
    document.getElementById('btn-prev').style.display = (currentLevel > 1) ? "block" : "none";
    document.getElementById('btn-next').style.display = (isWin && currentLevel < 10) ? "block" : "none";
}

function changeLevel(delta) { currentLevel += delta; initLevel(currentLevel); }
function retryLevel() { initLevel(currentLevel); }

window.onload = loadDatabase;
