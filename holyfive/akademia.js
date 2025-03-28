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
    
    if (loadingScreen && content) {
        setTimeout(() => {
            loadingScreen.classList.add('leave-transition', 'hidden');
            content.classList.remove('hidden');
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
    
    if (!mapModal || !modalTitle || !modalBody) return;
    
    // Ustawienie tytułu
    modalTitle.textContent = title;
    
    // Czyszczenie zawartości modalnego okna
    modalBody.innerHTML = '';
    
    if (mapType === 'map') {
        // Dla mapy taktycznej tworzymy nową, czystą strukturę
        const mapContainer = document.createElement('div');
        mapContainer.className = 'map-container';
        mapContainer.style.minHeight = 'auto';
        mapContainer.style.height = 'auto';
        mapContainer.style.opacity = '1';
        mapContainer.style.padding = '20px';
        
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
    } else {
        // Dla pozostałych map wyświetlamy tylko podstawową informację
        const container = document.createElement('div');
        container.className = 'map-info-container';
        container.style.padding = '40px';
        container.style.textAlign = 'center';
        
        let infoText;
        switch (mapType) {
            case 'nuke':
                infoText = 'Taktyki na mapie Nuke zostaną wkrótce dodane.';
                break;
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
                    panelTitle.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.5s ease';
                    panelTitle.style.textShadow = '0 4px 8px rgba(0, 0, 0, 0.9)';
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
                    panelTitle.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.5s ease';
                    panelTitle.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8)';
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        },
        placeholder: {
            width: '800px',
            height: '800px',
            backgroundColor: '#000',
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
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        margin: '0',
        width: '90%',
        height: 'auto',
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto'
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
        color: '#333',
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
        color: '#666',
        textAlign: 'center'
    });
    shortcutsInfo.innerHTML = 'Skróty: <b>Ctrl+Z</b> - Cofnij, <b>Del</b> - Usuń zaznaczony';
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
                        backgroundColor: '#f0f0f0',
                        color: '#333',
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
        color: '#333',
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
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        flexWrap: 'wrap',
        marginTop: '10px'
    });
    
    // Definicje przycisków z akcjami
    const buttonDefs = [
        {
            text: 'Zaznacz',
            action: () => wlaczTrybZaznaczania(rysowanie, canvas),
            custom: true
        },
        {
            text: 'Rysuj',
            action: () => wlaczTrybRysowania(rysowanie, canvas),
            extraClass: 'draw-button'
        },
        {
            text: 'Wyczyść',
            action: () => {
                saveToUndoStack(rysowanie);
                rysowanie.shapes = [];
                rysowanie.selectedShape = null;
                if (rysowanie.ctx) {
                    rysowanie.ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                wlaczTrybZaznaczania(rysowanie, canvas);
            }
        },
        {
            text: 'Cofnij',
            action: () => {
                undo(rysowanie);
                wlaczTrybZaznaczania(rysowanie, canvas);
            }
        }
    ];
    
    // Tworzenie przycisków
    buttonDefs.forEach(def => {
        const btn = def.custom 
            ? utworzPrzyciskAkcji(def.text, rysowanie, canvas)
            : document.createElement('button');
            
        if (!def.custom) {
            btn.textContent = def.text;
            Object.assign(btn.style, {
                padding: '10px 15px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
            });
            btn.classList.add('action-button');
            if (def.extraClass) btn.classList.add(def.extraClass);
            dodajEfektHover(btn);
            btn.addEventListener('click', def.action);
        }
        
        actionsContainer.appendChild(btn);
    });
    
    toolsPanel.appendChild(actionsContainer);
};

// Tworzenie przycisku akcji zaznaczania
const utworzPrzyciskAkcji = (text, rysowanie, canvas) => {
    const button = document.createElement('button');
    button.textContent = text;
    Object.assign(button.style, {
        padding: '10px 15px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: 'Satoshi, sans-serif',
        fontSize: '0.9rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease'
    });
    dodajEfektHover(button);
    
    button.addEventListener('click', function() {
        rysowanie.isSelectMode = true;
        rysowanie.selectedShape = null;
        
        // Zmień kursor na wskaźnik
        canvas.style.cursor = 'pointer';
        
        // Usuń wyróżnienie z przycisków kolorów
        document.querySelectorAll('.color-button').forEach(btn => {
            btn.style.border = '1px solid #ccc';
            btn.style.transform = 'scale(1)';
        });
        
        // Wyróżnij przycisk zaznaczania
        document.querySelectorAll('.action-button').forEach(btn => {
            Object.assign(btn.style, {
                backgroundColor: '#f0f0f0',
                color: '#333',
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            });
        });
        
        Object.assign(this.style, {
            backgroundColor: '#ff3131',
            color: '#fff',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(255, 49, 49, 0.3)'
        });
        
        // Odrysuj canvas
        redrawCanvas(rysowanie);
    });
    button.classList.add('action-button');
    
    return button;
};

// Funkcja dodająca efekt hover do przycisków
const dodajEfektHover = (button) => {
    button.addEventListener('mouseenter', function() {
        if (this.style.backgroundColor !== '#ff3131') {
            Object.assign(this.style, {
                backgroundColor: '#e9e9e9',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
            });
        }
    });
    
    button.addEventListener('mouseleave', function() {
        if (this.style.backgroundColor !== '#ff3131') {
            Object.assign(this.style, {
                backgroundColor: '#f0f0f0',
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                rysowanie.ctx.strokeStyle = '#00ff00';
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
            
            rysowanie.ctx.strokeStyle = '#00ff00';
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
    rysowanie.stayInDrawMode = false;
    canvas.style.cursor = 'pointer';
    
    // Usuń wyróżnienie z przycisków kolorów
    document.querySelectorAll('.color-button').forEach(btn => {
        btn.style.border = '1px solid #ccc';
        btn.style.transform = 'scale(1)';
    });
    
    // Aktualizuj style przycisków
    document.querySelectorAll('.action-button').forEach(btn => {
        const isSelectButton = btn.textContent === 'Zaznacz';
        Object.assign(btn.style, {
            backgroundColor: isSelectButton ? '#ff3131' : '#f0f0f0',
            color: isSelectButton ? '#fff' : '#333',
            transform: isSelectButton ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: isSelectButton 
                ? '0 4px 8px rgba(255, 49, 49, 0.3)' 
                : '0 2px 4px rgba(0,0,0,0.1)'
        });
    });
};

// Funkcja włączająca tryb rysowania
const wlaczTrybRysowania = (rysowanie, canvas) => {
    rysowanie.isSelectMode = false;
    rysowanie.stayInDrawMode = true;
    canvas.style.cursor = 'crosshair';
    
    // Wyróżnij wybrany kolor
    document.querySelectorAll('.color-button').forEach(btn => {
        const isSelected = btn.style.backgroundColor === rysowanie.currentColor;
        btn.style.border = isSelected ? '2px solid #000' : '1px solid #ccc';
        btn.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
    });
    
    // Aktualizuj style przycisków
    document.querySelectorAll('.action-button').forEach(btn => {
        const isDrawButton = btn.textContent === 'Rysuj';
        Object.assign(btn.style, {
            backgroundColor: isDrawButton ? '#ff3131' : '#f0f0f0',
            color: isDrawButton ? '#fff' : '#333',
            transform: isDrawButton ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: isDrawButton 
                ? '0 4px 8px rgba(255, 49, 49, 0.3)' 
                : '0 2px 4px rgba(0,0,0,0.1)'
        });
    });
}; 