// src/js/main.js

// As variáveis `obrasData` e `artistBios` são carregadas de data.js antes deste script.

document.addEventListener('DOMContentLoaded', () => {
    // Seleção de todos os elementos do DOM
    const galleryContainer = document.getElementById('gallery-container');
    const searchInput = document.getElementById('search-input');
    const artistFilter = document.getElementById('artist-filter');
    const techniqueFilter = document.getElementById('technique-filter');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResultsMessage = document.getElementById('no-results');
    const clearFiltersButton = document.getElementById('clear-filters-button');
    const modal = document.getElementById('artwork-modal');
    const closeButton = modal.querySelector('.close-button');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    let allObras = []; 
    let filteredObras = [];

    /**
     * Gera uma descrição dinâmica para a obra, caso não haja uma.
     * @param {Object} obra - O objeto da obra.
     * @returns {string} A descrição gerada ou a original.
     */
    function generateDescription(obra) {
        if (obra.descricao && obra.descricao.trim() !== '') {
            return obra.descricao;
        }
        return `Esta obra de ${obra.artista} em ${obra.tecnica} representa com sensibilidade a cultura popular brasileira. Transmite emoção, identidade e beleza visual, convidando o espectador a uma imersão profunda na arte nacional.`;
    }

    /**
     * Renderiza os cards das obras na galeria.
     * @param {Array} obrasToRender - Array de obras a serem exibidas.
     */
    function renderGallery(obrasToRender) {
        galleryContainer.innerHTML = ''; // Limpa a galeria
        noResultsMessage.classList.toggle('hidden', obrasToRender.length > 0);

        obrasToRender.forEach((obra, index) => {
            const card = document.createElement('div');
            card.className = 'rounded-xl overflow-hidden flex flex-col group transform hover:scale-102 transition duration-300 ease-in-out fade-in-up card-liquid-glass';
            card.style.animationDelay = `${index * 0.05}s`;
            card.dataset.index = index; // Adiciona o índice para o event listener

            const defaultImage = './src/assets/images/placeholder.jpg';
            const imageUrl = obra.imagem || defaultImage;

            card.innerHTML = `
                <img src="${imageUrl}" alt="${obra.titulo}" class="w-full h-64 object-cover object-center rounded-t-xl group-hover:opacity-90 transition duration-300" loading="lazy" onerror="this.onerror=null;this.src='${defaultImage}';">
                <div class="p-5 flex flex-col justify-between flex-grow">
                    <div>
                        <h3 class="text-2xl font-bold mb-1 text-purple-700">${obra.titulo}</h3>
                        <p class="text-gray-600 text-base">${obra.artista} – ${obra.tecnica}</p>
                        <p class="text-sm text-gray-500 mt-1 mb-3">${obra.tamanho || 'Tamanho não informado'} | <span class="text-purple-700 font-semibold">${obra.valor || 'Valor sob consulta'}</span></p>
                        <p class="text-gray-700 text-sm mb-4 line-clamp-3">${generateDescription(obra)}</p>
                    </div>
                    <button class="view-details-button w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full text-base shadow-md transition duration-300">
                        Ver Detalhes
                    </button>
                </div>
            `;
            galleryContainer.appendChild(card);
        });
    }

    /**
     * Preenche os filtros de artista e técnica.
     */
    function populateFilters() {
        const artists = [...new Set(allObras.map(obra => obra.artista))].sort();
        const techniques = [...new Set(allObras.map(obra => obra.tecnica))].sort();

        artistFilter.innerHTML = '<option value="">Todos os Artistas</option>';
        artists.forEach(artist => artistFilter.add(new Option(artist, artist)));

        techniqueFilter.innerHTML = '<option value="">Todas as Técnicas</option>';
        techniques.forEach(technique => techniqueFilter.add(new Option(technique, technique)));
    }

    /**
     * Aplica os filtros e a busca e re-renderiza a galeria.
     */
    function applyFiltersAndSearch() {
        loadingIndicator.classList.remove('hidden');
        galleryContainer.innerHTML = ''; 

        const searchTerm = searchInput.value.toLowerCase();
        const selectedArtist = artistFilter.value;
        const selectedTechnique = techniqueFilter.value;

        filteredObras = allObras.filter(obra => {
            const matchesSearch = obra.titulo.toLowerCase().includes(searchTerm) || obra.artista.toLowerCase().includes(searchTerm);
            const matchesArtist = !selectedArtist || obra.artista === selectedArtist;
            const matchesTechnique = !selectedTechnique || obra.tecnica === selectedTechnique;
            return matchesSearch && matchesArtist && matchesTechnique;
        });

        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
            renderGallery(filteredObras);
        }, 300);
    }

    /**
     * Abre o modal com os detalhes da obra selecionada.
     * @param {Object} obra - O objeto da obra.
     */
    function openModal(obra) {
        // Seleciona os elementos do modal aqui para garantir que estão sempre atualizados
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalArtistTechnique = document.getElementById('modal-artist-technique');
        const modalSizeValue = document.getElementById('modal-size-value');
        const modalDescription = document.getElementById('modal-description');
        const modalArtistBio = document.getElementById('modal-artist-bio');
        const whatsappLink = document.getElementById('whatsapp-link');

        const defaultImage = './src/assets/images/placeholder.jpg';
        modalImage.src = obra.imagem || defaultImage;
        modalImage.onerror = function() { this.onerror=null; this.src=defaultImage; };

        modalTitle.textContent = obra.titulo;
        modalArtistTechnique.textContent = `${obra.artista} – ${obra.tecnica}`;
        modalSizeValue.textContent = `${obra.tamanho || 'Tamanho não informado'} | ${obra.valor || 'Valor sob consulta'}`;
        modalDescription.textContent = generateDescription(obra);

        const bio = artistBios[obra.artista];
        modalArtistBio.textContent = bio || '';
        modalArtistBio.classList.toggle('hidden', !bio);

        // --- NÚMERO DO WHATSAPP ATUALIZADO AQUI ---
        const phoneNumber = '5585985204125';
        const message = `Olá! Tenho interesse na obra "${obra.titulo}", do artista ${obra.artista}. Poderia me passar mais informações?`;
        const encodedMessage = encodeURIComponent(message);
        whatsappLink.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        modal.style.display = 'flex';
    }

    // --- MELHORIA DE PERFORMANCE: Event Delegation ---
    galleryContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.view-details-button');
        if (button) {
            const card = button.closest('[data-index]');
            const index = card.dataset.index;
            if (index !== undefined) {
                openModal(filteredObras[index]);
            }
        }
    });

    // Listeners para fechar o modal
    closeButton.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Listeners para filtros e busca
    searchInput.addEventListener('input', applyFiltersAndSearch);
    artistFilter.addEventListener('change', applyFiltersAndSearch);
    techniqueFilter.addEventListener('change', applyFiltersAndSearch);
    clearFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        artistFilter.value = '';
        techniqueFilter.value = '';
        applyFiltersAndSearch();
    });

    // Listener para o menu mobile
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Inicialização do site
    function init() {
        if (typeof obrasData !== 'undefined') {
            allObras = obrasData;
            populateFilters();
            applyFiltersAndSearch();
        } else {
            console.error('Os dados das obras (obrasData) não foram carregados.');
            loadingIndicator.classList.add('hidden');
            galleryContainer.innerHTML = '<p class="text-center text-red-500">Erro ao carregar as obras. Tente recarregar a página.</p>';
        }
    }

    init();
});