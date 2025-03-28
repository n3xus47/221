// Efekt przejścia strony - rozwija się od dołu do góry
document.addEventListener('DOMContentLoaded', function() {
    // Znajdujemy wszystkie linki w menu nawigacyjnym
    const navLinks = document.querySelectorAll('.nav-menu a, .footer-menu a');
    
    // Pomijamy linki zewnętrzne lub te, które otwierają się w nowym oknie
    navLinks.forEach(link => {
        // Sprawdzamy, czy link prowadzi do strony w tej samej domenie
        // i nie ma atrybutu target="_blank"
        if (link.hostname === window.location.hostname && 
            link.getAttribute('target') !== '_blank') {
            link.addEventListener('click', handleLinkClick);
        }
    });
    
    function handleLinkClick(e) {
        e.preventDefault(); // Blokujemy domyślne zachowanie linku
        const targetPage = this.getAttribute('href');
        
        if (targetPage) {
            // Tworzymy element animacji przejścia
            const transitionOverlay = document.createElement('div');
            transitionOverlay.className = 'page-transition-overlay';
            document.body.appendChild(transitionOverlay);
            
            // Animujemy nakładkę - rozwijanie od dołu do góry
            setTimeout(() => {
                transitionOverlay.classList.add('active');
                
                // Po zakończeniu animacji, przechodzimy do nowej strony
                setTimeout(() => {
                    // Zapisujemy informację o trwającym przejściu
                    sessionStorage.setItem('pageTransitionActive', 'true');
                    window.location.href = targetPage;
                }, 500); // Czas trwania animacji
            }, 10); // Małe opóźnienie dla płynnego startu animacji
        }
    }
});

// Obsługa wejścia na stronę (animacja wejścia)
window.addEventListener('pageshow', function(e) {
    // Sprawdzamy, czy strona ładowana jest z pamięci podręcznej
    if (e.persisted) {
        // Jeśli tak, symulujemy animację wejścia
        handlePageEnter();
    }
});

// Dodajemy nową obsługę ładowania strony
window.addEventListener('load', function() {
    // Sprawdzamy, czy przejście jest aktywne
    if (sessionStorage.getItem('pageTransitionActive') === 'true') {
        // Usuwamy flagę przejścia
        sessionStorage.removeItem('pageTransitionActive');
        
        // Opóźniamy animację wejścia, aby ekran ładowania mógł się najpierw wyświetlić
        const loadingScreen = document.getElementById('loadingScreen');
        const pageContent = document.getElementById('pageContent');
        
        // Modyfikacja istniejącego kodu ładowania
        setTimeout(function() {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (pageContent) pageContent.classList.remove('hidden');
            
            // Uruchamiamy animację wejścia strony
            handlePageEnter();
            
            setTimeout(function() {
                if (loadingScreen) loadingScreen.style.display = 'none';
            }, 400);
        }, 1500);
    } else {
        // Standardowe ładowanie strony bez animacji przejścia
        const loadingScreen = document.getElementById('loadingScreen');
        const pageContent = document.getElementById('pageContent');
        
        setTimeout(function() {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (pageContent) pageContent.classList.remove('hidden');
            
            setTimeout(function() {
                if (loadingScreen) loadingScreen.style.display = 'none';
            }, 400);
        }, 1500);
    }
});

function handlePageEnter() {
    // Sprawdzamy, czy element overlay istnieje
    let transitionOverlay = document.querySelector('.page-transition-overlay');
    
    // Jeśli nie, tworzymy go
    if (!transitionOverlay) {
        transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'page-transition-overlay active page-enter';
        document.body.appendChild(transitionOverlay);
    } else {
        transitionOverlay.classList.add('page-enter');
    }
    
    // Animujemy wyjście nakładki (znika w górę)
    setTimeout(() => {
        transitionOverlay.classList.remove('active');
        
        // Usuwamy nakładkę po zakończeniu animacji
        setTimeout(() => {
            transitionOverlay.remove();
        }, 500); // Czas trwania animacji
    }, 200); // Opóźnienie startu animacji
} 