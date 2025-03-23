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
  if (videoSection) videoSection.style.opacity = 1 - scrollFraction * 0.5;

  // Dolna sekcja (baner) przesuwa się w górę, "najeżdżając" na wideo
  if (banerSection) {
      const translateY = (1 - scrollFraction) * windowHeight;
      banerSection.style.transform = `translateY(${translateY}px)`;
  }
});

// Obsługa wideo w stopce (hfhw)
document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('hfhw');
  
  if (video) {
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

      // Nasłuchiwanie przewijania
      window.addEventListener('scroll', handleScroll);
      
      // Sprawdzenie przy załadowaniu strony
      handleScroll();
      
      // Sprawdzenie po pełnym załadowaniu strony
      window.addEventListener('load', handleScroll);
  }

  // Inicjalizacja karuzeli dla strony zawodników
  const carousel = document.querySelector('.players-carousel');
  if (carousel) {
      initCarousel(carousel);
  }
});

// Funkcja inicjalizująca karuzelę 3D
function initCarousel(carousel) {
  const cards = carousel.querySelectorAll('.player-card');
  const cardsCount = cards.length;
  let currentIndex = 0;
  
  // Funkcja układająca karty w okrąg 3D
  function arrangeCards() {
      const angleStep = 360 / cardsCount;
      const radius = 400 + (cardsCount * 20); // Zwiększony promień dla większej liczby kart
      
      cards.forEach((card, index) => {
          // Oblicz pozycję kątową każdej karty
          const angle = ((index - currentIndex) * angleStep) % 360;
          const radian = angle * Math.PI / 180;
          
          // Oblicz pozycję X i Z dla efektu 3D
          const x = radius * Math.sin(radian);
          const z = radius * Math.cos(radian) - radius;
          
          // Oblicz skalę i przezroczystość
          const scale = Math.max(0.6, (1000 + z) / 1000);
          const opacity = Math.max(0.4, (1000 + z) / 1000);
          
          // Zastosuj transformacje
          card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${-angle}deg) scale(${scale})`;
          card.style.opacity = opacity;
          card.style.zIndex = Math.floor((1000 + z) / 10);
          
          // Dodaj klasę active dla aktywnej karty
          if (index === currentIndex) {
              card.classList.add('active');
          } else {
              card.classList.remove('active');
          }
          
          // Pokaż karty w zasięgu ±2 od aktualnej
          const angleDiff = Math.abs(angle) <= 180 ? Math.abs(angle) : 360 - Math.abs(angle);
          if (angleDiff <= angleStep * 2) {
              card.style.display = 'block';
          } else {
              card.style.display = 'none';
          }
      });
  }
  
  // Funkcja do przesunięcia karuzeli w lewo
  function moveLeft() {
      currentIndex = (currentIndex - 1 + cardsCount) % cardsCount;
      arrangeCards();
  }
  
  // Funkcja do przesunięcia karuzeli w prawo
  function moveRight() {
      currentIndex = (currentIndex + 1) % cardsCount;
      arrangeCards();
  }
  
  // Funkcja do przełączania na konkretną kartę
  function moveToCard(index) {
      currentIndex = index;
      arrangeCards();
  }
  
  // Obsługa kliknięć na karty
  cards.forEach((card, index) => {
      card.addEventListener('click', function() {
          if (index !== currentIndex) {
              moveToCard(index);
          }
      });
  });
  
  // Inicjalizacja pozycji kart
  arrangeCards();
  
  // Pobierz przyciski nawigacyjne
  const container = carousel.closest('.carousel-container');
  const leftArrow = container.querySelector('.carousel-arrow-left');
  const rightArrow = container.querySelector('.carousel-arrow-right');
  
  // Dodaj obsługę kliknięć na strzałki
  if (leftArrow) leftArrow.addEventListener('click', moveLeft);
  if (rightArrow) rightArrow.addEventListener('click', moveRight);
  
  // Obsługa klawiszy strzałek
  document.addEventListener('keydown', function(e) {
      if (carousel.closest('.section-content').style.display !== 'none') {
          if (e.key === 'ArrowLeft') {
              moveLeft();
          } else if (e.key === 'ArrowRight') {
              moveRight();
          }
      }
  });
}