    window.addEventListener('load', function() {
      // Symulacja opóźnienia ładowania (możesz usunąć setTimeout jeśli nie chcesz dodatkowego opóźnienia)
      setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        const pageContent = document.getElementById('pageContent');
        
        // Ukryj ekran ładowania
        loadingScreen.classList.add('hidden');
        
        // Pokaż zawartość strony
        pageContent.classList.remove('hidden');
        
        // Po zakończeniu animacji, usuń ekran ładowania z DOM
        setTimeout(function() {
          loadingScreen.style.display = 'none';
        }, 400); // Czas powinien być równy czasowi trwania animacji
      }, 1500); // Symulowane opóźnienie 1.5s, dostosuj według potrzeb
    });
