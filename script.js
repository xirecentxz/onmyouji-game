let ALL_LEVELS_DATA = null;
let VALID_WORDS = new Set();
let currentLevel = 1;

const DECK_DATA = {
    3: ['ん','い','う','え','あ','し','た','の','る','か','て'],
    2: ['さ','と','な','も','こ','は','ま','や','よ','き'],
    1: ['り','お','く','が','ぎ','ぐ','ご','ば','ぱ','ふ','ひ','へ','ほ','わ','ち','つ']
};

let deck = []; let hand = []; let selectedLetters = [];
let timeLeft = 90; let yokaiHP = 100; let gameActive = false;
let timerInterval = null;

async function loadDatabase() {
    try {
        const res = await fetch('database.json');
        const data = await res.json();
        ALL_LEVELS_DATA = data.levels;
        buildDeck();
        initLevel(currentLevel);
    } catch (e) { console.error("Database Error", e); }
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
    const levelData = ALL_LEVELS_DATA[level];
    if (!levelData) return;

    VALID_WORDS = new Set(levelData.words);
    yokaiHP = 100;
    timeLeft = 90;
    hand = [];
    selectedLetters = [];
    
    // Update Banner Info
    document.getElementById('level-banner').innerText = `Level ${level} (${levelData.category})`;
    document.getElementById('modal-overlay').style.display = 'none';
    
    buildDeck();
    drawCards();
    updateUI();
    
    if (!gameActive) {
        gameActive = true;
        startTimer();
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft--;
            updateUI();
            if (timeLeft <= 0) {
                gameActive = false;
                showEndModal(false);
            }
        }
    }, 1000);
}

function updateUI() {
    document.getElementById('hp-fill').style.width = yokaiHP + "%";
    document.getElementById('time-val').innerText = timeLeft;
    document.getElementById('deck-val').innerText = deck.length;
}

// Fungsi Menang / Kalah
function confirmWord() {
    const word = selectedLetters.join('');
    if (VALID_WORDS.has(word)) {
        yokaiHP = Math.max(0, yokaiHP - (word.length * 25));
        const mainCards = selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c));
        deck.push(...mainCards);
        shuffle(deck);
        selectedLetters = [];
        drawCards();
        renderWordZone();
        
        if (yokaiHP <= 0) {
            gameActive = false;
            showEndModal(true);
        }
    } else {
        clearWord();
    }
    updateUI();
}

function showEndModal(isWin) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    overlay.style.display = 'flex';
    
    if (isWin) {
        title.innerText = "RITUAL BERHASIL!";
        title.style.color = "#d4af37";
        desc.innerText = `Yokai Level ${currentLevel} telah tersegel.`;
    } else {
        title.innerText = "RITUAL GAGAL!";
        title.style.color = "#ff4d4d";
        desc.innerText = "Waktu habis, Yokai menyerangmu.";
    }

    // Navigasi Tombol
    btnPrev.style.display = (currentLevel > 1) ? "block" : "none";
    btnNext.style.display = (isWin && currentLevel < 10) ? "block" : "none";
}

function retryLevel() {
    initLevel(currentLevel);
}

function changeLevel(delta) {
    currentLevel += delta;
    initLevel(currentLevel);
}

// Fungsi pendukung lainnya (drawCards, renderHand, dll) tetap sama
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function drawCards() {
    while (hand.length < 7 && deck.length >= 7) {
        hand.push(...deck.splice(0, 7 - hand.length));
    }
    renderHand();
}

function renderHand() {
    const el = document.getElementById('player-hand');
    el.innerHTML = '';
    hand.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'card'; card.innerText = c;
        card.onclick = () => {
            if (selectedLetters.length < 5) {
                selectedLetters.push(hand.splice(i, 1)[0]);
                renderHand(); renderWordZone();
            }
        };
        el.appendChild(card);
    });
}

function addSupport(c) {
    if (selectedLetters.length < 5) {
        selectedLetters.push(c);
        renderWordZone();
    }
}

function renderWordZone() {
    const slots = document.querySelectorAll('.letter-slot');
    slots.forEach((s, i) => {
        s.innerText = selectedLetters[i] || "";
        s.classList.toggle('active', !!selectedLetters[i]);
    });
    document.getElementById('confirm-btn').disabled = selectedLetters.length < 2;
}

function clearWord() {
    selectedLetters.forEach(c => { if (!['ゃ','ゅ','ょ','っ'].includes(c)) hand.push(c); });
    selectedLetters = []; renderHand(); renderWordZone();
}

function shuffleDeck() {
    if (timeLeft <= 3) return;
    timeLeft -= 3;
    const mainCards = hand.concat(selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c)));
    deck.push(...mainCards);
    hand = []; selectedLetters = [];
    shuffle(deck); drawCards(); renderWordZone(); updateUI();
}

function showHint() {
    const cards = document.querySelectorAll('.hand .card');
    VALID_WORDS.forEach(w => {
        let temp = [...hand]; let match = [];
        for (let c of w) {
            let idx = temp.indexOf(c);
            if (idx !== -1) { match.push(idx); temp[idx] = null; }
            else { match = []; break; }
        }
        match.forEach(idx => cards[idx].classList.add('hint-glow'));
    });
    setTimeout(() => cards.forEach(c => c.classList.remove('hint-glow')), 2000);
}

window.onload = loadDatabase;
