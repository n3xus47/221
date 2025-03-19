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

const video = document.getElementById('hfhw');

  // Funkcja sprawdzająca, czy element jest widoczny na ekranie
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  
  
  
  }

  // Obsługa przewijania strony
  function handleScroll() {
    if (isElementInViewport(video)) {
      video.play();
    } else {
      video.pause();
    }
  }

  // Ustawienie pętli
  video.loop = true;

  // Nasłuchiwanie przewijania
  window.addEventListener('scroll', handleScroll);

  // Sprawdzenie przy załadowaniu strony
  document.addEventListener('DOMContentLoaded', handleScroll);
