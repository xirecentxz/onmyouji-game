/**
 * KOTODAMA RITUAL - CORE ENGINE
 * Menggunakan database.json dari Kotonogi API
 */

let VALID_WORDS = new Set();
const HIRAGANA_DECK = [
    'あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ',
    'た','ち','つ','て','と','na','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
    'ま','み','む','me','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','を','ん'
];

let deck = [...HIRAGANA_DECK];
let hand = [];
let selectedLetters = [];
let timeLeft = 90;
let yokaiHP = 100;
let gameActive = false; // Game baru aktif setelah database di-load

/**
 * 1. LOADING DATABASE
 * Mengambil file database.json yang di-upload ke GitHub
 */
async function loadDatabase() {
    try {
        console.log("Membuka kitab mantra...");
        const response = await fetch('database.json');
        const data = await response.json();

        // Ekstraksi otomatis dari Hiragana, Dakuten, Handakuten, dan Yoon
        const categories = ['hiragana', 'dakuten', 'handakuten', 'yoon'];
        
        categories.forEach(cat => {
            if (data[cat] && data[cat].hiragana_huruf) {
                data[cat].hiragana_huruf.forEach(huruf => {
                    if (huruf.kosakata) {
                        huruf.kosakata.forEach(item => {
                            // Masukkan kata kana ke kamus validasi
                            VALID_WORDS.add(item.kana.trim());
                        });
                    }
                });
            }
        });

        console.log("Ritual Siap! Total mantra:", VALID_WORDS.size);
        gameActive = true;
        initGame();
    } catch (error) {
        console.error("Gagal memuat database.json:", error);
        alert("Kitab mantra (database.json) tidak ditemukan!");
    }
}

/**
 * 2. GAME LOGIC
 */
function initGame() {
    shuffle(deck);
    drawCards();
    startTimer();
    updateUI();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function drawCards() {
    while (hand.length < 5 && deck.length > 0) {
        hand.push(deck.shift());
    }
    renderHand();
    updateUI();
}

function renderHand() {
    const handEl = document.getElementById('player-hand');
    handEl.innerHTML = '';
    hand.forEach((char, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = char;
        card.onclick = () => selectLetter(index);
        handEl.appendChild(card);
    });
}

function selectLetter(index) {
    if (selectedLetters.length >= 5) return;
    const char = hand.splice(index, 1)[0];
    selectedLetters.push(char);
    renderWordZone();
    renderHand();
}

function renderWordZone() {
    const slots = document.querySelectorAll('.letter-slot');
    slots.forEach((slot, index) => {
        slot.innerText = selectedLetters[index] || "";
        if (selectedLetters[index]) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    });
}

function clearWord() {
    hand.push(...selectedLetters);
    selectedLetters = [];
    renderWordZone();
    renderHand();
}

function confirmWord() {
    const word = selectedLetters.join('');
    
    if (VALID_WORDS.has(word)) {
        // Mantra Berhasil
        const damage = word.length * 20;
        yokaiHP = Math.max(0, yokaiHP - damage);
        timeLeft += 5; 
        
        alert(`✨ KOTODAMA AKTIF: ${word}! HP Yokai -${damage}`);
        
        selectedLetters = [];
        drawCards();
    } else {
        // Mantra Gagal
        timeLeft -= 5;
        alert(`💀 ${word} bukan mantra yang valid!`);
        clearWord();
    }
    updateUI();
}

function shuffleDeck() {
    if (timeLeft <= 5) return;
    timeLeft -= 5;
    deck.push(...hand, ...selectedLetters);
    hand = [];
    selectedLetters = [];
    shuffle(deck);
    drawCards();
    renderWordZone();
    updateUI();
}

function updateUI() {
    // Update HP
    const hpFill = document.getElementById('hp-fill');
    if(hpFill) hpFill.style.width = yokaiHP + "%";

    // Update Deck Count (Agar tidak tertumpuk)
    const deckVal = document.getElementById('deck-val');
    if(deckVal) deckVal.innerText = deck.length;

    if (yokaiHP <= 0) {
        gameActive = false;
        alert("🎉 RITUAL BERHASIL! Yokai telah tersegel.");
        location.reload();
    }
}

function startTimer() {
    const timerEl = document.getElementById('time-val');
    const interval = setInterval(() => {
        if (!gameActive) { clearInterval(interval); return; }
        timeLeft--;
        if(timerEl) timerEl.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            alert("💀 WAKTU HABIS! Yokai menyerang!");
            location.reload();
        }
    }, 1000);
}

// Menjalankan loading database saat web dibuka
window.onload = loadDatabase;
