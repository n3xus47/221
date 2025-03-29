/**
 * Holy Five - Moduł aktualności
 * Odpowiada za zarządzanie i wyświetlanie postów aktualności
 * Zoptymalizowany - logika wizualna przeniesiona do CSS
 */
document.addEventListener('DOMContentLoaded', () => {
  // Rejestracja Service Workera
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker zarejestrowany pomyślnie:', registration.scope);
      })
      .catch(error => {
        console.log('Błąd rejestracji Service Workera:', error);
      });
  }

  // Stałe elementy DOM - ładowane raz przy inicjalizacji
  const ELEMENTS = {
    addPostBtn: document.getElementById('addPostBtn'),
    addPostModal: document.getElementById('addPostModal'),
    closeModal: document.getElementById('closeModal'),
    authContainer: document.getElementById('authContainer'),
    postForm: document.getElementById('postForm'),
    passwordInput: document.getElementById('passwordInput'),
    authButton: document.getElementById('authButton'),
    submitPostBtn: document.getElementById('submitPost'),
    newsList: document.getElementById('newsList'),
    editPostModal: document.getElementById('editPostModal'),
    closeEditModal: document.getElementById('closeEditModal'),
    editPostTitle: document.getElementById('editPostTitle'),
    editPostContent: document.getElementById('editPostContent'),
    editPostTag: document.getElementById('editPostTag'),
    editPostIndex: document.getElementById('editPostIndex'),
    updatePostBtn: document.getElementById('updatePost'),
    postTitle: document.getElementById('postTitle'),
    postContent: document.getElementById('postContent'),
    postTag: document.getElementById('postTag')
  };

  // Konfiguracja
  const CONFIG = {
    hashedAdminPassword: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // hash dla "admin123"
    authorName: "Zarząd Holy Five"
  };

  // Domyślne posty - teraz tylko jeden post o nowym zawodniku
  const defaultPosts = [{
    title: "Nowy zawodnik Holy Five!",
    content: "W lutym zarząd zespołu dokonał wszelkich starań, żeby sprowadzić w nasze skromne progi legendę e-sportu. Gracza, który doszedł do rangi Grandmaster na serwerze EUW w grze League of Legends. Jest wybitnym strzelcem, a jeszcze lepszym taktykiem. Nie raz pokazywał brak jakichkolwiek skrupułów i szacunku dla wrogiej drużyny. Uwielbia poniżać i miażdżyć swoich rywali. Szybki, ale i precyzyjny, wybity, ale i okrutny - Krzysztof \"Bolgy\" Bastrzyk. Witamy na pokładzie, cieszymy się, że jesteś z nami!",
    date: "24.03.2025",
    author: "Zarząd Holy Five",
    hashtag: "#the_notorious"
  }];

  // Stan aplikacji
  const state = {
    isAdmin: false,
    posts: [...defaultPosts]
  };

  /**
   * Hashuje hasło używając SHA-256
   * @param {string} password - Hasło do zahashowania
   * @return {Promise<string>} - Zahasowane hasło w formie heksadecymalnej
   */
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Renderuje listę aktualności
   */
  function renderNews() {
    const fragment = document.createDocumentFragment();
    const { newsList } = ELEMENTS;
    
    // Wyczyść listę
    newsList.innerHTML = '';
    
    // Utwórz i dodaj posty (jeśli istnieją)
    state.posts.forEach((news, index) => {
      const newsItem = createNewsItem(news, index);
      fragment.appendChild(newsItem);
    });
    
    newsList.appendChild(fragment);
    
    // Dodaj obsługę przycisków edycji i usuwania, jeśli użytkownik jest adminem
    if (state.isAdmin) {
      addEditDeleteEventListeners();
    }
  }

  /**
   * Tworzy element postu aktualności
   * @param {Object} news - Dane postu
   * @param {number} index - Indeks postu
   * @return {HTMLElement} - Element DOM reprezentujący post
   */
  function createNewsItem(news, index) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.classList.add('new-post');
    
    // Losowy wybór wariantu (1, 2 lub 3)
    const randomVariant = Math.floor(Math.random() * 3) + 1;
    newsItem.classList.add(`variant-${randomVariant}`);
    
    // Tworzymy zawartość
    newsItem.innerHTML = `
        <div class="news-item-header">
            <h2 class="news-item-title">${news.title}</h2>
            <span class="news-item-date">${news.date}</span>
        </div>
        <div class="news-item-content">
            ${news.content}
        </div>
        <div class="news-item-footer">
            <span class="news-item-hashtag">${news.hashtag}</span>
            <div class="actions-container">
                <span class="news-item-author">${news.author}</span>
                <div class="post-actions" data-index="${index}">
                    <button class="edit-btn" title="Edytuj post"><i class="fas fa-edit"></i></button>
                </div>
            </div>
        </div>`;
    
    // Po chwili usuwamy klasę animacji
    setTimeout(() => {
      newsItem.classList.remove('new-post');
    }, 500);
    
    return newsItem;
  }

  /**
   * Dodaje listenery zdarzeń do przycisków edycji i usuwania
   */
  function addEditDeleteEventListeners() {
    document.querySelectorAll('.post-actions').forEach(actionDiv => {
      const index = parseInt(actionDiv.getAttribute('data-index'), 10);
      
      // Obsługa przycisku edycji
      actionDiv.querySelector('.edit-btn').addEventListener('click', () => editPost(index));
    });
  }

  /**
   * Wypełnia formularz edycji danymi postu i pokazuje modal
   * @param {number} index - Indeks postu
   */
  function editPost(index) {
    const post = state.posts[index];
    const { editPostTitle, editPostContent, editPostTag, editPostIndex, editPostModal } = ELEMENTS;
    
    // Wypełnij formularz edycji
    editPostTitle.value = post.title;
    editPostContent.value = post.content;
    editPostTag.value = post.hashtag;
    editPostIndex.value = index;
    
    // Pokaż modal edycji
    editPostModal.classList.add('show');
  }

  /**
   * Tworzy nowy post na podstawie danych z formularza
   * @return {Object|null} - Obiekt postu lub null jeśli dane są niepoprawne
   */
  function createNewPostFromForm() {
    const { postTitle, postContent, postTag } = ELEMENTS;
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const tag = postTag.value.trim() || 'Hashtag';
    
    if (!title || !content) {
      alert('Wypełnij wszystkie wymagane pola!');
      return null;
    }
    
    // Aktualna data
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // +1 ponieważ indeksowanie zaczyna się od 0
    const year = today.getFullYear();
    const dateString = `${day}.${month < 10 ? '0' + month : month}.${year}`;
    
    // Nowy post
    return {
      title,
      content,
      date: dateString,
      author: CONFIG.authorName,
      hashtag: tag
    };
  }

  /**
   * Obsługuje autentykację administratora
   */
  async function handleAuthentication() {
    const { passwordInput } = ELEMENTS;
    const enteredPassword = passwordInput.value;
    const hashedEnteredPassword = await hashPassword(enteredPassword);
    
    if (hashedEnteredPassword === CONFIG.hashedAdminPassword) {
      state.isAdmin = true;
      
      // Zamiast manipulować DOM-em, ustawiamy klasę CSS na body
      document.body.classList.add('admin-mode');
      
      // Odśwież listę postów, aby pokazać przyciski edycji/usuwania
      renderNews();
    } else {
      alert('Nieprawidłowe hasło!');
      passwordInput.value = '';
    }
  }

  /**
   * Obsługuje dodawanie nowego postu
   */
  function handleAddPost() {
    const newPost = createNewPostFromForm();
    if (!newPost) return;
    
    // Dodaj nowy post na początek tablicy
    state.posts.unshift(newPost);
    
    // Renderuj aktualizowaną listę
    renderNews();
    
    // Zamknij modal
    toggleModal(ELEMENTS.addPostModal, false);
    
    // Informuj użytkownika o tymczasowości zmian
    alert('Post został dodany tymczasowo. Aby wprowadzić trwałe zmiany, należy zaktualizować kod źródłowy pliku aktualnosci.js.');
  }

  /**
   * Obsługuje aktualizację istniejącego postu
   */
  function handleUpdatePost() {
    const { editPostTitle, editPostContent, editPostTag, editPostIndex, editPostModal } = ELEMENTS;
    const title = editPostTitle.value.trim();
    const content = editPostContent.value.trim();
    const tag = editPostTag.value.trim() || 'Hashtag';
    const index = parseInt(editPostIndex.value, 10);
    
    if (!title || !content) {
      alert('Wypełnij wszystkie wymagane pola!');
      return;
    }
    
    // Aktualizuj post
    state.posts[index].title = title;
    state.posts[index].content = content;
    state.posts[index].hashtag = tag;
    
    // Renderuj zaktualizowaną listę
    renderNews();
    
    // Zamknij modal
    toggleModal(editPostModal, false);
    
    // Informuj użytkownika o tymczasowości zmian
    alert('Post został zaktualizowany tymczasowo. Aby wprowadzić trwałe zmiany, należy zaktualizować kod źródłowy pliku aktualnosci.js.');
  }

  /**
   * Przełącza widoczność modalu z użyciem klas CSS
   * @param {HTMLElement} modal - Element modalu
   * @param {boolean} show - Czy pokazać modal
   */
  function toggleModal(modal, show) {
    if (show) {
      modal.classList.add('show');
    } else {
      modal.classList.remove('show');
      // Resetuj formularz dodawania
      if (modal === ELEMENTS.addPostModal) {
        passwordInput.value = '';
        postTitle.value = '';
        postContent.value = '';
        postTag.value = '';
      }
    }
  }

  // Event listeners
  function setupEventListeners() {
    const { 
      addPostBtn, addPostModal, closeModal, authButton, submitPostBtn, 
      editPostModal, closeEditModal, updatePostBtn 
    } = ELEMENTS;
    
    // Modal dodawania postu
    addPostBtn.addEventListener('click', () => toggleModal(addPostModal, true));
    closeModal.addEventListener('click', () => toggleModal(addPostModal, false));
    
    // Modal edycji postu
    closeEditModal.addEventListener('click', () => toggleModal(editPostModal, false));
    
    // Autentykacja
    authButton.addEventListener('click', handleAuthentication);
    
    // Dodawanie postu
    submitPostBtn.addEventListener('click', handleAddPost);
    
    // Aktualizacja postu
    updatePostBtn.addEventListener('click', handleUpdatePost);
    
    // Kliknięcie poza modalem
    window.addEventListener('click', (event) => {
      if (event.target === addPostModal) {
        toggleModal(addPostModal, false);
      }
      
      if (event.target === editPostModal) {
        toggleModal(editPostModal, false);
      }
    });
  }

  // Inicjalizacja
  function init() {
    renderNews();
    setupEventListeners();
  }

  // Uruchom moduł
  init();
}); 