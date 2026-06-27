class AlbumModel {
    constructor() {
        this.base = '/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php';
    }

    async getAlbums() {
        const res = await fetch(`${this.base}?t=albums`);
        return await res.json();
    }

    async createAlbum(formData) {
        const res = await fetch(`${this.base}?t=albums`, {
            method: 'POST',
            body: formData
        });
        return await res.json();
    }

    async deleteAlbum(albumId) {
        const res = await fetch(`${this.base}?t=albums`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ album_id: albumId })
        });
        return await res.json();
    }

    async searchPhotos(tags, albumTitle, date) {
        const params = new URLSearchParams();
        if (tags.length) params.append('tags', tags.join(','));
        if (albumTitle) params.append('album_title', albumTitle);
        if (date) params.append('date', date);

        const res = await fetch(`${this.base}?t=search_photos&${params.toString()}`);
        return await res.json();
    }
}

class AlbumView {
    constructor() {
        this.albumsGrid = document.getElementById('albumsGrid');
        this.overlay = document.getElementById('overlay');
        this.overlay2 = document.getElementById('overlay2');
        this.searchResultsSection = document.getElementById('searchResultsSection');
        this.searchResultsGrid = document.getElementById('searchResultsGrid');
        this.searchTagLabel = document.getElementById('searchTagLabel');
        this.albumsSection = document.getElementById('albumsGrid');

        this.overlay3 = document.getElementById('overlay3');
        this.filterBtn = document.getElementById('filterFiltre');
        this.closeFiltreBtn = document.getElementById('closefiltreBtn');
        this.filterChoices = document.querySelectorAll('.filter-tag-choice');
    }

    renderSearchResults(tag, photos, onPhotoClick) {
        this.searchTagLabel.textContent = tag;
        this.searchResultsGrid.innerHTML = '';

        if (!photos.length) {
            this.searchResultsGrid.innerHTML = '<p style="color:#999;padding:20px;">Aucune photo trouvée avec ce tag.</p>';
        } else {
            photos.forEach(photo => {
                const item = document.createElement('div');
                item.className = 'photo-card';
                item.innerHTML = `
                    <img src="${photo.url}" alt="photo">
                    <div class="photo-album-name">${photo.album_title}</div>
                `;
                item.addEventListener('click', () => onPhotoClick(photo));
                this.searchResultsGrid.appendChild(item);
            });
        }
        this.showSearchResults();
    }

    showSearchResults() {
        this.searchResultsSection.style.display = 'block';
        this.albumsGrid.style.display = 'none';
    }

    hideSearchResults() {
        this.searchResultsSection.style.display = 'none';
        this.albumsGrid.style.display = 'grid';
    }

    renderAlbums(albums, addCard, onAlbumClick, onDeleteClick) {
        this.albumsGrid.innerHTML = '';

        albums.forEach(album => {
            const card = document.createElement('div');
            card.className = 'album-card';
            card.id = `album-${album.id}`;
            card.dataset.tags = JSON.stringify(album.tags || []);

            const covers = album.covers || [];
            const cells = [0, 1, 2, 3].map(i =>
                covers[i]
                    ? `<div class="cover-cell"><img src="${covers[i]}" alt="photo"></div>`
                    : `<div class="cover-cell cover-empty"></div>`
            ).join('');

            card.innerHTML = `
                <div class="album-cover-grid">${cells}</div>
                <div class="album-info">
                    <div class="album-name">${album.title}</div>
                    <div class="album-count">${album.photo_count} photo${album.photo_count !== 1 ? 's' : ''}</div>
                    <div class="album-status-row">
                        <span class="album-status-badge ${album.visibility === 'public' ? 'badge-public' : album.visibility === 'restricted' ? 'badge-restricted' : 'badge-private'}">
                            ${album.visibility === 'public' ? 'En ligne' : album.visibility === 'restricted' ? 'Restreint' : 'Privé'}
                        </span>
                        ${album.visibility === 'public' ? `<button class="album-copy-link-btn" data-id="${album.id}" title="Copier le lien">🔗</button>` : ''}
                    </div>
                </div>
                <button class="album-delete-btn" title="Supprimer l'album"><i class="fa-solid fa-trash-can" style="color: rgb(30, 48, 80);"></i></button>
            `;

            card.querySelector('.album-cover-grid').addEventListener('click', () => onAlbumClick(album));
            card.querySelector('.album-info').addEventListener('click', () => onAlbumClick(album));
            card.querySelector('.album-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                onDeleteClick(album.id, card);
            });
            card.querySelector('.album-copy-link-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = `${window.location.origin}/Projet_fullstack/Projet_1/app-photo-album/frontend/photo-add/photo-add.html?album_id=${album.id}&album_nom=${encodeURIComponent(album.title)}`;
                navigator.clipboard.writeText(url).then(() => {
                    const btn = e.currentTarget;
                    btn.textContent = '✓';
                    setTimeout(() => btn.textContent = '🔗', 2000);
                });
            });

            this.albumsGrid.appendChild(card);
        });

        if (addCard) this.albumsGrid.appendChild(addCard);
    }

    showEmpty(addCard) {
        this.albumsGrid.innerHTML = '<p style="color:#999;padding:20px;grid-column:1/-1;">Aucun album pour l\'instant.</p>';
        if (addCard) this.albumsGrid.appendChild(addCard);
    }

    tagVisual(tagElement) {
        tagElement.classList.toggle('selected');
    }

    removeAlbumCard(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        element.style.transition = '0.3s';
        setTimeout(() => element.remove(), 300);
    }

    renderFilterTags(activeTags, onRemove) {
        const row = document.getElementById('filterTagsRow');
        row.innerHTML = activeTags.length === 0
            ? '<span class="aucun-tag">Aucun tag sélectionné</span>'
            : activeTags.map((t, i) =>
                `<span class="popup-tag">${t}<span class="filter-tag-remove" data-index="${i}">×</span></span>`
            ).join('');

        if (onRemove) {
            row.querySelectorAll('.filter-tag-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    onRemove(parseInt(btn.dataset.index));
                });
            });
        }
    }

    resetFilterVisuals() {
        this.filterChoices.forEach(c => c.classList.remove('selected'));
        const row = document.getElementById('filterTagsRow');
        if (row) row.innerHTML = '<span class="aucun-tag">Aucun tag sélectionné</span>';
        const titleInput = document.getElementById('filterAlbumTitle');
        const dateInput = document.getElementById('filterDate');
        const tagInput = document.getElementById('filterCustomTagInput');
        if (titleInput) titleInput.value = '';
        if (dateInput) dateInput.value = '';
        if (tagInput) tagInput.value = '';
        if (this.filterBtn) {
            this.filterBtn.classList.remove('active');
            this.filterBtn.textContent = "Aucun filtre";
        }
    }

    filterBtnText(count) {
        if (!this.filterBtn) return;
        if (count > 0) {
            this.filterBtn.classList.add('active');
            this.filterBtn.textContent = `Filtre (${count})`;
        } else {
            this.filterBtn.classList.remove('active');
            this.filterBtn.textContent = "Aucun filtre";
        }
    }

    filterAlbums(activeFilters) {
        const albumCards = this.albumsGrid.querySelectorAll('.album-card, .album-item');
        albumCards.forEach(card => {
            if (activeFilters.length === 0) {
                card.style.display = 'block';
                return;
            }

            const albumTag = card.dataset.tags || '[]';
            let albumTags = [];
            try {
                albumTags = JSON.parse(albumTag);
            } catch (e) {
                albumTags = [];
            }

            const hasMatchingTag = activeFilters.some(filterTag => albumTags.includes(filterTag));
            card.style.display = hasMatchingTag ? 'block' : 'none';
        })
    }

    openPopup() {
        this.overlay.classList.add('open');
    }
    closePopup() {
        this.overlay.classList.remove('open');
    }
    openPopup2() {
        this.overlay2.classList.add('open');
    }
    closePopup2() {
        this.overlay2.classList.remove('open');
    }
    openPopup3() {
        this.overlay3.classList.add('open');
    }
    closePopup3() {
        this.overlay3.classList.remove('open');
    }
}

class AlbumController {
    constructor() {
        this.model = new AlbumModel();
        this.view = new AlbumView();
        this.selectedTags = [];
        this.activeFilters = [];

        this._bindEvents();
        this._loadAlbums();
        this._bindFilterEvents();
    }

    // CHARGEMENT
    async _loadAlbums() {
        try {
            const data = await this.model.getAlbums();
            const addCard = document.getElementById('addAlbumCard');

            if (!data.success || !data.albums?.length) {
                this.view.showEmpty(addCard);
                return;
            }

            this.view.renderAlbums(
                data.albums,
                addCard,
                (album) => this._openAlbum(album),
                (id, el) => this._deleteAlbum(id, el)
            );
        } catch (err) {
            console.error('Erreur chargement albums:', err);
        }
    }

    // OUVRIR ALBUM = REDIRECTION ADD-PHOTO
    _openAlbum(album) {
        window.location.href = `../photo-add/photo-add.html?album_id=${album.id}&album_nom=${encodeURIComponent(album.title)}`;
    }

    async _deleteAlbum(albumId, element) {
        if (!confirm('Supprimer cet album ?')) return;
        try {
            const data = await this.model.deleteAlbum(albumId);
            if (data.success) {
                this.view.removeAlbumCard(element);
            } else {
                alert('Erreur : ' + (data.error || 'Suppression impossible'));
            }
        } catch (err) {
            alert('Impossible de joindre le serveur.');
        }
    }

    // CREER ALBUM
    async _createAlbum() {
        const createBtn = document.getElementById('createBtn');
        const name = document.getElementById('albumNom').value.trim();
        const desc = document.getElementById('albumDesc').value.trim();
        const selectedVis = document.querySelector('.vis-card.selected');
        const visibility = selectedVis
            ? selectedVis.querySelector('.vis-name').textContent.toLowerCase()
            : 'public';

        if (!name) return alert("Donne un nom à l'album !");

        createBtn.disabled = true;
        createBtn.textContent = 'Création...';

        const visMap = { 'public': 'public', 'restreint': 'restricted', 'privé': 'private' };

        const formData = new FormData();
        formData.append('nom', name);
        formData.append('description', desc);
        formData.append('visibility', visMap[visibility] || 'public');
        this.selectedTags.forEach(tag => formData.append('tags[]', tag));

        try {
            const data = await this.model.createAlbum(formData);
            if (data.success) {
                window.location.href = `../photo-add/photo-add.html?album_id=${data.album_id}&album_nom=${encodeURIComponent(name)}`;
            } else {
                alert('Erreur : ' + (data.error || 'Erreur inconnue'));
            }
        } catch (err) {
            alert('Impossible de joindre le serveur.');
        } finally {
            createBtn.disabled = false;
            createBtn.textContent = "Créer l'album";
        }
    }

    async _searchPhotos(tags, albumTitle, date) {
        try {
            const data = await this.model.searchPhotos(tags, albumTitle, date);
            const label = [
                tags.length ? `tags: ${tags.join(', ')}` : '',
                albumTitle ? `album: "${albumTitle}"` : '',
                date ? `date: ${date}` : ''
            ].filter(Boolean).join(' · ');

            if (data.success) {
                this.view.renderSearchResults(label, data.photos, (photo) => this._openAlbumFromPhoto(photo));
            } else {
                alert('Erreur : ' + (data.error || 'Recherche impossible'));
            }
        } catch (err) {
            alert('Impossible de joindre le serveur.');
        }
    }

    _openAlbumFromPhoto(photo) {
        window.location.href = `../photo-add/photo-add.html?album_id=${photo.album_id}&album_nom=${encodeURIComponent(photo.album_title)}`;
    }

    // TAG
    _renderTags() {
        const row = document.getElementById('tagsRow');
        row.innerHTML = this.selectedTags.length === 0
            ? '<span class="aucun-tag">Aucun tag sélectionné</span>'
            : this.selectedTags.map((t, i) =>
                `<span class="popup-tag">${t}<span class="tag-remove" data-index="${i}">×</span></span>`
            ).join('');

        row.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.index);
                const removed = this.selectedTags[i];
                this.selectedTags.splice(i, 1);
                document.querySelectorAll(`.sug-tag[data-tag="${removed}"]`)
                    .forEach(c => c.classList.remove('used'));
                this._renderTags();
            });
        });
    }

    _bindEvents() {
        // POPUP
        document.getElementById('addBtn')?.addEventListener('click', () => this.view.openPopup());
        document.getElementById('addAlbumCard')?.addEventListener('click', () => this.view.openPopup());
        document.getElementById('closeBtn')?.addEventListener('click', () => this.view.closePopup());
        document.getElementById('decoBtn')?.addEventListener('click', () => this.view.openPopup2());
        document.getElementById('closeBtn2')?.addEventListener('click', () => this.view.closePopup2());
        document.getElementById('createBtn')?.addEventListener('click', () => this._createAlbum());
        document.getElementById('confirmDecoBtn')?.addEventListener('click', () => {
            fetch('/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php?t=logout', {
                method: 'POST'
            }).then(() => {
                window.location.href = '/Projet_fullstack/Projet_1/app-photo-album/frontend/Login/login.html';
            });
        });

        // VISU
        document.querySelectorAll('.vis-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.vis-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // TAG DEFAULT
        document.querySelectorAll('.sug-tag').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                if (this.selectedTags.includes(tag)) return;
                this.selectedTags.push(tag);
                chip.classList.add('used');
                this._renderTags();
            });
        });

        // TAG PERSO
        document.getElementById('addCustomTag')?.addEventListener('click', () => {
            const input = document.getElementById('customTagInput');
            const val = input.value.trim().toLowerCase();
            if (!val || this.selectedTags.includes(val)) return;
            this.selectedTags.push(val);
            input.value = '';
            document.querySelectorAll(`.sug-tag[data-tag="${val}"]`)
                .forEach(c => c.classList.add('used'));
            this._renderTags();
        });

        document.getElementById('customTagInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('addCustomTag').click();
        });
    }

    _bindFilterEvents() {
        const { filterBtn, closeFiltreBtn, applyFiltreBtn, resetFiltreBtn, filterChoices } = this.view;
        document.getElementById('filterFiltre')?.addEventListener('click', () => this.view.openPopup3());
        document.getElementById('closeFiltreBtn')?.addEventListener('click', () => this.view.closePopup3());

        this.view.filterChoices.forEach(choice => {
            choice.addEventListener('click', () => {
                const tag = choice.getAttribute('data-tag');

                if (this.activeFilters.includes(tag)) {
                    this.activeFilters = this.activeFilters.filter(t => t !== tag);
                } else {
                    this.activeFilters.push(tag);
                }
                this.view.tagVisual(choice);
                this.view.renderFilterTags(this.activeFilters, (i) => this._removeFilterTag(i));

            });
        });

        document.getElementById('resetFiltreBtn')?.addEventListener('click', () => {
            this.activeFilters = [];
            this.view.resetFilterVisuals();
            this.view.hideSearchResults();
            this.view.closePopup3();
        });

        document.getElementById('filterAddCustomTag')?.addEventListener('click', () => {
            const input = document.getElementById('filterCustomTagInput');
            const val = input.value.trim().toLowerCase();
            if (!val || this.activeFilters.includes(val)) return;
            this.activeFilters.push(val);
            input.value = '';
            this.view.renderFilterTags(this.activeFilters, (i) => this._removeFilterTag(i));
            document.querySelectorAll('.filter-tag-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const i = parseInt(btn.dataset.index);
                    this.activeFilters.splice(i, 1);
                    this.view.renderFilterTags(this.activeFilters, (i) => this._removeFilterTag(i));
                });
            });
        });

        document.getElementById('filterCustomTagInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('filterAddCustomTag').click();
        });

        document.getElementById('applyFiltreBtn')?.addEventListener('click', () => {
            const albumTitle = document.getElementById('filterAlbumTitle')?.value.trim() || '';
            const date = document.getElementById('filterDate')?.value || '';
            const hasFilter = this.activeFilters.length > 0 || albumTitle || date;

            this.view.filterBtnText(hasFilter ? 1 : 0);
            this.view.closePopup3();

            if (!hasFilter) {
                this.view.hideSearchResults();
                return;
            }
            this._searchPhotos(this.activeFilters, albumTitle, date);
        });

        document.getElementById('closeSearchResults')?.addEventListener('click', () => {
            this.activeFilters = [];
            this.view.resetFilterVisuals();
            this.view.filterBtnText(0);
            this.view.hideSearchResults();
        });
    }

    _removeFilterTag(index) {
        this.activeFilters.splice(index, 1);
        this.view.filterChoices.forEach(c => {
            if (c.getAttribute('data-tag') === this.activeFilters[index]) {
                c.classList.remove('selected');
            }
        });
        this.view.renderFilterTags(this.activeFilters, (i) => this._removeFilterTag(i));
    }
}

document.addEventListener('DOMContentLoaded', () => new AlbumController());