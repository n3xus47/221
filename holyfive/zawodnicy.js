document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.querySelector('.stats-container');

    function checkVisibility() {
        const rect = statsContainer.getBoundingClientRect();
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);

        if (rect.top <= windowHeight && rect.bottom >= 0) {
            statsContainer.classList.add('visible');
        }
    }

    window.addEventListener('scroll', checkVisibility);
    checkVisibility(); // Sprawdź widoczność na wypadek, gdyby element był już widoczny
});
