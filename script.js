let ALL_LEVELS_DATA = null;
let VALID_WORDS = new Set();
const DECK_DATA = {
    3: ['ん','い','う','え','あ','し','た','の','る','か','て'],
    2: ['さ','と','na','も','こ','は','ま','や','よ','き'],
    1: ['り','お','く','が','ぎ','ぐ','ご','ba','pa','ふ','ひ','へ','ほ','わ','ち','つ']
};

let deck = []; let hand = []; let selectedLetters = [];
let timeLeft = 90; let yokaiHP = 100; let gameActive = false;
let lastHintTime = 0;

function buildDeck() {
    deck = [];
    for (let n in DECK_DATA) {
        DECK_DATA[n].forEach(c => { for(let i=0; i<n; i++) deck.push(c); });
    }
    shuffle(deck);
}

async function loadDatabase() {
    try {
        const res = await fetch('database.json');
        const data = await res.json();
        ALL_LEVELS_DATA = data.levels;
        buildDeck();
        initLevel(1);
    } catch (e) { console.error("Database error", e); }
}

function initLevel(level) {
    if (!ALL_LEVELS_DATA[level]) return;
    VALID_WORDS = new Set(ALL_LEVELS_DATA[level].words);
    yokaiHP = 100; timeLeft = 90; hand = []; selectedLetters = [];
    drawCards();
    if (!gameActive) { gameActive = true; startTimer(); }
    updateUI();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function drawCards() {
    let attempts = 0;
    while (hand.length < 7 && deck.length >= 7) {
        let trial = deck.slice(0, 7);
        if (canFormWord(trial) || attempts > 20) {
            hand.push(...deck.splice(0, 7 - hand.length));
            break;
        }
        shuffle(deck); attempts++;
    }
    renderHand();
}

function canFormWord(testHand) {
    for (let word of VALID_WORDS) {
        let temp = [...testHand]; let m = 0;
        for (let c of word) {
            let i = temp.indexOf(c);
            if (i !== -1) { m++; temp[i] = null; }
        }
        if (m === word.length) return true;
    }
    return false;
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

function confirmWord() {
    const word = selectedLetters.join('');
    if (VALID_WORDS.has(word)) {
        yokaiHP = Math.max(0, yokaiHP - (word.length * 20));
        deck.push(...selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c)));
        shuffle(deck); selectedLetters = [];
        drawCards(); renderWordZone();
    } else {
        clearWord();
    }
    updateUI();
}

function clearWord() {
    selectedLetters.forEach(c => { if (!['ゃ','ゅ','ょ','っ'].includes(c)) hand.push(c); });
    selectedLetters = []; renderHand(); renderWordZone();
}

function shuffleDeck() {
    if (timeLeft <= 3) return;
    timeLeft -= 3;
    deck.push(...hand, ...selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c)));
    hand = []; selectedLetters = [];
    shuffle(deck); drawCards(); renderWordZone(); updateUI();
}

function showHint() {
    if (Date.now() - lastHintTime < 5000) return;
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
    lastHintTime = Date.now();
}

function updateUI() {
    document.getElementById('hp-fill').style.width = yokaiHP + "%";
    document.getElementById('time-val').innerText = timeLeft;
    document.getElementById('deck-val').innerText = deck.length;
}

function startTimer() {
    setInterval(() => { if (gameActive && timeLeft > 0) { timeLeft--; updateUI(); } }, 1000);
}

window.onload = loadDatabase;
