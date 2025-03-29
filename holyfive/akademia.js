document.addEventListener('DOMContentLoaded', () => {
    inicjalizujUI();
    inicjalizujSekcjeMapa();
    inicjalizujPoziomyUkladMap();
    inicjalizujModalneOkno();
});

// Funkcje inicjalizacyjne
const inicjalizujUI = () => {
    const pageContent = document.querySelector('.page-content');
    pageContent?.classList.add('fade-in');

    const loadingScreen = document.getElementById('loadingScreen');
    const content = document.getElementById('pageContent');
    const akademiaTitle = document.getElementById('akademiaTitle');
    
    if (loadingScreen && content) {
        setTimeout(() => {
            loadingScreen.classList.add('leave-transition', 'hidden');
            content.classList.remove('hidden');
            
            // Pokazujemy animowany tytuł AKADEMIA po zniknięciu ekranu ładowania
            setTimeout(() => {
                // Nie ustawiamy tu opacity - będzie kontrolowane przez transition w HTML
                slotMachineEffect(akademiaTitle, 'AKADEMIA', 3500);
                // Ustawiamy opacity po rozpoczęciu animacji slot machine
                akademiaTitle.style.opacity = '1';
            }, 500);
        }, 800);
    }
};

// Nowa funkcja inicjalizująca modalne okno map
const inicjalizujModalneOkno = () => {
    const mapModal = document.getElementById('mapModal');
    const closeBtn = document.querySelector('.map-modal-close');
    
    if (!mapModal || !closeBtn) return;
    
    // Obsługa zamykania okna
    closeBtn.addEventListener('click', () => zamknijModal(mapModal));
    
    // Zamykanie po kliknięciu poza zawartością
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) {
            zamknijModal(mapModal);
        }
    });
    
    // Obsługa klawisza ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mapModal.classList.contains('active')) {
            zamknijModal(mapModal);
        }
    });
};

// Funkcja otwierająca modalne okno
const otworzModal = (mapType, title) => {
    const mapModal = document.getElementById('mapModal');
    const modalTitle = document.getElementById('mapModalTitle');
    const modalBody = document.querySelector('.map-modal-body');
    const modalHeader = document.querySelector('.map-modal-header');
    
    if (!mapModal || !modalTitle || !modalBody || !modalHeader) return;
    
    // Ustawienie tytułu
    modalTitle.textContent = title;
    
    // Czyszczenie zawartości modalnego okna
    modalBody.innerHTML = '';
    
    // Dostosowanie koloru nagłówka w zależności od typu mapy
    if (mapType === 'nuke') {
        // Niebieski baner dla Nuke
        modalHeader.style.background = 'linear-gradient(to right, #7eb8e6, #4e7fb3)';
        
        // Modyfikacja nagłówka modalu - dodanie symbolu radioaktywności i żółtego napisu NUKE
        modalTitle.innerHTML = '';
        modalTitle.style.display = 'flex';
        modalTitle.style.alignItems = 'center';
        modalTitle.style.justifyContent = 'center';
        
        // Symbol radioaktywności bez żółtego tła
        const symbolNuke = document.createElement('div');
        symbolNuke.innerHTML = '☢';
        symbolNuke.style.color = '#f9eb6d';
        symbolNuke.style.fontSize = '24px';
        symbolNuke.style.marginRight = '10px';
        symbolNuke.style.display = 'flex';
        symbolNuke.style.justifyContent = 'center';
        symbolNuke.style.alignItems = 'center';
        
        // Napis NUKE
        const nukeText = document.createElement('span');
        nukeText.textContent = 'NUKE';
        nukeText.style.color = '#f9eb6d';
        nukeText.style.fontFamily = 'Racing Sans One, sans-serif';
        nukeText.style.fontSize = '1.6rem';
        nukeText.style.fontWeight = '900';
        nukeText.style.letterSpacing = '2px';
        
        // Dodanie elementów do nagłówka
        modalTitle.appendChild(symbolNuke);
        modalTitle.appendChild(nukeText);
    } else if (mapType === 'ancient') {
        // Zielony baner dla Ancient
        modalHeader.style.background = 'linear-gradient(to right, #5e7021, #3b4614)';
        modalTitle.textContent = 'ANCIENT';
    } else if (mapType === 'dust') {
        // Piaskowy baner dla Dust 2
        modalHeader.style.background = 'linear-gradient(to right, #d2b48c, #a08563)';
        modalTitle.textContent = 'DUST 2';
    } else {
        // Domyślny czerwony baner dla pozostałych
        modalHeader.style.background = 'linear-gradient(to right, var(--color-primary), #802020)';
    }
    
    if (mapType === 'map') {
        // Dla mapy taktycznej tworzymy nową, czystą strukturę
        const mapContainer = document.createElement('div');
        mapContainer.className = 'map-container';
        mapContainer.style.minHeight = 'auto';
        mapContainer.style.height = 'auto';
        mapContainer.style.opacity = '1';
        mapContainer.style.padding = '20px';
        mapContainer.style.backgroundColor = '#20242a';
        
        // Dodajemy lewy i prawy panel
        const leftSection = document.createElement('div');
        leftSection.className = 'map-left-section';
        
        const rightSection = document.createElement('div');
        rightSection.className = 'map-right-section';
        
        // Dodajemy tytuł i listę map do prawego panelu
        const mapsTitle = document.createElement('h3');
        mapsTitle.className = 'maps-title';
        mapsTitle.textContent = 'Mapy';
        
        const mapsList = document.createElement('div');
        mapsList.className = 'maps-list';
        
        // Dodajemy przyciski map
        const mapTypes = [
            { name: 'mirage', label: 'Mirage' },
            { name: 'inferno', label: 'Inferno' },
            { name: 'nuke', label: 'Nuke' },
            { name: 'ancient', label: 'Ancient' },
            { name: 'dust2', label: 'Dust 2' },
            { name: 'anubis', label: 'Anubis' }
        ];
        
        mapTypes.forEach(map => {
            const button = document.createElement('button');
            button.className = 'map-button';
            button.setAttribute('data-map', map.name);
            button.textContent = map.label;
            mapsList.appendChild(button);
        });
        
        // Składamy strukturę
        rightSection.appendChild(mapsTitle);
        rightSection.appendChild(mapsList);
        
        mapContainer.appendChild(leftSection);
        mapContainer.appendChild(rightSection);
        
        // Dodajemy do modala
        modalBody.appendChild(mapContainer);
        
        // Inicjalizujemy narzędzia
        const editorElements = utworzElementyEdytora(leftSection);
        
        // Inicjalizujemy globalne zmienne rysowania
        const rysowanie = {
            isDrawing: false,
            currentColor: '#ff3131',
            lineWidth: 2,
            ctx: null,
            lastX: 0,
            lastY: 0,
            shapes: [],
            currentShape: [],
            undoStack: [],
            isSelectMode: true,
            stayInDrawMode: false,
            selectedShape: null,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0
        };
        
        // Inicjalizujemy komponenty dla modala
        dodajPanelDoMapy(utworzPanelNarzedzi(rysowanie, editorElements.canvas), rightSection);
        inicjalizujFunkcjeRysowania(rysowanie, editorElements.canvas);
        inicjalizujPodgladPelnoekranowy(editorElements.mapImage, editorElements.canvas);
        
        // Dodajemy obsługę przycisków map w modalu
        const modalMapButtons = mapsList.querySelectorAll('.map-button');
        dodajObslugeMapPrzyciskow(
            modalMapButtons, 
            editorElements.editorContainer, 
            editorElements.mapImage, 
            editorElements.mapPlaceholder, 
            editorElements.canvas, 
            rysowanie
        );
        
        // Ustawiamy domyślny tryb zaznaczania
        setTimeout(() => {
            const selectBtn = modalBody.querySelector('.action-button');
            if (selectBtn) {
                selectBtn.style.backgroundColor = '#ff3131';
                selectBtn.style.color = '#fff';
                selectBtn.style.transform = 'translateY(-2px)';
                selectBtn.style.boxShadow = '0 4px 8px rgba(255, 49, 49, 0.3)';
                editorElements.canvas.style.cursor = 'pointer';
            }
        }, 100);
    } else if (mapType === 'nuke') {
        // Specjalna konfiguracja dla Nuke
        const container = document.createElement('div');
        container.className = 'map-info-container nuke-container';
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
        container.style.backgroundColor = '#000';
        
        // Pasek poziomy pod tytułem
        const divider = document.createElement('div');
        divider.style.width = '80%';
        divider.style.height = '3px';
        divider.style.margin = '0 auto 30px';
        divider.style.background = 'linear-gradient(to right, transparent, #7eb8e6, #f9eb6d, transparent)';
        container.appendChild(divider);
        
        // Opis mapy
        const info = document.createElement('p');
        info.className = 'map-info';
        info.innerHTML = 'Mapa <span style="color: #f9eb6d; font-weight: bold;">Nuke</span> to jedna z najbardziej ikonicznych map w CS2, przedstawiająca elektrownię jądrową. Taktyki na tej mapie zostaną wkrótce dodane.';
        info.style.color = '#e0e0e0';
        info.style.fontSize = '1.2rem';
        info.style.lineHeight = '1.5';
        info.style.marginTop = '20px';
        info.style.maxWidth = '80%';
        info.style.margin = '20px auto';
        container.appendChild(info);
        
        // Pasek informacyjny na dole
        const infoBar = document.createElement('div');
        infoBar.style.width = '100%';
        infoBar.style.padding = '15px';
        infoBar.style.backgroundColor = '#7eb8e6';
        infoBar.style.color = '#000';
        infoBar.style.fontWeight = 'bold';
        infoBar.style.borderRadius = '5px';
        infoBar.style.marginTop = '30px';
        infoBar.textContent = 'Prace nad taktykami dla tej mapy trwają...';
        container.appendChild(infoBar);
        
        modalBody.appendChild(container);
    } else if (mapType === 'ancient') {
        // Specjalna konfiguracja dla Ancient
        const container = document.createElement('div');
        container.className = 'map-info-container ancient-container';
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
        container.style.backgroundColor = '#1a2008';
        
        // Pasek poziomy pod tytułem
        const divider = document.createElement('div');
        divider.style.width = '80%';
        divider.style.height = '3px';
        divider.style.margin = '0 auto 30px';
        divider.style.background = 'linear-gradient(to right, transparent, #5e7021, #d3d3d3, transparent)';
        container.appendChild(divider);
        
        // Opis mapy
        const info = document.createElement('p');
        info.className = 'map-info';
        info.innerHTML = 'Mapa <span style="color: #d3d3d3; font-weight: bold;">Ancient</span> to nowa mapa w puli turniejowej CS2, inspirowana świątyniami Azteków i Majów. Taktyki na tej mapie zostaną wkrótce dodane.';
        info.style.color = '#e0e0e0';
        info.style.fontSize = '1.2rem';
        info.style.lineHeight = '1.5';
        info.style.marginTop = '20px';
        info.style.maxWidth = '80%';
        info.style.margin = '20px auto';
        container.appendChild(info);
        
        // Pasek informacyjny na dole
        const infoBar = document.createElement('div');
        infoBar.style.width = '100%';
        infoBar.style.padding = '15px';
        infoBar.style.backgroundColor = '#5e7021';
        infoBar.style.color = '#fff';
        infoBar.style.fontWeight = 'bold';
        infoBar.style.borderRadius = '5px';
        infoBar.style.marginTop = '30px';
        infoBar.textContent = 'Prace nad taktykami dla tej mapy trwają...';
        container.appendChild(infoBar);
        
        modalBody.appendChild(container);
    } else if (mapType === 'dust') {
        // Specjalna konfiguracja dla Dust 2
        const container = document.createElement('div');
        container.className = 'map-info-container dust-container';
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
        container.style.backgroundColor = '#36281c';
        
        // Pasek poziomy pod tytułem
        const divider = document.createElement('div');
        divider.style.width = '80%';
        divider.style.height = '3px';
        divider.style.margin = '0 auto 30px';
        divider.style.background = 'linear-gradient(to right, transparent, #d2b48c, #8b4513, transparent)';
        container.appendChild(divider);
        
        // Opis mapy
        const info = document.createElement('p');
        info.className = 'map-info';
        info.innerHTML = 'Mapa <span style="color: #d2b48c; font-weight: bold;">Dust 2</span> to prawdopodobnie najbardziej rozpoznawalna mapa w historii Counter-Strike, ulubienica graczy na całym świecie. Taktyki na tej mapie zostaną wkrótce dodane.';
        info.style.color = '#e0e0e0';
        info.style.fontSize = '1.2rem';
        info.style.lineHeight = '1.5';
        info.style.marginTop = '20px';
        info.style.maxWidth = '80%';
        info.style.margin = '20px auto';
        container.appendChild(info);
        
        // Pasek informacyjny na dole
        const infoBar = document.createElement('div');
        infoBar.style.width = '100%';
        infoBar.style.padding = '15px';
        infoBar.style.backgroundColor = '#8b4513';
        infoBar.style.color = '#fff';
        infoBar.style.fontWeight = 'bold';
        infoBar.style.borderRadius = '5px';
        infoBar.style.marginTop = '30px';
        infoBar.textContent = 'Prace nad taktykami dla tej mapy trwają...';
        container.appendChild(infoBar);
        
        modalBody.appendChild(container);
    } else {
        // Dla pozostałych map wyświetlamy tylko podstawową informację
        const container = document.createElement('div');
        container.className = 'map-info-container';
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        
        let infoText;
        switch (mapType) {
            case 'ancient':
                infoText = 'Taktyki na mapie Ancient zostaną wkrótce dodane.';
                break;
            case 'dust':
                infoText = 'Taktyki na mapie Dust 2 zostaną wkrótce dodane.';
                break;
            default:
                infoText = 'Informacje o tej mapie zostaną wkrótce dodane.';
        }
        
        const info = document.createElement('p');
        info.className = 'map-info';
        info.textContent = infoText;
        container.appendChild(info);
        
        modalBody.appendChild(container);
    }
    
    // Otwieramy modalne okno z animacją
    mapModal.classList.remove('closing');
    mapModal.classList.add('active');
    
    // Blokujemy przewijanie strony
    document.body.style.overflow = 'hidden';
};

// Funkcja zamykająca modalne okno
const zamknijModal = (mapModal) => {
    if (!mapModal) return;
    
    // Dodajemy klasę animacji zamykania
    mapModal.classList.add('closing');
    
    // Po zakończeniu animacji usuwamy klasę active
    setTimeout(() => {
        mapModal.classList.remove('active', 'closing');
        // Odblokowujemy przewijanie strony
        document.body.style.overflow = 'auto';
    }, 300);
};

// Nowa funkcja do inicjalizacji poziomego układu map
const inicjalizujPoziomyUkladMap = () => {
    const mapPanels = document.querySelectorAll('.map-panel');
    
    if (mapPanels.length === 0) return;
    
    // Dodajemy obsługę płynnego przejścia
    mapPanels.forEach(panel => {
        const mapImage = panel.querySelector('.map-panel-image');
        const panelTitle = panel.querySelector('.map-panel-title');
        const panelNumber = panel.querySelector('.map-panel-number');
        
        // Płynne pojawienie się obrazu na hover
        panel.addEventListener('mouseenter', () => {
            if (mapImage) {
                // Ustawienie płynniejszego przejścia
                mapImage.style.transition = 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                // Dodatkowe efekty dla tekstu
                if (panelTitle) {
                    panelTitle.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.5s ease, color 0.3s ease';
                    panelTitle.style.textShadow = '0 4px 8px rgba(0, 0, 0, 0.9)';
                    
                    // Zmiana koloru tytułu na czerwony dla "TABLICA" podobnie jak dla innych map
                    if (panelTitle.textContent === 'TABLICA') {
                        panelTitle.style.color = '#ff3131';
                    }
                }
                
                if (panelNumber) {
                    panelNumber.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease, text-shadow 0.5s ease';
                    panelNumber.style.textShadow = '0 4px 8px rgba(0, 0, 0, 0.9)';
                }
            }
        });
        
        // Płynne znikanie obrazu po zjechaniu myszką
        panel.addEventListener('mouseleave', () => {
            if (mapImage) {
                // Efekt opóźnionego znikania
                mapImage.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                // Przywracanie podstawowych cieni dla tekstu
                if (panelTitle) {
                    panelTitle.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.5s ease, color 0.3s ease';
                    panelTitle.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8)';
                    
                    // Przywrócenie domyślnego koloru dla "TABLICA"
                    if (panelTitle.textContent === 'TABLICA') {
                        panelTitle.style.color = '';
                    }
                }
                
                if (panelNumber) {
                    panelNumber.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease, text-shadow 0.5s ease';
                    panelNumber.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8)';
                }
            }
        });
        
        // Obsługa kliknięć w panele map
        panel.addEventListener('click', () => {
            const mapType = panel.getAttribute('data-map');
            const mapTitle = panel.querySelector('.map-panel-title').textContent;
            
            // Dodajemy efekt kliknięcia
            panel.style.transform = 'scale(0.98)';
            setTimeout(() => {
                panel.style.transform = 'scale(1)';
            }, 150);
            
            // Otwieramy modalne okno zamiast kontenera
            otworzModal(mapType, mapTitle);
        });
    });
};

// Ta funkcja nie jest już potrzebna, ponieważ używamy modala
// Pozostawiamy ją, aby kod pozostał kompatybilny
const otworzKontenerMapy = (toggleId, containerId) => {
    // Nie robimy nic - teraz używamy modalnego okna
    console.log('Używamy modalnego okna zamiast kontenerów');
};

const inicjalizujSekcjeMapa = () => {
    const mapButtons = document.querySelectorAll('.map-button');
    const mapLeftSection = document.querySelector('.map-left-section');
    const mapRightSection = document.querySelector('.map-right-section');
    
    // Konfiguracja przełączników map
    ['map', 'nuke', 'ancient', 'dust'].forEach(map => 
        setupMapToggle(`${map}Toggle`, `${map}Container`, `${map}Collapsed`));
    
    if (mapButtons.length > 0 && mapLeftSection) {
        inicjalizujEdytorMap(mapButtons, mapLeftSection, mapRightSection);
    }
};

// Funkcja pomocnicza do obsługi przełączników map
const setupMapToggle = (toggleId, containerId, storageKey) => {
    const toggle = document.getElementById(toggleId);
    const container = document.getElementById(containerId);
    
    if (!toggle || !container) return;
    
    toggle.addEventListener('click', () => {
        container.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
        localStorage.setItem(storageKey, container.classList.contains('collapsed'));
    });
    
    const savedState = localStorage.getItem(storageKey);
    if (savedState === null || savedState === 'true') {
        container.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
};

// Inicjalizacja edytora map taktycznych
const inicjalizujEdytorMap = (mapButtons, mapLeftSection, mapRightSection) => {
    const { editorContainer, mapImage, mapPlaceholder, canvas } = utworzElementyEdytora(mapLeftSection);
    
    // Zmienne globalne rysowania
    const rysowanie = {
        isDrawing: false,
        currentColor: '#ff3131',
        lineWidth: 2,
        ctx: null,
        lastX: 0,
        lastY: 0,
        shapes: [],
        currentShape: [],
        undoStack: [],
        isSelectMode: true,
        stayInDrawMode: false,
        selectedShape: null,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
    };
    
    // Utworzenie i inicjalizacja komponentów
    dodajPanelDoMapy(utworzPanelNarzedzi(rysowanie, canvas), mapRightSection);
    inicjalizujFunkcjeRysowania(rysowanie, canvas);
    inicjalizujPodgladPelnoekranowy(mapImage, canvas);
    dodajObslugeMapPrzyciskow(mapButtons, editorContainer, mapImage, mapPlaceholder, canvas, rysowanie);
    
    // Ustaw domyślnie tryb zaznaczania
    setTimeout(() => {
        const selectBtn = document.querySelector('.action-button');
        if (selectBtn) {
            selectBtn.style.backgroundColor = '#ff3131';
            selectBtn.style.color = '#fff';
            selectBtn.style.transform = 'translateY(-2px)';
            selectBtn.style.boxShadow = '0 4px 8px rgba(255, 49, 49, 0.3)';
            canvas.style.cursor = 'pointer';
        }
    }, 100);
};

// Tworzenie elementów edytora
const utworzElementyEdytora = (mapLeftSection) => {
    // Tworzenie elementów interfejsu
    const elementStyle = {
        editor: {
            position: 'relative',
            display: 'block',
            maxWidth: '60%',
            maxHeight: '60%',
            margin: '20px auto 0'
        },
        image: {
            display: 'none',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            border: '3px solid #ff3131'
        },
        placeholder: {
            width: '800px',
            height: '800px',
            backgroundColor: '#20242a',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '28px',
            fontFamily: 'Satoshi, sans-serif',
            fontWeight: '700',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
        },
        canvas: {
            position: 'absolute',
            top: '0',
            left: '0',
            cursor: 'crosshair',
            borderRadius: '8px',
            pointerEvents: 'auto',
            display: 'none'
        },
        closeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '2.5rem',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            lineHeight: '1',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            zIndex: '1000',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }
    };

    // Tworzymy kontener dla edytora
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editorContainer';
    Object.assign(editorContainer.style, elementStyle.editor);
    mapLeftSection.appendChild(editorContainer);
    
    // Dodajemy obraz mapy
    const mapImage = document.createElement('img');
    mapImage.id = 'currentMapImage';
    Object.assign(mapImage.style, elementStyle.image);
    editorContainer.appendChild(mapImage);
    
    // Dodajemy placeholder
    const mapPlaceholder = document.createElement('div');
    mapPlaceholder.id = 'mapPlaceholder';
    Object.assign(mapPlaceholder.style, elementStyle.placeholder);
    mapPlaceholder.textContent = 'WYBIERZ MAPĘ';
    editorContainer.appendChild(mapPlaceholder);
    
    // Dodajemy canvas do rysowania
    const canvas = document.createElement('canvas');
    canvas.id = 'drawingCanvas';
    Object.assign(canvas.style, elementStyle.canvas);
    editorContainer.appendChild(canvas);
    
    // Dodajemy przycisk X do zamykania całego kontenera mapy
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.id = 'mapContainerClose';
    Object.assign(closeButton.style, elementStyle.closeButton);
    mapLeftSection.appendChild(closeButton);
    
    // Dodajemy efekt hover dla przycisku zamykania
    closeButton.addEventListener('mouseenter', () => {
        Object.assign(closeButton.style, {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'rotate(90deg)'
        });
    });
    
    closeButton.addEventListener('mouseleave', () => {
        Object.assign(closeButton.style, {
            backgroundColor: 'transparent',
            transform: 'rotate(0deg)'
        });
    });
    
    // Dodajemy funkcjonalność zamykania
    closeButton.addEventListener('click', () => {
        // Jeśli jesteśmy w modalnym oknie, zamykamy je
        const mapModal = document.getElementById('mapModal');
        if (mapModal && mapModal.classList.contains('active')) {
            zamknijModal(mapModal);
        } else {
            // W przeciwnym razie ukrywamy kontener mapy
            const mapContainer = mapLeftSection.closest('.map-container');
            if (mapContainer) {
                mapContainer.classList.add('collapsed');
                const toggleId = mapContainer.id.replace('Container', 'Toggle');
                const toggle = document.getElementById(toggleId);
                if (toggle) toggle.classList.add('collapsed');
            }
        }
    });
    
    return { editorContainer, mapImage, mapPlaceholder, canvas };
};

// Tworzenie panelu narzędzi
const utworzPanelNarzedzi = (rysowanie, canvas) => {
    const toolsPanel = document.createElement('div');
    toolsPanel.id = 'toolsPanel';
    Object.assign(toolsPanel.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        padding: '20px 10px',
        backgroundColor: '#232323',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        margin: '0',
        width: '90%',
        height: 'auto',
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto',
        position: 'relative'
    });
    
    // Dodajemy komponenty panelu
    dodajTytulPanelu(toolsPanel);
    dodajSkrotyKlawiszowe(toolsPanel);
    dodajWyborKolorow(toolsPanel, rysowanie, canvas);
    dodajIkonyGraczy(toolsPanel, rysowanie, canvas);
    dodajPrzyskiAkcji(toolsPanel, rysowanie, canvas);
    
    return toolsPanel;
};

// Dodanie tytułu panelu narzędzi
const dodajTytulPanelu = (toolsPanel) => {
    const toolsTitle = document.createElement('h4');
    toolsTitle.textContent = 'Narzędzia';
    Object.assign(toolsTitle.style, {
        fontFamily: 'Satoshi, sans-serif',
        fontSize: '1rem',
        margin: '0 0 10px 0',
        color: '#e0e0e0',
        textAlign: 'center',
        borderBottom: '2px solid #ff3131',
        paddingBottom: '5px',
        width: '100%'
    });
    toolsPanel.appendChild(toolsTitle);
};

// Dodanie informacji o skrótach klawiszowych
const dodajSkrotyKlawiszowe = (toolsPanel) => {
    const shortcutsInfo = document.createElement('div');
    Object.assign(shortcutsInfo.style, {
        marginBottom: '10px',
        fontSize: '0.8rem',
        color: '#bebebe',
        textAlign: 'center'
    });
    shortcutsInfo.innerHTML = '<b>Ctrl+Z</b> - Cofnij &emsp;&emsp; <b>Del</b> - Usuń zaznaczony';
    toolsPanel.appendChild(shortcutsInfo);
};

// Dodanie wyboru kolorów
const dodajWyborKolorow = (toolsPanel, rysowanie, canvas) => {
    const colorsContainer = document.createElement('div');
    Object.assign(colorsContainer.style, {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '10px',
        width: '100%'
    });
    
    const colors = ['#ff3131', '#3186ff', '#31ff31', '#ffff31', '#ff31ff', '#00CED1', '#ffffff', '#000000'];
    
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.classList.add('color-button');
        Object.assign(colorBtn.style, {
            width: '25px',
            height: '25px',
            backgroundColor: color,
            border: color === rysowanie.currentColor ? '2px solid #000' : '1px solid #ccc',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
        });
        
        colorBtn.addEventListener('click', function() {
            document.querySelectorAll('.color-button').forEach(btn => {
                btn.style.border = '1px solid #ccc';
                btn.style.transform = 'scale(1)';
            });
            
            this.style.border = '2px solid #000';
            this.style.transform = 'scale(1.1)';
            
            rysowanie.currentColor = color;
            rysowanie.isSelectMode = false;
            
            // Aktualizacja przycisków
            document.querySelectorAll('.action-button').forEach(btn => {
                if (btn.textContent === 'Zaznacz') {
                    Object.assign(btn.style, {
                        backgroundColor: '#333',
                        color: '#e0e0e0',
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    });
                }
            });
            
            canvas.style.cursor = 'crosshair';
        });
        
        colorsContainer.appendChild(colorBtn);
    });
    
    toolsPanel.appendChild(colorsContainer);
};

// Dodanie ikon graczy
const dodajIkonyGraczy = (toolsPanel, rysowanie, canvas) => {
    const playersContainer = document.createElement('div');
    Object.assign(playersContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '10px',
        marginBottom: '10px',
        width: '100%'
    });
    
    // Etykieta
    const playersLabel = document.createElement('div');
    playersLabel.textContent = 'Gracze:';
    Object.assign(playersLabel.style, {
        fontSize: '0.9rem',
        fontFamily: 'Satoshi, sans-serif',
        color: '#e0e0e0',
        marginBottom: '8px',
        textAlign: 'center',
        width: '100%'
    });
    playersContainer.appendChild(playersLabel);
    
    // Kontener ikon
    const playersIconsContainer = document.createElement('div');
    Object.assign(playersIconsContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        width: '100%'
    });
    
    // Dodanie ikon dla graczy
    [['T', '#ff8c00'], ['CT', '#3186ff']].forEach(([team, color]) => {
        playersIconsContainer.appendChild(utworzIkoneGracza(team, color, rysowanie, canvas));
    });
    
    playersContainer.appendChild(playersIconsContainer);
    toolsPanel.appendChild(playersContainer);
};

// Funkcja tworząca ikonę gracza
const utworzIkoneGracza = (team, color, rysowanie, canvas) => {
    const icon = document.createElement('div');
    icon.classList.add('player-icon', team === 'T' ? 'terrorist-icon' : 'counter-terrorist-icon');
    Object.assign(icon.style, {
        width: '40px',
        height: '40px',
        backgroundColor: color,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    });
    icon.textContent = team;
    
    // Efekty hover
    icon.addEventListener('mouseenter', function() {
        Object.assign(this.style, {
            transform: 'scale(1.1)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        });
    });
    
    icon.addEventListener('mouseleave', function() {
        Object.assign(this.style, {
            transform: 'scale(1)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        });
    });
    
    // Funkcjonalność dodawania ikony na canvas
    icon.addEventListener('click', function() {
        if (!rysowanie.ctx) return;
        
        // Zapisz do stosu cofania
        saveToUndoStack(rysowanie);
        
        // Pozycja domyślna na środku
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Rysowanie ikony
        rysowanie.ctx.beginPath();
        rysowanie.ctx.arc(x, y, 15, 0, Math.PI * 2);
        rysowanie.ctx.fillStyle = color;
        rysowanie.ctx.fill();
        rysowanie.ctx.strokeStyle = '#000';
        rysowanie.ctx.lineWidth = 2;
        rysowanie.ctx.stroke();
        
        // Dodanie tekstu
        rysowanie.ctx.fillStyle = '#000';
        rysowanie.ctx.font = 'bold 15px Satoshi, sans-serif';
        rysowanie.ctx.textAlign = 'center';
        rysowanie.ctx.textBaseline = 'middle';
        rysowanie.ctx.fillText(team, x, y);
        
        // Dodanie do tablicy kształtów
        rysowanie.shapes.push([{
            type: 'player-icon',
            team,
            x,
            y,
            radius: 15,
            color,
            textColor: '#000'
        }]);
        
        // Po dodaniu ikony od razu włącz tryb zaznaczania
        wlaczTrybZaznaczania(rysowanie, canvas);
    });
    
    return icon;
};

// Dodanie przycisków akcji
const dodajPrzyskiAkcji = (toolsPanel, rysowanie, canvas) => {
    const actionsContainer = document.createElement('div');
    Object.assign(actionsContainer.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        marginTop: '10px',
        width: '100%'
    });
    
    // Etykieta
    const actionsLabel = document.createElement('div');
    actionsLabel.textContent = 'Akcje:';
    Object.assign(actionsLabel.style, {
        fontSize: '0.9rem',
        fontFamily: 'Satoshi, sans-serif',
        color: '#e0e0e0',
        marginBottom: '8px',
        textAlign: 'center',
        width: '100%'
    });
    actionsContainer.appendChild(actionsLabel);
    
    // Przyciski akcji
    const actionsButtonsContainer = document.createElement('div');
    Object.assign(actionsButtonsContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        width: '100%'
    });
    
    // Przycisk zaznaczania
    const selectButton = utworzPrzyciskAkcji('Zaznacz', rysowanie, canvas);
    Object.assign(selectButton.style, {
        backgroundColor: '#ff3131',
        color: '#fff',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(255, 49, 49, 0.3)'
    });
    
    // Dodanie obsługi zdarzenia dla trybu zaznaczania
    selectButton.addEventListener('click', function() {
        document.querySelectorAll('.action-button').forEach(btn => {
            btn.style.backgroundColor = '#333';
            btn.style.color = '#e0e0e0';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        
        Object.assign(this.style, {
            backgroundColor: '#ff3131',
            color: '#fff',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(255, 49, 49, 0.3)'
        });
        
        wlaczTrybZaznaczania(rysowanie, canvas);
    });
    
    // Przycisk rysowania
    const drawButton = utworzPrzyciskAkcji('Rysuj', rysowanie, canvas);
    
    drawButton.addEventListener('click', function() {
        document.querySelectorAll('.action-button').forEach(btn => {
            btn.style.backgroundColor = '#333';
            btn.style.color = '#e0e0e0';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        
        Object.assign(this.style, {
            backgroundColor: '#ff3131',
            color: '#fff',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(255, 49, 49, 0.3)'
        });
        
        wlaczTrybRysowania(rysowanie, canvas);
    });
    
    // Przycisk trybu ciągłego
    const stayInDrawModeButton = utworzPrzyciskAkcji('Tryb ciągły', rysowanie, canvas);
    
    // Ustaw początkowy wygląd przycisku w zależności od wartości flagi
    if (rysowanie.stayInDrawMode) {
        Object.assign(stayInDrawModeButton.style, {
            backgroundColor: '#ff3131',
            color: '#fff',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(255, 49, 49, 0.3)'
        });
    }
    
    stayInDrawModeButton.addEventListener('click', function() {
        rysowanie.stayInDrawMode = !rysowanie.stayInDrawMode;
        
        if (rysowanie.stayInDrawMode) {
            Object.assign(this.style, {
                backgroundColor: '#ff3131',
                color: '#fff',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(255, 49, 49, 0.3)'
            });
        } else {
            Object.assign(this.style, {
                backgroundColor: '#333',
                color: '#e0e0e0',
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            });
        }
    });
    
    actionsButtonsContainer.appendChild(selectButton);
    actionsButtonsContainer.appendChild(drawButton);
    
    // Przycisk czyszczenia
    const clearButton = utworzPrzyciskAkcji('Wyczyść', rysowanie, canvas);
    
    clearButton.addEventListener('click', function() {
        if (confirm('Czy na pewno chcesz wyczyścić całą tablicę?')) {
            rysowanie.shapes = [];
            rysowanie.undoStack = [];
            redrawCanvas(rysowanie);
        }
    });
    
    actionsButtonsContainer.appendChild(clearButton);
    
    // Dodanie wszystkich przycisków
    actionsContainer.appendChild(actionsButtonsContainer);
    toolsPanel.appendChild(actionsContainer);
};

// Funkcja tworząca przycisk akcji
const utworzPrzyciskAkcji = (text, rysowanie, canvas) => {
    const button = document.createElement('button');
    button.classList.add('action-button');
    button.textContent = text;
    Object.assign(button.style, {
        padding: '8px 12px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#333',
        color: '#e0e0e0',
        fontSize: '0.9rem',
        fontFamily: 'Satoshi, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        minWidth: '80px',
        fontWeight: 'bold'
    });
    
    // Efekty hover
    dodajEfektHover(button);
    
    return button;
};

// Dodanie efektu hover dla przycisków
const dodajEfektHover = (button) => {
    button.addEventListener('mouseenter', function() {
        if (this.style.backgroundColor !== '#ff3131') {
            Object.assign(this.style, {
                backgroundColor: '#444',
                transform: 'translateY(-1px)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.25)'
            });
        }
    });
    
    button.addEventListener('mouseleave', function() {
        if (this.style.backgroundColor !== '#ff3131') {
            Object.assign(this.style, {
                backgroundColor: '#333',
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            });
        }
    });
};

// Dodaj panel do mapy
const dodajPanelDoMapy = (toolsPanel, mapRightSection) => {
    if (mapRightSection) {
        Object.assign(mapRightSection.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '0'
        });
        mapRightSection.appendChild(toolsPanel);
    }
};

// Inicjalizacja funkcji rysowania 
const inicjalizujFunkcjeRysowania = (rysowanie, canvas) => {
    // Funkcja inicjalizująca canvas
    const initCanvas = (mapImage) => {
        if (!mapImage?.complete || !mapImage?.naturalWidth) {
            setTimeout(() => initCanvas(mapImage), 100);
            return;
        }
        
        const rect = mapImage.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        rysowanie.ctx = canvas.getContext('2d');
        rysowanie.ctx.lineCap = 'round';
        rysowanie.ctx.lineJoin = 'round';
    };
    
    // Rozpoczęcie rysowania
    const startDrawing = (e) => {
        if (rysowanie.isSelectMode) {
            handleSelectStart(e);
            return;
        }
        
        rysowanie.isDrawing = true;
        
        // Pozycja myszy
        const rect = canvas.getBoundingClientRect();
        rysowanie.lastX = e.clientX - rect.left;
        rysowanie.lastY = e.clientY - rect.top;
        
        // Nowy kształt
        rysowanie.currentShape = [{
            x: rysowanie.lastX,
            y: rysowanie.lastY,
            color: rysowanie.currentColor,
            lineWidth: rysowanie.lineWidth
        }];
    };
    
    // Rysowanie
    const draw = (e) => {
        if (rysowanie.isSelectMode) {
            handleSelectMove(e);
            return;
        }
        
        if (!rysowanie.isDrawing || !rysowanie.ctx) return;
        
        // Aktualna pozycja myszy
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Ustawienie stylu i rysowanie
        Object.assign(rysowanie.ctx, {
            lineWidth: rysowanie.lineWidth,
            globalCompositeOperation: 'source-over',
            strokeStyle: rysowanie.currentColor
        });
        
        rysowanie.ctx.beginPath();
        rysowanie.ctx.moveTo(rysowanie.lastX, rysowanie.lastY);
        rysowanie.ctx.lineTo(x, y);
        rysowanie.ctx.stroke();
        
        // Dodanie punktu
        rysowanie.currentShape.push({
            x, y, 
            color: rysowanie.currentColor,
            lineWidth: rysowanie.lineWidth
        });
        
        // Aktualizacja pozycji
        rysowanie.lastX = x;
        rysowanie.lastY = y;
    };
    
    // Koniec rysowania
    const stopDrawing = () => {
        if (rysowanie.isSelectMode) {
            handleSelectEnd();
            return;
        }
        
        if (!rysowanie.isDrawing) return;
        rysowanie.isDrawing = false;
        
        // Dodanie kształtu
        if (rysowanie.currentShape.length > 1) {
            saveToUndoStack(rysowanie);
            rysowanie.shapes.push(rysowanie.currentShape);
            
            // Auto-przełączenie do trybu zaznaczania
            if (!rysowanie.stayInDrawMode) {
                wlaczTrybZaznaczania(rysowanie, canvas);
            }
        }
        
        rysowanie.currentShape = [];
    };
    
    // Obsługa zaznaczania
    const handleSelectStart = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Sprawdzenie czy kliknięto na kształt
        const clickedShapeIndex = findShapeAt(x, y, rysowanie);
        
        if (clickedShapeIndex !== -1) {
            rysowanie.selectedShape = clickedShapeIndex;
            rysowanie.isDragging = true;
            
            // Offset przesuwania
            const shape = rysowanie.shapes[rysowanie.selectedShape];
            
            if (shape[0]?.type === 'player-icon') {
                const icon = shape[0];
                rysowanie.dragOffsetX = x - icon.x;
                rysowanie.dragOffsetY = y - icon.y;
            } else {
                const bounds = getShapeBounds(shape);
                rysowanie.dragOffsetX = x - bounds.minX;
                rysowanie.dragOffsetY = y - bounds.minY;
            }
            
            redrawCanvas(rysowanie);
        } else {
            rysowanie.selectedShape = null;
            redrawCanvas(rysowanie);
        }
    };
    
    // Przesuwanie zaznaczonego kształtu
    const handleSelectMove = (e) => {
        if (!rysowanie.isDragging || rysowanie.selectedShape === null) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Przesuwanie kształtu
        const shape = rysowanie.shapes[rysowanie.selectedShape];
        
        if (shape[0]?.type === 'player-icon') {
            const icon = shape[0];
            icon.x = x - rysowanie.dragOffsetX;
            icon.y = y - rysowanie.dragOffsetY;
        } else {
            const bounds = getShapeBounds(shape);
            const deltaX = x - rysowanie.dragOffsetX - bounds.minX;
            const deltaY = y - rysowanie.dragOffsetY - bounds.minY;
            
            shape.forEach(point => {
                point.x += deltaX;
                point.y += deltaY;
            });
        }
        
        redrawCanvas(rysowanie);
    };
    
    // Koniec zaznaczania
    const handleSelectEnd = () => {
        if (rysowanie.isDragging && rysowanie.selectedShape !== null) {
            saveToUndoStack(rysowanie);
        }
        
        rysowanie.isDragging = false;
    };
    
    // Dodanie obsługi zdarzeń
    const addEventListeners = () => {
        // Zdarzenia myszy
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Obsługa dotyku
        const createTouchHandler = (mouseEventType) => (e) => {
            e.preventDefault();
            if (e.type === 'touchend') {
                canvas.dispatchEvent(new MouseEvent(mouseEventType));
                return;
            }
            
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent(mouseEventType, {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        };
        
        canvas.addEventListener('touchstart', createTouchHandler('mousedown'));
        canvas.addEventListener('touchmove', createTouchHandler('mousemove'));
        canvas.addEventListener('touchend', createTouchHandler('mouseup'));
        
        // Obsługa klawiszy
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z - Cofnij
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                undo(rysowanie);
                wlaczTrybZaznaczania(rysowanie, canvas);
            }
            
            // Delete - Usuń zaznaczony
            if (e.key === 'Delete' && rysowanie.selectedShape !== null) {
                saveToUndoStack(rysowanie);
                rysowanie.shapes.splice(rysowanie.selectedShape, 1);
                rysowanie.selectedShape = null;
                redrawCanvas(rysowanie);
                wlaczTrybZaznaczania(rysowanie, canvas);
            }
        });
    };
    
    // Dodanie event listenerów
    addEventListeners();
    
    // Eksportowanie funkcji inicjalizacji canvasa
    rysowanie.initCanvas = initCanvas;
};

// Inicjalizacja podglądu pełnoekranowego
const inicjalizujPodgladPelnoekranowy = (mapImage, canvas) => {
    // Tworzenie elementów
    const elements = {
        overlay: document.createElement('div'),
        image: document.createElement('img'),
        closeButton: document.createElement('span')
    };
    
    // Konfiguracja overlay
    elements.overlay.id = 'mapFullscreenOverlay';
    elements.overlay.style.display = 'none';
    elements.overlay.classList.add('map-fullscreen-overlay');
    
    // Konfiguracja obrazu
    elements.image.id = 'fullscreenMapImage';
    elements.image.classList.add('fullscreen-map-image');
    
    // Konfiguracja przycisku zamknięcia
    elements.closeButton.id = 'closeFullscreenButton';
    elements.closeButton.classList.add('close-fullscreen-button');
    elements.closeButton.innerHTML = '&times;';
    
    // Złożenie elementów
    elements.overlay.appendChild(elements.image);
    elements.overlay.appendChild(elements.closeButton);
    document.body.appendChild(elements.overlay);
    
    // Obsługa kliknięcia w obraz - powiększanie
    mapImage.addEventListener('click', () => {
        // Połączenie mapy i rysunku
        const dataURL = canvas.toDataURL();
        const img = new Image();
        
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Warstwowe rysowanie
            tempCtx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
            tempCtx.drawImage(img, 0, 0);
            
            // Wyświetlenie wyniku
            elements.image.src = tempCanvas.toDataURL();
            elements.overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };
        
        img.src = dataURL;
    });
    
    // Obsługa zamykania podglądu
    const closeFullscreen = () => {
        elements.overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    
    elements.closeButton.addEventListener('click', closeFullscreen);
    elements.overlay.addEventListener('click', (e) => {
        if (e.target === elements.overlay) closeFullscreen();
    });
};

// Dodanie obsługi przycisków map
const dodajObslugeMapPrzyciskow = (mapButtons, editorContainer, mapImage, mapPlaceholder, canvas, rysowanie) => {
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Reset UI
            mapButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Pobierz nazwę mapy
            const mapName = this.getAttribute('data-map');
            
            // Aktualizacja UI
            editorContainer.style.display = 'block';
            mapPlaceholder.style.display = 'none';
            
            // Konfiguracja obrazu mapy
            Object.assign(mapImage, {
                src: `${mapName}.png`,
                alt: `Mapa ${mapName}`,
                onload: function() {
                    rysowanie.initCanvas(mapImage);
                    canvas.style.cursor = rysowanie.isSelectMode ? 'pointer' : 'crosshair';
                },
                onerror: function() {
                    console.error(`Nie udało się załadować obrazu mapy: ${mapName}.png`);
                    mapImage.style.display = 'none';
                    mapPlaceholder.textContent = `BŁĄD ŁADOWANIA MAPY: ${mapName}`;
                    mapPlaceholder.style.display = 'flex';
                }
            });
            
            // Konfiguracja stylów
            Object.assign(mapImage.style, {
                display: 'block',
                marginTop: '0',
                transition: 'all 0.3s ease'
            });
            
            // Konfiguracja canvas
            canvas.style.display = 'block';
            
            // Reset stanu rysowania
            if (rysowanie.ctx) {
                rysowanie.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            rysowanie.shapes = [];
            rysowanie.selectedShape = null;
        });
    });
};

// Pomocnicze funkcje dla rysowania

// Znajdowanie kształtu pod kursorem
const findShapeAt = (x, y, rysowanie) => {
    // Sprawdzamy od najnowszych
    for (let i = rysowanie.shapes.length - 1; i >= 0; i--) {
        const shape = rysowanie.shapes[i];
        if (!shape.length) continue;
        
        // Sprawdź czy to ikona gracza
        if (shape[0]?.type === 'player-icon') {
            const icon = shape[0];
            const distance = Math.sqrt((x - icon.x)**2 + (y - icon.y)**2);
            if (distance <= icon.radius) return i;
            continue;
        }
        
        // Standardowe sprawdzanie dla linii
        if (isPointInShape(x, y, shape, rysowanie.lineWidth)) {
            return i;
        }
    }
    return -1;
};

// Sprawdza, czy punkt jest w kształcie
const isPointInShape = (x, y, shape, lineWidth) => {
    const tolerance = lineWidth * 2; // Tolerancja
    
    for (let i = 1; i < shape.length; i++) {
        const p1 = shape[i - 1];
        const p2 = shape[i];
        
        // Odległość punktu od linii
        if (distanceToLine(x, y, p1.x, p1.y, p2.x, p2.y) < tolerance) {
            return true;
        }
    }
    
    return false;
};

// Oblicza odległość punktu od linii
const distanceToLine = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
        param = dot / len_sq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
};

// Pobierz granice kształtu
const getShapeBounds = (shape) => {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    // Sprawdź czy to ikona gracza
    if (shape[0]?.type === 'player-icon') {
        const icon = shape[0];
        minX = icon.x - icon.radius;
        minY = icon.y - icon.radius;
        maxX = icon.x + icon.radius;
        maxY = icon.y + icon.radius;
    } else {
        // Standardowe kształty
        shape.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
    }
    
    return { minX, minY, maxX, maxY };
};

// Zapisanie stanu do cofania
const saveToUndoStack = (rysowanie) => {
    rysowanie.undoStack.push(JSON.stringify(rysowanie.shapes));
};

// Cofnięcie operacji
const undo = (rysowanie) => {
    if (rysowanie.undoStack.length === 0) return;
    
    rysowanie.shapes = JSON.parse(rysowanie.undoStack.pop());
    rysowanie.selectedShape = null;
    redrawCanvas(rysowanie);
};

// Odrysowanie canvasa
const redrawCanvas = (rysowanie) => {
    if (!rysowanie.ctx) return;
    
    // Wyczyść canvas
    rysowanie.ctx.clearRect(0, 0, rysowanie.ctx.canvas.width, rysowanie.ctx.canvas.height);
    
    // Rysuj wszystkie kształty
    rysowanie.shapes.forEach((shape, s) => {
        if (shape.length < 1) return;
        
        // Ikona gracza
        if (shape[0]?.type === 'player-icon') {
            const icon = shape[0];
            
            // Okrągła ikonka
            rysowanie.ctx.beginPath();
            rysowanie.ctx.arc(icon.x, icon.y, icon.radius, 0, Math.PI * 2);
            rysowanie.ctx.fillStyle = icon.color;
            rysowanie.ctx.fill();
            rysowanie.ctx.strokeStyle = '#000';
            rysowanie.ctx.lineWidth = 2;
            rysowanie.ctx.stroke();
            
            // Tekst
            rysowanie.ctx.fillStyle = icon.textColor;
            rysowanie.ctx.font = 'bold 15px Satoshi, sans-serif';
            rysowanie.ctx.textAlign = 'center';
            rysowanie.ctx.textBaseline = 'middle';
            rysowanie.ctx.fillText(icon.team, icon.x, icon.y);
            
            // Zaznaczenie
            if (s === rysowanie.selectedShape) {
                rysowanie.ctx.strokeStyle = '#ff3131';
                rysowanie.ctx.lineWidth = 2;
                rysowanie.ctx.setLineDash([5, 3]);
                rysowanie.ctx.beginPath();
                rysowanie.ctx.arc(icon.x, icon.y, icon.radius + 5, 0, Math.PI * 2);
                rysowanie.ctx.stroke();
                rysowanie.ctx.setLineDash([]);
            }
            
            return;
        }
        
        // Standardowe linie
        if (shape.length < 2) return;
        
        // Styl
        Object.assign(rysowanie.ctx, {
            lineWidth: shape[0].lineWidth,
            strokeStyle: shape[0].color,
            globalCompositeOperation: 'source-over'
        });
        
        // Rysowanie ścieżki
        rysowanie.ctx.beginPath();
        rysowanie.ctx.moveTo(shape[0].x, shape[0].y);
        
        for (let i = 1; i < shape.length; i++) {
            rysowanie.ctx.lineTo(shape[i].x, shape[i].y);
        }
        
        rysowanie.ctx.stroke();
        
        // Zaznaczenie
        if (s === rysowanie.selectedShape) {
            const bounds = getShapeBounds(shape);
            
            rysowanie.ctx.strokeStyle = '#ff3131';
            rysowanie.ctx.lineWidth = 2;
            rysowanie.ctx.setLineDash([5, 3]);
            rysowanie.ctx.strokeRect(
                bounds.minX - 5,
                bounds.minY - 5,
                bounds.maxX - bounds.minX + 10,
                bounds.maxY - bounds.minY + 10
            );
            rysowanie.ctx.setLineDash([]);
        }
    });
};

// Funkcja włączająca tryb zaznaczania
const wlaczTrybZaznaczania = (rysowanie, canvas) => {
    rysowanie.isSelectMode = true;
    rysowanie.selectedShape = null;
    
    // Zmiana kursora
    canvas.style.cursor = 'pointer';
    
    // Uaktualnienie stanu przycisków
    document.querySelectorAll('.action-button').forEach(btn => {
        const isSelectButton = btn.textContent === 'Zaznacz';
        
        Object.assign(btn.style, {
            backgroundColor: isSelectButton ? '#ff3131' : '#333',
            color: isSelectButton ? '#fff' : '#e0e0e0',
            transform: isSelectButton ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: isSelectButton 
                ? '0 4px 8px rgba(255, 49, 49, 0.3)'
                : '0 2px 4px rgba(0,0,0,0.2)'
        });
    });
    
    // Usunięcie wyróżnienia z przycisków kolorów
    document.querySelectorAll('.color-button').forEach(btn => {
        btn.style.border = '1px solid #ccc';
        btn.style.transform = 'scale(1)';
    });
};

// Funkcja włączająca tryb rysowania
const wlaczTrybRysowania = (rysowanie, canvas) => {
    rysowanie.isSelectMode = false;
    rysowanie.selectedShape = null;
    
    // Zmiana kursora
    canvas.style.cursor = 'crosshair';
    
    // Wyróżnij wybrany kolor
    document.querySelectorAll('.color-button').forEach(btn => {
        const isSelected = btn.style.backgroundColor === rysowanie.currentColor;
        btn.style.border = isSelected ? '2px solid #000' : '1px solid #ccc';
        btn.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
    });
    
    // Uaktualnienie stanu przycisków
    document.querySelectorAll('.action-button').forEach(btn => {
        const isDrawButton = btn.textContent === 'Rysuj';
        
        Object.assign(btn.style, {
            backgroundColor: isDrawButton ? '#ff3131' : '#333',
            color: isDrawButton ? '#fff' : '#e0e0e0',
            transform: isDrawButton ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: isDrawButton 
                ? '0 4px 8px rgba(255, 49, 49, 0.3)'
                : '0 2px 4px rgba(0,0,0,0.2)'
        });
    });
};

// Funkcja do animacji maszyny losującej - zastąpiona wersją z zawodnicy.js
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