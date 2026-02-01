let ALL_LEVELS_DATA = null;
let VALID_WORDS = new Set();
// Distribusi deck sesuai dokumen [cite: 12, 13, 14]
const DECK_DATA = {
    3: ['ん','い','う','え','あ','し','た','の','る','か','て'],
    2: ['さ','to','な','も','こ','は','ま','や','よ','き'],
    1: ['り','お','く','が','ぎ','ぐ','ご','ば','ぱ','ふ','ひ','へ','ほ','わ','ち','つ']
};

let deck = [];
let hand = [];
let selectedLetters = [];
let timeLeft = 90;
let yokaiHP = 100;
let gameActive = false;
let comboStreak = 0;
let lastWinTime = 0;
let lastHintTime = 0;

// Audio - Pastikan file ada di folder assets/
const sfxCring = new Audio('assets/sfx-cring.mp3');
const sfxExplode = new Audio('assets/sfx-explode.mp3');

function buildDeck() {
    deck = [];
    for (let count in DECK_DATA) {
        DECK_DATA[count].forEach(char => {
            for (let i = 0; i < parseInt(count); i++) deck.push(char);
        });
    }
    shuffle(deck);
}

async function loadDatabase() {
    try {
        const response = await fetch('database.json');
        const data = await response.json();
        ALL_LEVELS_DATA = data.levels;
        buildDeck();
        initLevel(1);
    } catch (e) { console.error(e); }
}

function initLevel(level) {
    const levelData = ALL_LEVELS_DATA[level];
    VALID_WORDS = new Set(levelData.words);
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

// Logic agar kartu yang keluar pasti bisa jadi kata
function drawCards() {
    let attempts = 0;
    while (hand.length < 7 && deck.length >= 7) {
        let trialHand = deck.slice(0, 7);
        if (canFormAnyWord(trialHand) || attempts > 15) {
            hand.push(...deck.splice(0, 7 - hand.length));
            break;
        }
        shuffle(deck);
        attempts++;
    }
    renderHand();
    updateUI();
}

function canFormAnyWord(testHand) {
    for (let word of VALID_WORDS) {
        let temp = [...testHand];
        let match = 0;
        for (let c of word) {
            let i = temp.indexOf(c);
            if (i !== -1) { match++; temp[i] = null; }
        }
        if (match === word.length) return true;
    }
    return false;
}

function selectLetter(i) {
    if (selectedLetters.length >= 5) return;
    selectedLetters.push(hand.splice(i, 1)[0]);
    renderWordZone();
    renderHand();
}

function addSupport(char) {
    if (selectedLetters.length >= 5) return;
    selectedLetters.push(char);
    renderWordZone();
}

function renderWordZone() {
    const slots = document.querySelectorAll('.letter-slot');
    slots.forEach((s, i) => {
        s.innerText = selectedLetters[i] || "";
        s.classList.toggle('active', !!selectedLetters[i]);
    });
    document.getElementById('confirm-btn').disabled = selectedLetters.length < 2; [cite: 21]
}

function confirmWord() {
    const word = selectedLetters.join('');
    if (VALID_WORDS.has(word)) {
        sfxExplode.play();
        // Combo Streak [Bonus Waktu]
        let now = Date.now();
        if (now - lastWinTime < 6000) { comboStreak++; timeLeft += 2; } 
        else { comboStreak = 1; }
        lastWinTime = now;

        const damage = (word.length * 20) + (comboStreak * 5); [cite: 24, 25]
        yokaiHP = Math.max(0, yokaiHP - damage);
        
        deck.push(...selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c)));
        shuffle(deck);
        selectedLetters = [];
        drawCards();
    } else {
        alert("Bukan Mantra!");
        clearWord();
    }
    renderWordZone();
    updateUI();
}

function shuffleDeck() {
    if (timeLeft <= 3) return;
    timeLeft -= 3; [cite: 33]
    deck.push(...hand, ...selectedLetters.filter(c => !['ゃ','ゅ','ょ','っ'].includes(c))); [cite: 34]
    hand = []; selectedLetters = [];
    shuffle(deck);
    drawCards();
    renderWordZone();
    updateUI();
}

function clearWord() {
    selectedLetters.forEach(c => { if (!['ゃ','ゅ','ょ','っ'].includes(c)) hand.push(c); });
    selectedLetters = [];
    renderHand();
    renderWordZone();
}

function showHint() {
    if (Date.now() - lastHintTime < 5000) return; [cite: 28, 35]
    sfxCring.play();
    let cardCount = {};
    VALID_WORDS.forEach(word => {
        let temp = [...hand];
        let matchIndices = [];
        for (let c of word) {
            let idx = temp.indexOf(c);
            if (idx !== -1) { matchIndices.push(idx); temp[idx] = null; }
            else { matchIndices = []; break; }
        }
        matchIndices.forEach(idx => cardCount[idx] = (cardCount[idx] || 0) + 1);
    });

    const cardEls = document.querySelectorAll('.hand .card');
    for (let idx in cardCount) {
        if (cardCount[idx] === 1) cardEls[idx].classList.add('hint-glow');
        if (cardCount[idx] >= 2) cardEls[idx].classList.add('super-hint');
    }

    setTimeout(() => {
        cardEls.forEach(c => c.classList.remove('hint-glow', 'super-hint'));
    }, 2000);
    
    lastHintTime = Date.now();
    const btn = document.getElementById('hint-btn');
    btn.disabled = true;
    setTimeout(() => btn.disabled = false, 5000);
}

function updateUI() {
    const hpFill = document.getElementById('hp-fill');
    hpFill.style.width = yokaiHP + "%";
    hpFill.style.backgroundColor = yokaiHP < 30 ? "#ff4d4d" : (yokaiHP < 70 ? "#f1c40f" : "#2ecc71");
    document.getElementById('time-val').innerText = timeLeft;
    document.getElementById('deck-val').innerText = deck.length;
    if (yokaiHP <= 0 && gameActive) checkLevelClear();
}

function startTimer() {
    setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft--;
            updateUI();
            if (timeLeft <= 0) { alert("Waktu Habis!"); location.reload(); }
        }
    }, 1000);
}

window.onload = loadDatabase;
