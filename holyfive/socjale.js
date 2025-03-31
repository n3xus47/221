document.addEventListener('DOMContentLoaded', function() {
    // Animacja nicków
    inicjalizujAnimacjeNickow();

    // Funkcja dodająca efekt hover dla ikon social media w profilu
    const profileIcons = document.querySelectorAll('.profile .icons a');
    profileIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// Funkcja inicjalizująca animację nicków
function inicjalizujAnimacjeNickow() {
    const nicknames = document.querySelectorAll('.nickname');
    
    nicknames.forEach(nickname => {
        // Zmiana struktury nicku - pierwsza litera w osobnym spanie
        const nickText = nickname.textContent;
        if (nickText.length > 0) {
            const firstLetter = nickText.charAt(0);
            const restOfNick = nickText.substring(1);
            nickname.innerHTML = `<span class="first-letter">${firstLetter}</span>${restOfNick}`;
        }
        
        // Dodanie efektu krwi przy ładowaniu
        dodajEfektKrwi(nickname);
        
        // Nasłuchiwanie zdarzeń myszy
        nickname.addEventListener('mouseenter', function() {
            this.classList.add('hover-effect');
        });
        
        nickname.addEventListener('mouseleave', function() {
            this.classList.remove('hover-effect');
        });
    });
}

// Funkcja dodająca efekt krwi przy ładowaniu
function dodajEfektKrwi(element) {
    // Tworzymy kropelki krwi
    const numDrops = Math.floor(Math.random() * 2) + 1; // 1-2 kropelki
    
    for (let i = 0; i < numDrops; i++) {
        const drop = document.createElement('span');
        drop.className = 'blood-drop';
        
        // Losowe pozycjonowanie kropelki
        const leftPos = Math.random() * 60 + 20; // 20-80%
        drop.style.left = `${leftPos}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        
        element.appendChild(drop);
    }
}

// Funkcja dodająca efekt glitcha dla losowo wybranego nicku
function dodajEfektGlitcha() {
    const nicknames = document.querySelectorAll('.nickname');
    
    // Losowo wybieramy jednego nicka
    const randomIndex = Math.floor(Math.random() * nicknames.length);
    const randomNick = nicknames[randomIndex];
    
    // Dodajemy efekt glitcha
    randomNick.classList.add('glitch-effect');
    
    // Usuwamy efekt po 2 sekundach
    setTimeout(() => {
        randomNick.classList.remove('glitch-effect');
        
        // Ponownie uruchamiamy efekt po losowym czasie
        setTimeout(dodajEfektGlitcha, Math.random() * 10000 + 5000); // 5-15 sekund
    }, 2000);
}

// Uruchomienie efektu glitcha po załadowaniu strony z opóźnieniem
setTimeout(dodajEfektGlitcha, 5000); 
