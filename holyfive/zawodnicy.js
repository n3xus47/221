document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
        observer.observe(card);
    });

    // Obsługa ładowania strony
    const loadingScreen = document.getElementById('loadingScreen');
    const pageContent = document.getElementById('pageContent');

    // Symulacja ładowania
    setTimeout(() => {
        loadingScreen.classList.add('leave-transition');
        loadingScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');

        // Po pokazaniu zawartości uruchamiamy animacje kart
        setTimeout(() => {
            playerCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 150); // Opóźnienie między kolejnymi kartami
            });
        }, 300);
    }, 800);
});
