document.addEventListener('DOMContentLoaded', function() {
    // Inicjalizacja interfejsu
    inicjalizujUI();
    
    // Obsługa sekcji map i przełączników
    inicjalizujSekcjeMapa();
});

// Funkcje inicjalizacyjne
function inicjalizujUI() {
    // Dodanie klasy fade-in do głównej zawartości
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.classList.add('fade-in');
    }

    // Obsługa ładowania strony
    const loadingScreen = document.getElementById('loadingScreen');
    const content = document.getElementById('pageContent');
    
    if (loadingScreen && content) {
        setTimeout(() => {
            loadingScreen.classList.add('leave-transition');
            loadingScreen.classList.add('hidden');
            content.classList.remove('hidden');
        }, 800);
    }
}

function inicjalizujSekcjeMapa() {
    // Obsługa przycisków map w panelu taktycznym
    const mapButtons = document.querySelectorAll('.map-button');
    const mapLeftSection = document.querySelector('.map-left-section');
    const mapRightSection = document.querySelector('.map-right-section');
    
    // Konfiguracja wszystkich przełączników map
    setupMapToggle('mapToggle', 'mapContainer', 'mapCollapsed');
    setupMapToggle('nukeToggle', 'nukeContainer', 'nukeCollapsed');
    setupMapToggle('ancientToggle', 'ancientContainer', 'ancientCollapsed');
    setupMapToggle('dustToggle', 'dustContainer', 'dustCollapsed');
    
    if (mapButtons.length > 0 && mapLeftSection) {
        // Inicjalizacja edytora map
        inicjalizujEdytorMap(mapButtons, mapLeftSection, mapRightSection);
    }
}

// Funkcja pomocnicza do obsługi przełączników map
function setupMapToggle(toggleId, containerId, storageKey) {
    const toggle = document.getElementById(toggleId);
    const container = document.getElementById(containerId);
    
    if (toggle && container) {
        toggle.addEventListener('click', () => {
            // Przełączanie klasy collapsed dla kontenera mapy
            container.classList.toggle('collapsed');
            
            // Przełączanie klasy collapsed dla ikony
            toggle.classList.toggle('collapsed');
            
            // Zapisanie stanu w localStorage
            const isCollapsed = container.classList.contains('collapsed');
            localStorage.setItem(storageKey, isCollapsed);
        });
        
        // Sprawdzenie, czy jest zapisany stan w localStorage
        const savedState = localStorage.getItem(storageKey);
        
        // Jeśli nie ma zapisanego stanu lub strona jest ładowana po raz pierwszy, 
        // ustaw wszystkie sekcje jako zwinięte
        if (savedState === null || savedState === 'true') {
            container.classList.add('collapsed');
            toggle.classList.add('collapsed');
        }
    }
}

// Inicjalizacja edytora map taktycznych
function inicjalizujEdytorMap(mapButtons, mapLeftSection, mapRightSection) {
    // Tworzenie struktury edytora
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
    
    // Utworzenie panelu narzędzi
    const toolsPanel = utworzPanelNarzedzi(rysowanie, canvas);
    dodajPanelDoMapy(toolsPanel, mapRightSection);
    
    // Inicjalizacja funkcji rysowania
    inicjalizujFunkcjeRysowania(rysowanie, canvas);
    
    // Inicjalizacja pełnoekranowego podglądu
    inicjalizujPodgladPelnoekranowy(mapImage, canvas);
    
    // Obsługa przycisków map
    dodajObslugeMapPrzyciskow(mapButtons, editorContainer, mapImage, mapPlaceholder, canvas, rysowanie);
    
    // Ustaw domyślnie tryb zaznaczania w interfejsie
    setTimeout(() => {
        const selectBtn = document.querySelector('.action-button');
        if (selectBtn) {
            // Wyróżnij przycisk zaznaczania
            selectBtn.style.backgroundColor = '#ff3131';
            selectBtn.style.color = '#fff';
            selectBtn.style.transform = 'translateY(-2px)';
            selectBtn.style.boxShadow = '0 4px 8px rgba(255, 49, 49, 0.3)';
            
            // Ustaw kursor na wskaźnik
            canvas.style.cursor = 'pointer';
        }
    }, 100);
}

// Tworzenie elementów edytora
function utworzElementyEdytora(mapLeftSection) {
    // Tworzymy kontener dla edytora (canvas ponad obrazem)
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editorContainer';
    editorContainer.style.position = 'relative';
    editorContainer.style.display = 'block';
    editorContainer.style.maxWidth = '60%';
    editorContainer.style.maxHeight = '60%';
    editorContainer.style.margin = '20px auto 0';
    mapLeftSection.appendChild(editorContainer);
    
    // Dodajemy obraz mapy
    let mapImage = document.createElement('img');
    mapImage.id = 'currentMapImage';
    mapImage.style.display = 'none';
    mapImage.style.maxWidth = '100%';
    mapImage.style.maxHeight = '100%';
    mapImage.style.borderRadius = '8px';
    mapImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    editorContainer.appendChild(mapImage);
    
    // Dodajemy placeholder z informacją o wyborze mapy
    const mapPlaceholder = document.createElement('div');
    mapPlaceholder.id = 'mapPlaceholder';
    mapPlaceholder.style.width = '800px';
    mapPlaceholder.style.height = '800px';
    mapPlaceholder.style.backgroundColor = '#000';
    mapPlaceholder.style.color = '#fff';
    mapPlaceholder.style.display = 'flex';
    mapPlaceholder.style.justifyContent = 'center';
    mapPlaceholder.style.alignItems = 'center';
    mapPlaceholder.style.fontSize = '28px';
    mapPlaceholder.style.fontFamily = 'Satoshi, sans-serif';
    mapPlaceholder.style.fontWeight = '700';
    mapPlaceholder.style.borderRadius = '8px';
    mapPlaceholder.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    mapPlaceholder.style.transition = 'all 0.3s ease';
    mapPlaceholder.textContent = 'WYBIERZ MAPĘ';
    editorContainer.appendChild(mapPlaceholder);
    
    // Dodajemy canvas do rysowania
    const canvas = document.createElement('canvas');
    canvas.id = 'drawingCanvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.cursor = 'crosshair';
    canvas.style.borderRadius = '8px';
    canvas.style.pointerEvents = 'auto';
    canvas.style.display = 'none';
    editorContainer.appendChild(canvas);
    
    return { editorContainer, mapImage, mapPlaceholder, canvas };
}

// Tworzenie panelu narzędzi
function utworzPanelNarzedzi(rysowanie, canvas) {
    const toolsPanel = document.createElement('div');
    toolsPanel.id = 'toolsPanel';
    toolsPanel.style.display = 'flex';
    toolsPanel.style.flexDirection = 'column';
    toolsPanel.style.alignItems = 'center';
    toolsPanel.style.justifyContent = 'center';
    toolsPanel.style.gap = '15px';
    toolsPanel.style.padding = '20px 10px';
    toolsPanel.style.backgroundColor = '#f5f5f5';
    toolsPanel.style.borderRadius = '8px';
    toolsPanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
    toolsPanel.style.margin = '0';
    toolsPanel.style.width = '90%';
    toolsPanel.style.height = 'auto';
    toolsPanel.style.maxHeight = 'calc(100vh - 300px)';
    toolsPanel.style.overflowY = 'auto';
    
    // Dodanie tytułu panelu narzędzi
    dodajTytulPanelu(toolsPanel);
    
    // Dodanie informacji o skrótach klawiszowych
    dodajSkrotyKlawiszowe(toolsPanel);
    
    // Dodanie wyboru kolorów
    dodajWyborKolorow(toolsPanel, rysowanie, canvas);
    
    // Dodanie ikon graczy
    dodajIkonyGraczy(toolsPanel, rysowanie, canvas);
    
    // Dodanie przycisków akcji
    dodajPrzyskiAkcji(toolsPanel, rysowanie, canvas);
    
    return toolsPanel;
}

// Dodanie tytułu panelu narzędzi
function dodajTytulPanelu(toolsPanel) {
    const toolsTitle = document.createElement('h4');
    toolsTitle.textContent = 'Narzędzia';
    toolsTitle.style.fontFamily = 'Satoshi, sans-serif';
    toolsTitle.style.fontSize = '1rem';
    toolsTitle.style.margin = '0 0 10px 0';
    toolsTitle.style.color = '#333';
    toolsTitle.style.textAlign = 'center';
    toolsTitle.style.borderBottom = '2px solid #ff3131';
    toolsTitle.style.paddingBottom = '5px';
    toolsTitle.style.width = '100%';
    toolsPanel.appendChild(toolsTitle);
}

// Dodanie informacji o skrótach klawiszowych
function dodajSkrotyKlawiszowe(toolsPanel) {
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.style.marginBottom = '10px';
    shortcutsInfo.style.fontSize = '0.8rem';
    shortcutsInfo.style.color = '#666';
    shortcutsInfo.style.textAlign = 'center';
    shortcutsInfo.innerHTML = 'Skróty: <b>Ctrl+Z</b> - Cofnij, <b>Del</b> - Usuń zaznaczony';
    toolsPanel.appendChild(shortcutsInfo);
}

// Dodanie wyboru kolorów
function dodajWyborKolorow(toolsPanel, rysowanie, canvas) {
    const colorsContainer = document.createElement('div');
    colorsContainer.style.display = 'flex';
    colorsContainer.style.flexWrap = 'wrap';
    colorsContainer.style.justifyContent = 'center';
    colorsContainer.style.gap = '8px';
    colorsContainer.style.marginBottom = '10px';
    colorsContainer.style.width = '100%';
    
    const colors = ['#ff3131', '#3186ff', '#31ff31', '#ffff31', '#ff31ff', '#00CED1', '#ffffff', '#000000'];
    
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.classList.add('color-button');
        colorBtn.style.width = '25px';
        colorBtn.style.height = '25px';
        colorBtn.style.backgroundColor = color;
        colorBtn.style.border = color === rysowanie.currentColor ? '2px solid #000' : '1px solid #ccc';
        colorBtn.style.borderRadius = '50%';
        colorBtn.style.cursor = 'pointer';
        colorBtn.style.transition = 'transform 0.2s ease';
        
        colorBtn.addEventListener('click', function() {
            document.querySelectorAll('.color-button').forEach(btn => {
                btn.style.border = '1px solid #ccc';
                btn.style.transform = 'scale(1)';
            });
            
            this.style.border = '2px solid #000';
            this.style.transform = 'scale(1.1)';
            
            rysowanie.currentColor = color;
            rysowanie.isSelectMode = false;
            
            // Wyłącz wyróżnienie przycisku zaznaczania
            document.querySelectorAll('.action-button').forEach(btn => {
                if (btn.textContent === 'Zaznacz') {
                    btn.style.backgroundColor = '#f0f0f0';
                    btn.style.color = '#333';
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
            });
            
            canvas.style.cursor = 'crosshair';
        });
        
        colorsContainer.appendChild(colorBtn);
    });
    
    toolsPanel.appendChild(colorsContainer);
}

// Dodanie ikon graczy
function dodajIkonyGraczy(toolsPanel, rysowanie, canvas) {
    const playersContainer = document.createElement('div');
    playersContainer.style.display = 'flex';
    playersContainer.style.justifyContent = 'center';
    playersContainer.style.gap = '15px';
    playersContainer.style.marginTop = '10px';
    playersContainer.style.marginBottom = '10px';
    playersContainer.style.width = '100%';
    
    // Etykieta
    const playersLabel = document.createElement('div');
    playersLabel.textContent = 'Gracze:';
    playersLabel.style.fontSize = '0.9rem';
    playersLabel.style.fontFamily = 'Satoshi, sans-serif';
    playersLabel.style.color = '#333';
    playersLabel.style.marginBottom = '8px';
    playersLabel.style.textAlign = 'center';
    playersLabel.style.width = '100%';
    playersContainer.appendChild(playersLabel);
    
    // Kontener ikon
    const playersIconsContainer = document.createElement('div');
    playersIconsContainer.style.display = 'flex';
    playersIconsContainer.style.justifyContent = 'center';
    playersIconsContainer.style.gap = '20px';
    playersIconsContainer.style.width = '100%';
    
    // Tworzenie ikony T
    const terroristIcon = utworzIkoneGracza('T', '#ff8c00', rysowanie, canvas);
    playersIconsContainer.appendChild(terroristIcon);
    
    // Tworzenie ikony CT
    const counterTerroristIcon = utworzIkoneGracza('CT', '#3186ff', rysowanie, canvas);
    playersIconsContainer.appendChild(counterTerroristIcon);
    
    playersContainer.appendChild(playersIconsContainer);
    toolsPanel.appendChild(playersContainer);
}

// Funkcja tworząca ikonę gracza
function utworzIkoneGracza(team, color, rysowanie, canvas) {
    const icon = document.createElement('div');
    icon.classList.add('player-icon', team === 'T' ? 'terrorist-icon' : 'counter-terrorist-icon');
    icon.style.width = '40px';
    icon.style.height = '40px';
    icon.style.backgroundColor = color;
    icon.style.borderRadius = '50%';
    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';
    icon.style.color = '#000';
    icon.style.fontWeight = 'bold';
    icon.style.fontSize = '16px';
    icon.style.cursor = 'pointer';
    icon.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    icon.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    icon.textContent = team;
    
    // Efekty hover
    icon.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    });
    
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
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
        const playerIcon = {
            type: 'player-icon',
            team: team,
            x: x,
            y: y,
            radius: 15,
            color: color,
            textColor: '#000'
        };
        
        rysowanie.shapes.push([playerIcon]);
        
        // Po dodaniu ikony od razu włącz tryb zaznaczania
        wlaczTrybZaznaczania(rysowanie, canvas);
    });
    
    return icon;
}

// Dodanie przycisków akcji
function dodajPrzyskiAkcji(toolsPanel, rysowanie, canvas) {
    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'flex';
    actionsContainer.style.justifyContent = 'center';
    actionsContainer.style.gap = '10px';
    actionsContainer.style.width = '100%';
    actionsContainer.style.flexWrap = 'wrap';
    actionsContainer.style.marginTop = '10px';
    
    // Przycisk zaznaczania
    const selectBtn = utworzPrzyciskAkcji('Zaznacz', rysowanie, canvas);
    actionsContainer.appendChild(selectBtn);
    
    // Przycisk rysowania
    const drawBtn = document.createElement('button');
    drawBtn.textContent = 'Rysuj';
    drawBtn.style.padding = '10px 15px';
    drawBtn.style.backgroundColor = '#f0f0f0';
    drawBtn.style.color = '#333';
    drawBtn.style.border = 'none';
    drawBtn.style.borderRadius = '5px';
    drawBtn.style.cursor = 'pointer';
    drawBtn.style.fontFamily = 'Satoshi, sans-serif';
    drawBtn.style.fontSize = '0.9rem';
    drawBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    drawBtn.style.transition = 'all 0.2s ease';
    drawBtn.classList.add('action-button', 'draw-button');
    dodajEfektHover(drawBtn);
    
    drawBtn.addEventListener('click', function() {
        wlaczTrybRysowania(rysowanie, canvas);
    });
    
    actionsContainer.appendChild(drawBtn);
    
    // Przycisk czyszczenia
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Wyczyść';
    clearBtn.style.padding = '10px 15px';
    clearBtn.style.backgroundColor = '#f0f0f0';
    clearBtn.style.color = '#333';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '5px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontFamily = 'Satoshi, sans-serif';
    clearBtn.style.fontSize = '0.9rem';
    clearBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    clearBtn.style.transition = 'all 0.2s ease';
    clearBtn.classList.add('action-button');
    dodajEfektHover(clearBtn);
    
    clearBtn.addEventListener('click', function() {
        // Zapisz aktualny stan do cofania
        saveToUndoStack(rysowanie);
        
        // Wyczyść wszystkie kształty i canvas
        rysowanie.shapes = [];
        rysowanie.selectedShape = null;
        if (rysowanie.ctx) {
            rysowanie.ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Po czyszczeniu włącz tryb zaznaczania
        wlaczTrybZaznaczania(rysowanie, canvas);
    });
    
    actionsContainer.appendChild(clearBtn);
    
    // Przycisk cofania
    const undoBtn = document.createElement('button');
    undoBtn.textContent = 'Cofnij';
    undoBtn.style.padding = '10px 15px';
    undoBtn.style.backgroundColor = '#f0f0f0';
    undoBtn.style.color = '#333';
    undoBtn.style.border = 'none';
    undoBtn.style.borderRadius = '5px';
    undoBtn.style.cursor = 'pointer';
    undoBtn.style.fontFamily = 'Satoshi, sans-serif';
    undoBtn.style.fontSize = '0.9rem';
    undoBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    undoBtn.style.transition = 'all 0.2s ease';
    undoBtn.classList.add('action-button');
    dodajEfektHover(undoBtn);
    
    undoBtn.addEventListener('click', function() {
        undo(rysowanie);
        
        // Po cofnięciu włącz tryb zaznaczania
        wlaczTrybZaznaczania(rysowanie, canvas);
    });
    
    actionsContainer.appendChild(undoBtn);
    toolsPanel.appendChild(actionsContainer);
}

// Tworzenie przycisku akcji zaznaczania
function utworzPrzyciskAkcji(text, rysowanie, canvas) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#f0f0f0';
    button.style.color = '#333';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Satoshi, sans-serif';
    button.style.fontSize = '0.9rem';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    button.style.transition = 'all 0.2s ease';
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
            btn.style.backgroundColor = '#f0f0f0';
            btn.style.color = '#333';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });
        this.style.backgroundColor = '#ff3131';
        this.style.color = '#fff';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(255, 49, 49, 0.3)';
        
        // Odrysuj canvas
        redrawCanvas(rysowanie);
    });
    button.classList.add('action-button');
    
    return button;
}

// Funkcja dodająca efekt hover do przycisków
function dodajEfektHover(button) {
    button.addEventListener('mouseenter', function() {
        if (this.style.backgroundColor !== '#ff3131') {
            this.style.backgroundColor = '#e9e9e9';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }
    });
    
    button.addEventListener('mouseleave', function() {
        if (this.style.backgroundColor !== '#ff3131') {
            this.style.backgroundColor = '#f0f0f0';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
    });
}

// Dodaj panel do mapy
function dodajPanelDoMapy(toolsPanel, mapRightSection) {
    if (mapRightSection) {
        mapRightSection.style.display = 'flex';
        mapRightSection.style.flexDirection = 'column';
        mapRightSection.style.alignItems = 'center';
        mapRightSection.style.justifyContent = 'center';
        mapRightSection.style.paddingTop = '0';
        mapRightSection.appendChild(toolsPanel);
    }
}

// Inicjalizacja funkcji rysowania 
function inicjalizujFunkcjeRysowania(rysowanie, canvas) {
    // Funkcja inicjalizująca canvas
    function initCanvas(mapImage) {
        if (!mapImage || !mapImage.complete || !mapImage.naturalWidth) {
            setTimeout(() => initCanvas(mapImage), 100);
            return;
        }
        
        const rect = mapImage.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        rysowanie.ctx = canvas.getContext('2d');
        rysowanie.ctx.lineCap = 'round';
        rysowanie.ctx.lineJoin = 'round';
    }
    
    // Rozpoczęcie rysowania
    function startDrawing(e) {
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
    }
    
    // Rysowanie
    function draw(e) {
        if (rysowanie.isSelectMode) {
            handleSelectMove(e);
            return;
        }
        
        if (!rysowanie.isDrawing || !rysowanie.ctx) return;
        
        // Aktualna pozycja myszy
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Styl rysowania
        rysowanie.ctx.lineWidth = rysowanie.lineWidth;
        rysowanie.ctx.globalCompositeOperation = 'source-over';
        rysowanie.ctx.strokeStyle = rysowanie.currentColor;
        
        // Rysowanie linii
        rysowanie.ctx.beginPath();
        rysowanie.ctx.moveTo(rysowanie.lastX, rysowanie.lastY);
        rysowanie.ctx.lineTo(x, y);
        rysowanie.ctx.stroke();
        
        // Dodanie punktu
        rysowanie.currentShape.push({
            x: x,
            y: y,
            color: rysowanie.currentColor,
            lineWidth: rysowanie.lineWidth
        });
        
        // Aktualizacja pozycji
        rysowanie.lastX = x;
        rysowanie.lastY = y;
    }
    
    // Koniec rysowania
    function stopDrawing() {
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
            
            // Po zakończeniu rysowania automatycznie włącz tryb zaznaczania,
            // chyba że jesteśmy w trybie stałego rysowania
            if (!rysowanie.stayInDrawMode) {
                wlaczTrybZaznaczania(rysowanie, canvas);
            }
        }
        
        rysowanie.currentShape = [];
    }
    
    // Obsługa zaznaczania
    function handleSelectStart(e) {
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
            
            if (shape[0] && shape[0].type === 'player-icon') {
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
    }
    
    // Przesuwanie zaznaczonego kształtu
    function handleSelectMove(e) {
        if (!rysowanie.isDragging || rysowanie.selectedShape === null) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Przesuwanie kształtu
        const shape = rysowanie.shapes[rysowanie.selectedShape];
        
        if (shape[0] && shape[0].type === 'player-icon') {
            const icon = shape[0];
            icon.x = x - rysowanie.dragOffsetX;
            icon.y = y - rysowanie.dragOffsetY;
        } else {
            const bounds = getShapeBounds(shape);
            const deltaX = x - rysowanie.dragOffsetX - bounds.minX;
            const deltaY = y - rysowanie.dragOffsetY - bounds.minY;
            
            for (let i = 0; i < shape.length; i++) {
                shape[i].x += deltaX;
                shape[i].y += deltaY;
            }
        }
        
        redrawCanvas(rysowanie);
    }
    
    // Koniec zaznaczania
    function handleSelectEnd() {
        if (rysowanie.isDragging && rysowanie.selectedShape !== null) {
            saveToUndoStack(rysowanie);
        }
        
        rysowanie.isDragging = false;
    }
    
    // Dodanie event listenerów
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Obsługa dotyku
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        canvas.dispatchEvent(mouseEvent);
    });
    
    // Obsługa klawiszy
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z - Cofnij
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            undo(rysowanie);
            
            // Po cofnięciu włącz tryb zaznaczania
            wlaczTrybZaznaczania(rysowanie, canvas);
        }
        
        // Delete - Usuń zaznaczony
        if (e.key === 'Delete' && rysowanie.selectedShape !== null) {
            saveToUndoStack(rysowanie);
            rysowanie.shapes.splice(rysowanie.selectedShape, 1);
            rysowanie.selectedShape = null;
            redrawCanvas(rysowanie);
            
            // Po usunięciu włącz tryb zaznaczania
            wlaczTrybZaznaczania(rysowanie, canvas);
        }
    });
    
    // Eksportowanie funkcji inicjalizacji canvasa
    rysowanie.initCanvas = initCanvas;
}

// Inicjalizacja podglądu pełnoekranowego
function inicjalizujPodgladPelnoekranowy(mapImage, canvas) {
    // Tworzenie elementów
    const mapFullscreenOverlay = document.createElement('div');
    mapFullscreenOverlay.id = 'mapFullscreenOverlay';
    mapFullscreenOverlay.style.display = 'none';
    mapFullscreenOverlay.classList.add('map-fullscreen-overlay');
    
    const fullscreenImage = document.createElement('img');
    fullscreenImage.id = 'fullscreenMapImage';
    fullscreenImage.classList.add('fullscreen-map-image');
    
    const closeButton = document.createElement('span');
    closeButton.id = 'closeFullscreenButton';
    closeButton.classList.add('close-fullscreen-button');
    closeButton.innerHTML = '&times;';
    
    mapFullscreenOverlay.appendChild(fullscreenImage);
    mapFullscreenOverlay.appendChild(closeButton);
    document.body.appendChild(mapFullscreenOverlay);
    
    // Obsługa kliknięcia w obraz - powiększanie
    mapImage.addEventListener('click', function() {
        // Zapisujemy canvas jako obraz
        const dataURL = canvas.toDataURL();
        
        // Tworzymy nowy obraz z połączeniem mapy i rysunku
        const img = new Image();
        img.onload = function() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Rysujemy mapę
            tempCtx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
            
            // Rysujemy canvas z rysunkiem na wierzchu
            tempCtx.drawImage(img, 0, 0);
            
            // Ustawiamy wynikowy obraz jako źródło dla fullscreenImage
            fullscreenImage.src = tempCanvas.toDataURL();
            mapFullscreenOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Blokujemy przewijanie strony
        };
        img.src = dataURL;
    });
    
    // Obsługa przycisku zamknięcia pełnego ekranu
    closeButton.addEventListener('click', function() {
        mapFullscreenOverlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Przywracamy przewijanie strony
    });
    
    // Zamknięcie pełnego ekranu po kliknięciu poza obrazem
    mapFullscreenOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            mapFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Dodanie obsługi przycisków map
function dodajObslugeMapPrzyciskow(mapButtons, editorContainer, mapImage, mapPlaceholder, canvas, rysowanie) {
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Reset UI
            mapButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Pobierz nazwę mapy
            const mapName = this.getAttribute('data-map');
            
            // Pokaż edytor i mapę
            editorContainer.style.display = 'block';
            mapPlaceholder.style.display = 'none';
            
            // Wczytaj obraz mapy
            mapImage.src = `${mapName}.png`;
            mapImage.alt = `Mapa ${mapName}`;
            mapImage.style.display = 'block';
            mapImage.style.marginTop = '0';
            mapImage.style.transition = 'all 0.3s ease';
            
            // Pokaż canvas
            canvas.style.display = 'block';
            
            // Wyczyść canvas
            if (rysowanie.ctx) {
                rysowanie.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            // Reset kształtów
            rysowanie.shapes = [];
            rysowanie.selectedShape = null;
            
            // Inicjalizacja canvasa
            mapImage.onload = function() {
                rysowanie.initCanvas(mapImage);
                
                // Po załadowaniu mapy upewnij się, że cursor jest we właściwym trybie
                if (rysowanie.isSelectMode) {
                    canvas.style.cursor = 'pointer';
                } else {
                    canvas.style.cursor = 'crosshair';
                }
            };
            
            // Obsługa błędów
            mapImage.onerror = function() {
                console.error(`Nie udało się załadować obrazu mapy: ${mapName}.png`);
                mapImage.style.display = 'none';
                
                // Pokaż placeholder z błędem
                mapPlaceholder.textContent = `BŁĄD ŁADOWANIA MAPY: ${mapName}`;
                mapPlaceholder.style.display = 'flex';
                editorContainer.style.display = 'block';
            };
        });
    });
}

// Pomocnicze funkcje dla rysowania

// Znajdowanie kształtu pod kursorem
function findShapeAt(x, y, rysowanie) {
    // Sprawdzamy od najnowszych
    for (let i = rysowanie.shapes.length - 1; i >= 0; i--) {
        const shape = rysowanie.shapes[i];
        
        // Sprawdź czy to ikona gracza
        if (shape[0] && shape[0].type === 'player-icon') {
            const icon = shape[0];
            const distance = Math.sqrt(Math.pow(x - icon.x, 2) + Math.pow(y - icon.y, 2));
            if (distance <= icon.radius) {
                return i;
            }
            continue;
        }
        
        // Standardowe sprawdzanie dla linii
        if (isPointInShape(x, y, shape, rysowanie.lineWidth)) {
            return i;
        }
    }
    return -1;
}

// Sprawdza, czy punkt jest w kształcie
function isPointInShape(x, y, shape, lineWidth) {
    const tolerance = lineWidth * 2; // Tolerancja
    
    for (let i = 1; i < shape.length; i++) {
        const p1 = shape[i - 1];
        const p2 = shape[i];
        
        // Odległość punktu od linii
        const dist = distanceToLine(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist < tolerance) {
            return true;
        }
    }
    
    return false;
}

// Oblicza odległość punktu od linii
function distanceToLine(x, y, x1, y1, x2, y2) {
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
}

// Pobierz granice kształtu
function getShapeBounds(shape) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    // Sprawdź czy to ikona gracza
    if (shape[0] && shape[0].type === 'player-icon') {
        const icon = shape[0];
        minX = icon.x - icon.radius;
        minY = icon.y - icon.radius;
        maxX = icon.x + icon.radius;
        maxY = icon.y + icon.radius;
    } else {
        // Standardowe kształty
        for (let i = 0; i < shape.length; i++) {
            const point = shape[i];
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
    }
    
    return { minX, minY, maxX, maxY };
}

// Zapisanie stanu do cofania
function saveToUndoStack(rysowanie) {
    rysowanie.undoStack.push(JSON.stringify(rysowanie.shapes));
}

// Cofnięcie operacji
function undo(rysowanie) {
    if (rysowanie.undoStack.length === 0) return;
    
    rysowanie.shapes = JSON.parse(rysowanie.undoStack.pop());
    rysowanie.selectedShape = null;
    redrawCanvas(rysowanie);
}

// Odrysowanie canvasa
function redrawCanvas(rysowanie) {
    if (!rysowanie.ctx) return;
    
    // Wyczyść canvas
    rysowanie.ctx.clearRect(0, 0, rysowanie.ctx.canvas.width, rysowanie.ctx.canvas.height);
    
    // Rysuj wszystkie kształty
    for (let s = 0; s < rysowanie.shapes.length; s++) {
        const shape = rysowanie.shapes[s];
        if (shape.length < 1) continue;
        
        // Ikona gracza
        if (shape[0].type === 'player-icon') {
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
            
            continue;
        }
        
        // Standardowe linie
        if (shape.length < 2) continue;
        
        // Styl
        rysowanie.ctx.lineWidth = shape[0].lineWidth;
        rysowanie.ctx.strokeStyle = shape[0].color;
        rysowanie.ctx.globalCompositeOperation = 'source-over';
        
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
    }
}

// Funkcja włączająca tryb zaznaczania
function wlaczTrybZaznaczania(rysowanie, canvas) {
    rysowanie.isSelectMode = true;
    rysowanie.stayInDrawMode = false;
    canvas.style.cursor = 'pointer';
    
    // Usuń wyróżnienie z przycisków kolorów
    document.querySelectorAll('.color-button').forEach(btn => {
        btn.style.border = '1px solid #ccc';
        btn.style.transform = 'scale(1)';
    });
    
    // Wyróżnij przycisk zaznaczania
    document.querySelectorAll('.action-button').forEach(btn => {
        if (btn.textContent === 'Zaznacz') {
            btn.style.backgroundColor = '#ff3131';
            btn.style.color = '#fff';
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 4px 8px rgba(255, 49, 49, 0.3)';
        } else {
            btn.style.backgroundColor = '#f0f0f0';
            btn.style.color = '#333';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
    });
}

// Funkcja włączająca tryb rysowania
function wlaczTrybRysowania(rysowanie, canvas) {
    rysowanie.isSelectMode = false;
    rysowanie.stayInDrawMode = true;
    canvas.style.cursor = 'crosshair';
    
    // Usuń wyróżnienie z przycisków kolorów i zaznaczania
    document.querySelectorAll('.color-button').forEach(btn => {
        btn.style.border = '1px solid #ccc';
        btn.style.transform = 'scale(1)';
    });
    
    // Wyróżnij kolor aktualnie wybrany
    document.querySelectorAll('.color-button').forEach(btn => {
        if (btn.style.backgroundColor === rysowanie.currentColor) {
            btn.style.border = '2px solid #000';
            btn.style.transform = 'scale(1.1)';
        }
    });
    
    // Wyróżnij przycisk rysowania
    document.querySelectorAll('.action-button').forEach(btn => {
        if (btn.textContent === 'Rysuj') {
            btn.style.backgroundColor = '#ff3131';
            btn.style.color = '#fff';
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 4px 8px rgba(255, 49, 49, 0.3)';
        } else {
            btn.style.backgroundColor = '#f0f0f0';
            btn.style.color = '#333';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
    });
} 