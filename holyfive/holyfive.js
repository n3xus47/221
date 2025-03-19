// Ekran ładowania
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        const pageContent = document.getElementById('pageContent');
        
        loadingScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');
        
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 400);
    }, 1500);
});

// Animacja przewijania między video a baner-bar-footer-container
document.addEventListener("scroll", function () {
    const videoSection = document.querySelector(".video-section");
    const banerSection = document.querySelector(".baner-bar-footer-container");
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    // Obliczanie pozycji przewijania (od 0 do 1 w zakresie 500 pikseli)
    const scrollFraction = Math.min(scrollPosition / 500, 1);

    // Górna sekcja (wideo) ciemnieje o 40% (opacity od 1 do 0.6)
    videoSection.style.opacity = 1 - scrollFraction * 0.5;

    // Dolna sekcja (baner) przesuwa się w górę, "najeżdżając" na wideo
    const translateY = (1 - scrollFraction) * windowHeight;
    banerSection.style.transform = `translateY(${translateY}px)`;
});
