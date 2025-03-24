document.addEventListener('DOMContentLoaded', function() {
    // Obsługa animacji przy przewijaniu
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Obsługa ładowania strony
    const loadingScreen = document.getElementById('loadingScreen');
    const pageContent = document.getElementById('pageContent');
    const sectionTitle = document.querySelector('.section-title');
    const playerCard = document.getElementById('playerCard');
    const playerCard2 = document.getElementById('playerCard2');
    const playerCard3 = document.getElementById('playerCard3');
    const playerCard4 = document.getElementById('playerCard4');
    const playerCard5 = document.getElementById('playerCard5');
    const holyFiveTitle = document.getElementById('holyFiveTitle');
    const actionButtons = document.getElementById('actionButtons');
    
    // Elementy modalne
    const teamHistoryBtn = document.getElementById('teamHistoryBtn');
    const trophiesBtn = document.getElementById('trophiesBtn');
    const playerStatsBtn = document.getElementById('playerStatsBtn');
    const teamHistoryModal = document.getElementById('teamHistoryModal');
    const trophiesModal = document.getElementById('trophiesModal');
    const playerStatsModal = document.getElementById('playerStatsModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const closeTrophiesModal = document.getElementById('closeTrophiesModal');
    const closePlayerStatsModal = document.getElementById('closePlayerStatsModal');
    
    // Zmienna śledząca stan animacji napisu
    let titleAnimationPlayed = false;
    let titleAnimationInProgress = false;
    let buttonsVisible = false;
    
    // Obsługa otwierania/zamykania modali
    teamHistoryBtn.addEventListener('click', () => {
        teamHistoryModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Blokujemy przewijanie strony
    });
    
    trophiesBtn.addEventListener('click', () => {
        trophiesModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Blokujemy przewijanie strony
    });
    
    playerStatsBtn.addEventListener('click', () => {
        playerStatsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Blokujemy przewijanie strony
    });
    
    closeHistoryModal.addEventListener('click', () => {
        teamHistoryModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Odblokowujemy przewijanie strony
    });
    
    closeTrophiesModal.addEventListener('click', () => {
        trophiesModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Odblokowujemy przewijanie strony
    });
    
    closePlayerStatsModal.addEventListener('click', () => {
        playerStatsModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Odblokowujemy przewijanie strony
    });
    
    // Zamykanie modalu przy kliknięciu poza zawartością
    window.addEventListener('click', (event) => {
        if (event.target === teamHistoryModal) {
            teamHistoryModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === trophiesModal) {
            trophiesModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === playerStatsModal) {
            playerStatsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Funkcja wyrównująca wysokość elementów card-inner i player-text
    function equalizeCardInnerHeights() {
        // Pobieramy wszystkie elementy card-inner
        const cardInners = document.querySelectorAll('.card-inner');
        
        // Jeśli nie ma elementów, kończymy funkcję
        if (cardInners.length === 0) return;
        
        // Pobieramy wysokość pierwszego elementu jako wzorcową
        const referenceHeight = cardInners[0].offsetHeight;
        
        // Ustawiamy wysokość wszystkich elementów na tę samą wartość
        cardInners.forEach(cardInner => {
            cardInner.style.height = referenceHeight + 'px';
        });
        
        // Wyrównujemy elementy player-text
        const playerTexts = document.querySelectorAll('.player-text');
        const playerInfos = document.querySelectorAll('.player-info');
        
        // Jeśli mamy zarówno player-text jak i player-info
        if (playerTexts.length > 0 && playerInfos.length > 0) {
            // Pobieramy szerokości jako wzorcowe
            const referenceTextWidth = playerTexts[0].offsetWidth;
            const referenceInfoHeight = playerInfos[0].offsetHeight;
            
            // Ustawiamy jednolite wymiary
            playerTexts.forEach(text => {
                text.style.width = referenceTextWidth + 'px';
            });
            
            playerInfos.forEach(info => {
                info.style.height = referenceInfoHeight + 'px';
            });
        }
    }
    
    // Wywołujemy funkcję po załadowaniu strony
    window.addEventListener('load', equalizeCardInnerHeights);
    
    // Wywołujemy funkcję przy zmianie rozmiaru okna
    window.addEventListener('resize', equalizeCardInnerHeights);
    
    // Dodajemy nasłuchiwanie na zmiany poziomu zoomu (nie działa we wszystkich przeglądarkach)
    window.addEventListener('zoom', equalizeCardInnerHeights);
    
    // Dodajemy obsługę kliknięć dla kart zawodników
    function handlePlayerCardClick(event) {
        // Sprawdzamy, czy kliknięcie było na linku społecznościowym
        if (event.target.closest('.social-link')) {
            // Jeśli tak, to pozwól na domyślne działanie linku
            return;
        }
        
        // W przeciwnym razie zatrzymaj propagację kliknięcia
        event.stopPropagation();
    }
    
    // Dodajemy nasłuchiwanie na kliknięcia dla kart zawodników
    document.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', handlePlayerCardClick);
    });
    
    // Funkcja do animacji maszyny losującej
    function slotMachineEffect(element, finalWord, duration = 2000) {
        // Tablica liter do losowania (znaki, które często występują w kasynach)
        const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(){}[]<>?/|\\';
        
        // Czyścimy kontener
        element.innerHTML = '';
        
        // Przygotowujemy kontener dla liter z wyrównanymi odstępami
        const wordContainer = document.createElement('div');
        wordContainer.style.display = 'flex';
        wordContainer.style.justifyContent = 'center';
        wordContainer.style.width = '100%';
        wordContainer.style.gap = '0.1em'; // Dodajemy mały odstęp między wszystkimi literami
        element.appendChild(wordContainer);
        
        // Tworzymy miejsca dla każdej litery
        const letterContainers = [];
        
        // Dzielimy finalWord na tablicę znaków
        const chars = finalWord.split('');
        
        // Tworzymy span dla każdej litery finalnego słowa
        for (let i = 0; i < chars.length; i++) {
            const letterSpan = document.createElement('span');
            letterSpan.style.display = 'inline-block';
            
            // Jeśli to spacja między HOLY i FIVE, dajemy mniejszą szerokość
            if (chars[i] === ' ') {
                letterSpan.style.width = '0.3em'; // Zmniejszona szerokość spacji
                letterSpan.textContent = ' ';
            } else {
                letterSpan.style.width = '0.8em'; // Stała szerokość dla każdej litery (nieco zmniejszona)
                letterSpan.style.textAlign = 'center'; // Wyśrodkowanie tekstu
                
                // Dodajemy efekt migotania
                letterSpan.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.2)';
            }
            
            wordContainer.appendChild(letterSpan);
            letterContainers.push(letterSpan);
        }
        
        // Uruchamiamy animację dla każdej litery z opóźnieniem
        letterContainers.forEach((container, index) => {
            if (chars[index] === ' ') return;
            
            let startTime = null;
            // Krótszy czas na literę = szybsza animacja
            const letterDuration = duration * 0.7 - (index * 150);
            // Minimalna liczba zmian przed ostateczną literą
            const minChanges = 10;
            let changes = 0;
            
            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                
                // Obliczamy progres animacji od 0 do 1
                const progress = Math.min(1, elapsed / letterDuration);
                
                // Losujemy literę
                if (progress < 1 || changes < minChanges) {
                    // Częstotliwość zmian zmniejsza się wraz z upływem czasu
                    const changeSpeed = Math.max(30, 150 * (1 - progress)); // Zwiększona częstość zmian
                    
                    // Zmieniamy literę tylko co kilka klatek
                    if (elapsed % changeSpeed < 16) { // 16ms to około 1 klatka przy 60fps
                        changes++;
                        // Im bliżej końca, tym większa szansa na prawidłową literę
                        const correctChance = progress * progress; // Kwadratowa funkcja daje bardziej eksponencjalny wzrost
                        
                        if (Math.random() > correctChance || changes < minChanges / 2) {
                            // Losowa litera
                            const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
                            container.textContent = randomChar;
                            
                            // Dodajemy efekt wibracji
                            container.style.transform = `translateY(${Math.random() * 2 - 1}px)`;
                        } else {
                            // Prawidłowa litera
                            container.textContent = chars[index];
                            container.style.transform = 'translateY(0)';
                        }
                    }
                    
                    requestAnimationFrame(animate);
                } else {
                    // Po zakończeniu animacji ustawiamy prawidłową literę
                    container.textContent = chars[index];
                    container.style.transform = 'translateY(0)';
                    
                    // Dodajemy subtelny efekt po zakończeniu
                    container.style.transition = 'text-shadow 0.3s ease';
                    container.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 49, 49, 0.4)';
                }
            }
            
            // Opóźniamy start animacji dla każdej kolejnej litery
            setTimeout(() => {
                requestAnimationFrame(animate);
            }, index * 100); // Szybsze pojawianie się kolejnych liter
        });
    }
    
    // Symulacja ładowania
    setTimeout(() => {
        loadingScreen.classList.add('leave-transition');
        loadingScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');
        
        // Wyrównujemy wysokości po załadowaniu
        setTimeout(equalizeCardInnerHeights, 100);
    }, 800);

    // Obsługa efektu przewijania
    window.addEventListener('scroll', () => {
        // Obliczamy procent przewinięcia strony
        let scrollPosition = window.scrollY;
        
        // Sprawdzamy pozycję przycisków
        const buttonsRect = actionButtons.getBoundingClientRect();
        const buttonsTopPosition = buttonsRect.top + window.scrollY;
        
        // Odległość między kartami a przyciskami (musi być zachowana)
        const cardButtonsMinDistance = 40; // 40px minimalnego odstępu
        
        // Maksymalna pozycja przewijania, po której nic się nie zmienia
        const maxScrollPosition = 3200; // Zmniejszone z 4200 na 3200
        
        // Ograniczamy pozycję przewijania do maksymalnej wartości
        if (scrollPosition > maxScrollPosition) {
            scrollPosition = maxScrollPosition;
        }
        
        // Ustawiamy wartość progową, po której napis zaczyna zanikać
        const fadeStartPosition = 50;
        
        // Ustawiamy wartość progową, po której napis jest całkowicie niewidoczny
        const fadeEndPosition = 150;
        
        // Maksymalna połowa przewijania - wszystkie karty powinny być na swoich miejscach
        const halfwayScrollPosition = 2700; // Zmniejszone z 3500 na 2700
        
        // Wartości dla karty 1
        const cardAppearPosition = 62.5;
        const cardShrinkStartPosition = 350;
        const cardShrinkEndPosition = 600;
        const cardMoveLeftStartPosition = 600;
        const cardMoveLeftEndPosition = 850;

        // Wartości dla karty 2
        const card2AppearPosition = 750;
        const card2ShrinkStartPosition = 1100;
        const card2ShrinkEndPosition = 1350;
        const card2MoveRightStartPosition = 1350;
        const card2MoveRightEndPosition = 1600;
        
        // Wartości dla karty 3
        const card3AppearPosition = 1500;
        const card3ShrinkStartPosition = 1850;
        const card3ShrinkEndPosition = 2100;
        const card3MoveLeftStartPosition = 2100;
        const card3MoveLeftEndPosition = 2350;
        
        // Wartości dla karty 4
        const card4AppearPosition = 2250;
        const card4ShrinkStartPosition = 2350; // Zmniejszone dla szybszej animacji
        const card4ShrinkEndPosition = 2450; // Zmniejszone
        const card4MoveRightStartPosition = 2450; // Zmniejszone
        const card4MoveRightEndPosition = 2550; // Zmniejszone
        
        // Wartości dla karty 5
        const card5AppearPosition = 2450; // Zmniejszone z 3000
        const card5ShrinkStartPosition = 2550; // Zmniejszone
        const card5ShrinkEndPosition = 2650; // Zmniejszone
        const card5MoveLeftStartPosition = 2650; // Zmniejszone
        const card5MoveLeftEndPosition = 2750; // Zmniejszone z 3850
        
        // Obliczamy szerokość ekranu i docelowe pozycje kart
        const windowWidth = window.innerWidth;
        const cardInitialPosition = 0; // Karta zaczyna na środku (translateX(0))
        
        // Pozycje docelowe dla 5 kart rozłożonych równomiernie
        const cardWidth = 270; // Szerokość karty w skali 0.6 (60% oryginalnej wielkości)
        const cardSpacing = 50; // Odstęp między kartami
        const totalWidth = (5 * cardWidth) + (4 * cardSpacing); // Całkowita szerokość wszystkich kart i odstępów
        const startX = -(totalWidth / 2) + (cardWidth / 2); // Pozycja startowa (środek pierwszej karty)
        
        // Obliczamy pozycje dla każdej karty z równymi odstępami
        const cardTargetPosition = startX; // Pierwsza karta
        const card3TargetPosition = startX + cardWidth + cardSpacing; // Druga pozycja (trzecia karta)
        const card5TargetPosition = startX + (2 * (cardWidth + cardSpacing)); // Środkowa pozycja (piąta karta)
        const card4TargetPosition = startX + (3 * (cardWidth + cardSpacing)); // Czwarta pozycja (czwarta karta)
        const card2TargetPosition = startX + (4 * (cardWidth + cardSpacing)); // Piąta pozycja (druga karta)
        
        // Sprawdzamy, czy napis HOLY FIVE już się pojawił
        const holyFiveVisible = holyFiveTitle.style.opacity === "1";
        
        // Sprawdzamy, czy przyciski są widoczne
        const actionButtonsVisible = actionButtons.style.opacity === "1";
        
        // Obsługa tytułu i pierwszej karty
        if (scrollPosition > fadeStartPosition) {
            // Obliczamy przezroczystość napisu (od 1 do 0)
            const titleOpacity = 1 - ((scrollPosition - fadeStartPosition) / (fadeEndPosition - fadeStartPosition));
            sectionTitle.style.opacity = Math.max(0, titleOpacity);
            
            // Pokazujemy kartę zawodnika, gdy napis zaczyna być mniej widoczny
            if (scrollPosition > cardAppearPosition) {
                // Obliczamy przezroczystość karty (od 0 do 1)
                const cardOpacity = (scrollPosition - cardAppearPosition) / 100;
                playerCard.style.opacity = Math.min(1, cardOpacity);
                
                let translateY = Math.max(0, 50 - (scrollPosition - cardAppearPosition) / 2);
                let scale = 1;
                let translateX = 0;
                
                // Zmniejszamy kartę po dalszym przewinięciu
                if (scrollPosition > cardShrinkStartPosition) {
                    // Obliczamy skalę karty (od 1 do 0.6)
                    scale = 1 - ((scrollPosition - cardShrinkStartPosition) / (cardShrinkEndPosition - cardShrinkStartPosition) * 0.4);
                    // Ograniczamy skalę do minimum 0.6 (60% oryginalnej wielkości)
                    scale = Math.max(0.6, scale);
                    
                    // Przesuwamy kartę w lewo po osiągnięciu minimalnego rozmiaru
                    if (scrollPosition > cardMoveLeftStartPosition && scale <= 0.6) {
                        // Obliczamy pozycję X karty (od środka do docelowej pozycji)
                        const moveProgress = Math.min(1, (scrollPosition - cardMoveLeftStartPosition) / (cardMoveLeftEndPosition - cardMoveLeftStartPosition));
                        translateX = cardInitialPosition + (cardTargetPosition - cardInitialPosition) * moveProgress;
                    }
                }
                
                // Jeśli karty są już na swoich miejscach i przyciski są widoczne, ustawiamy stałą wartość translateY
                if (scrollPosition > card5MoveLeftEndPosition + 200 && actionButtonsVisible) {
                    translateY = -150; // Zwiększona wartość, aby uzyskać większy odstęp między kartami a przyciskami
                }
                
                // Łączymy wszystkie transformacje dla pierwszej karty
                playerCard.style.transform = `translateY(${translateY}px) translateX(${translateX}px) scale(${scale})`;
                
            } else {
                playerCard.style.opacity = 0;
                playerCard.style.transform = 'translateY(50px)';
            }
        } else {
            sectionTitle.style.opacity = 1;
            playerCard.style.opacity = 0;
            playerCard.style.transform = 'translateY(50px)';
        }
        
        // Obsługa drugiej karty
        if (scrollPosition > card2AppearPosition) {
            // Obliczamy przezroczystość karty 2 (od 0 do 1)
            const card2Opacity = (scrollPosition - card2AppearPosition) / 100;
            playerCard2.style.opacity = Math.min(1, card2Opacity);
            
            let translateY2 = Math.max(0, 50 - (scrollPosition - card2AppearPosition) / 2);
            let scale2 = 1;
            let translateX2 = 0;
            
            // Zmniejszamy kartę 2 po dalszym przewinięciu
            if (scrollPosition > card2ShrinkStartPosition) {
                // Obliczamy skalę karty 2 (od 1 do 0.6)
                scale2 = 1 - ((scrollPosition - card2ShrinkStartPosition) / (card2ShrinkEndPosition - card2ShrinkStartPosition) * 0.4);
                // Ograniczamy skalę do minimum 0.6 (60% oryginalnej wielkości)
                scale2 = Math.max(0.6, scale2);
                
                // Przesuwamy kartę 2 w prawo po osiągnięciu minimalnego rozmiaru
                if (scrollPosition > card2MoveRightStartPosition && scale2 <= 0.6) {
                    // Obliczamy pozycję X karty 2 (od środka do docelowej pozycji)
                    const moveProgress2 = Math.min(1, (scrollPosition - card2MoveRightStartPosition) / (card2MoveRightEndPosition - card2MoveRightStartPosition));
                    translateX2 = cardInitialPosition + (card2TargetPosition - cardInitialPosition) * moveProgress2;
                }
            }
            
            // Jeśli karty są już na swoich miejscach i przyciski są widoczne, ustawiamy stałą wartość translateY
            if (scrollPosition > card5MoveLeftEndPosition + 200 && actionButtonsVisible) {
                translateY2 = -150; // Zwiększona wartość, aby uzyskać większy odstęp między kartami a przyciskami
            }
            
            // Łączymy wszystkie transformacje dla drugiej karty
            playerCard2.style.transform = `translateY(${translateY2}px) translateX(${translateX2}px) scale(${scale2})`;
            
        } else {
            playerCard2.style.opacity = 0;
            playerCard2.style.transform = 'translateY(50px)';
        }

        // Obsługa trzeciej karty
        if (scrollPosition > card3AppearPosition) {
            // Obliczamy przezroczystość karty 3 (od 0 do 1)
            const card3Opacity = (scrollPosition - card3AppearPosition) / 100;
            playerCard3.style.opacity = Math.min(1, card3Opacity);
            
            let translateY3 = Math.max(0, 50 - (scrollPosition - card3AppearPosition) / 2);
            let scale3 = 1;
            let translateX3 = 0;
            
            // Zmniejszamy kartę 3 po dalszym przewinięciu
            if (scrollPosition > card3ShrinkStartPosition) {
                // Obliczamy skalę karty 3 (od 1 do 0.6)
                scale3 = 1 - ((scrollPosition - card3ShrinkStartPosition) / (card3ShrinkEndPosition - card3ShrinkStartPosition) * 0.4);
                // Ograniczamy skalę do minimum 0.6 (60% oryginalnej wielkości)
                scale3 = Math.max(0.6, scale3);
                
                // Przesuwamy kartę 3 w lewo po osiągnięciu minimalnego rozmiaru
                if (scrollPosition > card3MoveLeftStartPosition && scale3 <= 0.6) {
                    // Obliczamy pozycję X karty 3 (od środka do docelowej pozycji)
                    const moveProgress3 = Math.min(1, (scrollPosition - card3MoveLeftStartPosition) / (card3MoveLeftEndPosition - card3MoveLeftStartPosition));
                    translateX3 = cardInitialPosition + (card3TargetPosition - cardInitialPosition) * moveProgress3;
                }
            }
            
            // Jeśli karty są już na swoich miejscach i przyciski są widoczne, ustawiamy stałą wartość translateY
            if (scrollPosition > card5MoveLeftEndPosition + 200 && actionButtonsVisible) {
                translateY3 = -150; // Zwiększona wartość, aby uzyskać większy odstęp między kartami a przyciskami
            }
            
            // Łączymy wszystkie transformacje dla trzeciej karty
            playerCard3.style.transform = `translateY(${translateY3}px) translateX(${translateX3}px) scale(${scale3})`;
            
        } else {
            playerCard3.style.opacity = 0;
            playerCard3.style.transform = 'translateY(50px)';
        }
        
        // Obsługa czwartej karty
        if (scrollPosition > card4AppearPosition) {
            // Obliczamy przezroczystość karty 4 (od 0 do 1)
            const card4Opacity = (scrollPosition - card4AppearPosition) / 100;
            playerCard4.style.opacity = Math.min(1, card4Opacity);
            
            let translateY4 = Math.max(0, 50 - (scrollPosition - card4AppearPosition) / 2);
            let scale4 = 1;
            let translateX4 = 0;
            
            // Zmniejszamy kartę 4 po dalszym przewinięciu
            if (scrollPosition > card4ShrinkStartPosition) {
                // Obliczamy skalę karty 4 (od 1 do 0.6)
                scale4 = 1 - ((scrollPosition - card4ShrinkStartPosition) / (card4ShrinkEndPosition - card4ShrinkStartPosition) * 0.4);
                // Ograniczamy skalę do minimum 0.6 (60% oryginalnej wielkości)
                scale4 = Math.max(0.6, scale4);
                
                // Przesuwamy kartę 4 w prawo po osiągnięciu minimalnego rozmiaru
                if (scrollPosition > card4MoveRightStartPosition && scale4 <= 0.6) {
                    // Obliczamy pozycję X karty 4 (od środka do docelowej pozycji)
                    const moveProgress4 = Math.min(1, (scrollPosition - card4MoveRightStartPosition) / (card4MoveRightEndPosition - card4MoveRightStartPosition));
                    translateX4 = cardInitialPosition + (card4TargetPosition - cardInitialPosition) * moveProgress4;
                }
            }
            
            // Jeśli karty są już na swoich miejscach i przyciski są widoczne, ustawiamy stałą wartość translateY
            if (scrollPosition > card5MoveLeftEndPosition + 200 && actionButtonsVisible) {
                translateY4 = -150; // Zwiększona wartość, aby uzyskać większy odstęp między kartami a przyciskami
            }
            
            // Łączymy wszystkie transformacje dla czwartej karty
            playerCard4.style.transform = `translateY(${translateY4}px) translateX(${translateX4}px) scale(${scale4})`;
            
        } else {
            playerCard4.style.opacity = 0;
            playerCard4.style.transform = 'translateY(50px)';
        }
        
        // Obsługa piątej karty
        if (scrollPosition > card5AppearPosition) {
            // Obliczamy przezroczystość karty 5 (od 0 do 1)
            const card5Opacity = (scrollPosition - card5AppearPosition) / 100;
            playerCard5.style.opacity = Math.min(1, card5Opacity);
            
            let translateY5 = Math.max(0, 50 - (scrollPosition - card5AppearPosition) / 2);
            let scale5 = 1;
            let translateX5 = 0;
            
            // Zmniejszamy kartę 5 po dalszym przewinięciu
            if (scrollPosition > card5ShrinkStartPosition) {
                // Obliczamy skalę karty 5 (od 1 do 0.6)
                scale5 = 1 - ((scrollPosition - card5ShrinkStartPosition) / (card5ShrinkEndPosition - card5ShrinkStartPosition) * 0.4);
                // Ograniczamy skalę do minimum 0.6 (60% oryginalnej wielkości)
                scale5 = Math.max(0.6, scale5);
                
                // Przesuwamy kartę 5 na środek po osiągnięciu minimalnego rozmiaru
                if (scrollPosition > card5MoveLeftStartPosition && scale5 <= 0.6) {
                    // Obliczamy pozycję X karty 5 (od środka do docelowej pozycji)
                    const moveProgress5 = Math.min(1, (scrollPosition - card5MoveLeftStartPosition) / (card5MoveLeftEndPosition - card5MoveLeftStartPosition));
                    translateX5 = cardInitialPosition + (card5TargetPosition - cardInitialPosition) * moveProgress5;
                }
            }
            
            // Jeśli karty są już na swoich miejscach i przyciski są widoczne, ustawiamy stałą wartość translateY
            if (scrollPosition > card5MoveLeftEndPosition + 200 && actionButtonsVisible) {
                translateY5 = -150; // Zwiększona wartość, aby uzyskać większy odstęp między kartami a przyciskami
            }
            
            // Łączymy wszystkie transformacje dla piątej karty
            playerCard5.style.transform = `translateY(${translateY5}px) translateX(${translateX5}px) scale(${scale5})`;
            
        } else {
            playerCard5.style.opacity = 0;
            playerCard5.style.transform = 'translateY(50px)';
        }
        
        // Pokazujemy napis HOLY FIVE po zakończeniu wszystkich animacji kart
        if (scrollPosition > card5MoveLeftEndPosition + 200) {
            // Gdy wszystkie karty są już w końcowych pozycjach, pokazujemy napis HOLY FIVE
            if (holyFiveTitle.style.opacity === "0" && !titleAnimationInProgress) {
                titleAnimationInProgress = true;
                holyFiveTitle.style.opacity = "1";
                holyFiveTitle.innerHTML = '';  // Czyścimy zawartość, aby nie dublować animacji
                // Upewniamy się, że element jest widoczny
                holyFiveTitle.style.display = "block";
                
                // Pokazujemy przyciski równocześnie z napisem
                if (!buttonsVisible) {
                    actionButtons.style.opacity = "1";
                    actionButtons.style.display = "flex";
                    buttonsVisible = true;
                }
                
                // Uruchamiamy animację maszyny losującej dla napisu HOLY FIVE z mniejszą spacją
                slotMachineEffect(holyFiveTitle, 'HOLY FIVE', 2000); // Szybsza animacja
                titleAnimationPlayed = true;
                console.log("Pokazuję napis HOLY FIVE - wszystkie karty w końcowej pozycji");
                
                // Po zakończeniu animacji resetujemy flagę
                setTimeout(() => {
                    titleAnimationInProgress = false;
                }, 2000);
            }
        } else {
            // Gdy karty jeszcze się animują lub użytkownik scrolluje w górę, ukrywamy napis i przyciski
            if (holyFiveTitle.style.opacity === "1") {
                holyFiveTitle.style.opacity = "0";
                
                // Ukrywamy również przyciski
                if (buttonsVisible) {
                    actionButtons.style.opacity = "0";
                    buttonsVisible = false;
                }
                
                // Resetujemy flagę animacji, aby mogła być odtworzona ponownie
                if (scrollPosition < card5MoveLeftEndPosition) {
                    titleAnimationPlayed = false;
                }
                
                // Czekamy na zakończenie animacji znikania przed wyczyszczeniem zawartości
                setTimeout(() => {
                    if (holyFiveTitle.style.opacity === "0") {
                        holyFiveTitle.innerHTML = '';  // Czyścimy zawartość
                    }
                }, 1000);
            }
        }
        
        // Dodajemy obsługę przewijania po osiągnięciu połowy - kontynuacja przewijania do końca
        if (scrollPosition > halfwayScrollPosition) {
            // Wszystkie karty są już na swoich miejscach, nie zmieniamy ich pozycji
            // Można dodać dodatkowe efekty po osiągnięciu połowy przewijania, jeśli potrzeba
        }
    });
}); 
