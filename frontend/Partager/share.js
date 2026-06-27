class ShareModel {
    constructor() {
        this.base = '/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php';
    }

    async getAlbums() {
        const res = await fetch(`${this.base}?t=albums`);
        return await res.json();
    }

    async updateVisibility(albumId, visibility) {
        const formData = new FormData();
        formData.append('album_id', albumId);
        formData.append('visibility', visibility);
        const res = await fetch(`${this.base}?t=albums`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ album_id: albumId, visibility })
        });
        return await res.json();
    }
    async getPublicAlbums() {
        const res = await fetch(`${this.base}?t=public_albums`);
        return await res.json();
    }

    async searchUsers(query) {
        const res = await fetch(`${this.base}?t=search_users&q=${encodeURIComponent(query)}`);
        return await res.json();
    }

    async getAlbumPermissions(albumId) {
        const res = await fetch(`${this.base}?t=permissions&album_id=${albumId}`);
        return await res.json();
    }

    async savePermission(albumId, userId, role) {
        const res = await fetch(`${this.base}?t=permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ album_id: albumId, user_id: userId, role: role })
        });
        return await res.json();
    }

    async removePermission(albumId, userId) {
        const res = await fetch(`${this.base}?t=permissions`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ album_id: albumId, user_id: userId })
        });
        return await res.json();
    }

}

class ShareView {
    constructor() {
        this.albumStrip = document.getElementById('albumStrip');
        this.toast = document.getElementById('toast');
        this.inviteInput = document.getElementById('inviteInput');
        this.contactList = document.getElementById('contactList');

        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'suggestions-dropdown';
        this.inviteInput.parentNode.appendChild(this.suggestionsContainer);
    }

    renderAlbumStrip(albums, onSelect) {
        this.albumStrip.innerHTML = '';
        albums.forEach((album, i) => {
            const chip = document.createElement('div');
            chip.className = 'album-chip' + (i === 0 ? ' selected' : '');
            chip.dataset.id = album.id;
            chip.dataset.visibility = album.visibility || 'private';

            const covers = album.covers || [];
            const cells = [0, 1, 2, 3].map(j =>
                covers[j]
                    ? `<div style="background:url('${covers[j]}') center/cover;"></div>`
                    : `<div></div>`
            ).join('');

            chip.innerHTML = `
                <div class="album-chip-thumb">${cells}</div>
                <span class="album-chip-name">${album.title}</span>
            `;
            chip.addEventListener('click', () => onSelect(album, chip));
            this.albumStrip.appendChild(chip);
        });
    }

    renderSuggestions(users, onSelectUser) {
        this.suggestionsContainer.innerHTML = '';
        if (users.length === 0) {
            this.suggestionsContainer.style.display = 'none';
            return;
        }

        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            const initials = user.username.substring(0, 2).toUpperCase();
            item.innerHTML = `
                <div class="suggest-av" style="background-color: #ff46a2">${initials}</div>
                <div>
                    <div class="suggest-name">${user.username}</div>
                    <div class="c-sub">${user.email}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                onSelectUser(user);
                this.suggestionsContainer.style.display = 'none';
                this.inviteInput.value = '';
            });
            this.suggestionsContainer.appendChild(item);
        });
        this.suggestionsContainer.style.display = 'block';
    }

    renderAllowedUsers(permissions, onRoleChange, onRemove) {
        this.contactList.innerHTML = '';
        if (permissions.length === 0) {
            this.contactList.innerHTML = '<p class="share-sub">Aucun utilisateur spécifique invité.</p>';
            return;
        }

        permissions.forEach(perm => {
            const row = document.createElement('div');
            row.className = 'contact-row';
            const initials = perm.username.substring(0, 2).toUpperCase();

            row.innerHTML = `
                <div class="av" style="background:#EEEDFE;color:#3C3489;">${initials}</div>
                <div class="c-info">
                    <div class="c-name">${perm.username}</div>
                    <div class="c-sub">${perm.email}</div>
                </div>
                <select class="role-select">
                    <option value="view"    ${perm.permission === 'view' ? 'selected' : ''}>Voir</option>
                    <option value="comment" ${perm.permission === 'comment' ? 'selected' : ''}>Commenter</option>
                    <option value="edit"    ${perm.permission === 'edit' ? 'selected' : ''}>Modifier</option>
                </select>
                <button class="remove-btn">×</button>
            `;

            // Événements sur la ligne
            row.querySelector('.role-select').addEventListener('change', (e) => onRoleChange(perm.user_id, e.target.value));
            row.querySelector('.remove-btn').addEventListener('click', () => onRemove(perm.user_id));

            this.contactList.appendChild(row);
        });
    }

    selectChip(chip) {
        this.albumStrip.querySelectorAll('.album-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
    }

    setVisibilityCards(visibility) {
        const map = { 'public': 0, 'restricted': 1, 'private': 2 };
        document.querySelectorAll('.vis-card').forEach((card, i) => {
            card.classList.toggle('selected', i === (map[visibility] ?? 2));
        });
    }

    updateLinkBox(albumId, albumTitle, visibility) {
        const linkEl = document.getElementById('linkUrl');
        const copyBtn = document.getElementById('copyBtn');
        const panel = document.getElementById('panel-reseaux');
        const previewTitle = document.getElementById('previewTitle');

        if (previewTitle) previewTitle.textContent = albumTitle;

        if (visibility === 'public' || visibility === 'restricted') {
            const url = `${window.location.origin}/Projet_fullstack/Projet_1/app-photo-album/frontend/photo-add/photo-add.html?album_id=${albumId}&album_nom=${encodeURIComponent(albumTitle)}`;
            if (linkEl) linkEl.textContent = url;
            if (copyBtn) copyBtn.disabled = false;
            if (panel) panel.classList.add('active');
        } else {
            if (linkEl) linkEl.textContent = 'Album privé — aucun lien disponible';
            if (copyBtn) copyBtn.disabled = true;
            if (panel) panel.classList.remove('active');
        }
    }

    showToast(msg) {
        this.toast.textContent = msg;
        this.toast.classList.add('show');
        setTimeout(() => this.toast.classList.remove('show'), 2500);
    }

    renderPublicAlbums(albums, onAlbumClick) {
        const grid = document.getElementById('publicAlbumsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!albums.length) {
            grid.innerHTML = '<p class="public-album-empty">Aucun album public disponible pour l\'instant.</p>';
            return;
        }

        albums.forEach(album => {
            const card = document.createElement('div');
            card.className = 'public-album-card';

            const covers = album.covers || [];
            const cells = [0, 1, 2, 3].map(j =>
                covers[j]
                    ? `<div style="background-image:url('${covers[j]}');background-size:cover;background-position:center;"></div>`
                    : `<div></div>`
            ).join('');

            card.innerHTML = `
            <div class="public-album-cover">${cells}</div>
            <div class="public-album-info">
                <div class="public-album-title">${album.title}</div>
                <div class="public-album-owner">par ${album.owner_name}</div>
                <div class="public-album-count">${album.photo_count} photo${album.photo_count !== 1 ? 's' : ''}</div>
            </div>
        `;

            card.addEventListener('click', () => onAlbumClick(album));
            grid.appendChild(card);
        });
    }

    showPanel(panelId) {
        const mes = document.getElementById('panelMesAlbums');
        const partages = document.getElementById('panelPartages');
        const tabMes = document.getElementById('tabMesAlbums');
        const tabPartages = document.getElementById('tabPartagesAvecMoi');

        if (mes) mes.style.display = panelId === 'mes' ? 'block' : 'none';
        if (partages) partages.style.display = panelId === 'partages' ? 'block' : 'none';
        if (tabMes) tabMes.classList.toggle('active', panelId === 'mes');
        if (tabPartages) tabPartages.classList.toggle('active', panelId === 'partages');
    }
}

class ShareController {
    constructor() {
        this.model = new ShareModel();
        this.view = new ShareView();
        this.currentAlbum = null;
        this._init();
    }

    async _init() {
        const data = await this.model.getAlbums();
        if (!data.success || !data.albums?.length) return;

        this.albums = data.albums;
        this.view.renderAlbumStrip(data.albums, (album, chip) => this._selectAlbum(album, chip));
        this._selectAlbum(data.albums[0], this.view.albumStrip.querySelector('.album-chip'));
        this._bindVisibility();
        this._bindCopy();
        this._bindTabs();
        this._bindUserSearch();
        this._bindSocialShare();
        this.view.showPanel('mes');
    }

    _selectAlbum(album, chip) {
        this.currentAlbum = album;
        this.view.selectChip(chip);
        this.view.setVisibilityCards(album.visibility || 'private');
        this.view.updateLinkBox(album.id, album.title, album.visibility || 'private');
        this._loadAlbumPermissions();
    }

    async _loadAlbumPermissions() {
        if (!this.currentAlbum) return;
        const res = await this.model.getAlbumPermissions(this.currentAlbum.id);
        if (res.success) {
            this.view.renderAllowedUsers(
                res.permissions,
                (userId, newRole) => this._changeUserRole(userId, newRole),
                (userId) => this._removeUserAccess(userId)
            );
        }
    }

    _bindUserSearch() {
        this.view.inviteInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                this.view.suggestionsContainer.style.display = 'none';
                return;
            }

            const res = await this.model.searchUsers(query);
            if (res.success) {
                this.view.renderSuggestions(res.users, (user) => this._inviteUser(user));
            }
        });
    }

    async _inviteUser(user) {
        if (!this.currentAlbum) return;
        const res = await this.model.savePermission(this.currentAlbum.id, user.id, 'view');
        if (res.success) {
            this.view.showToast(`${user.username} invité avec accès "Voir"`);
            this._loadAlbumPermissions();
        } else {
            this.view.showToast(res.message || 'Erreur lors de l\'ajout');
        }
    }

    async _changeUserRole(userId, newRole) {
        const res = await this.model.savePermission(this.currentAlbum.id, userId, newRole);
        if (res.success) {
            this.view.showToast('Permission mise à jour');
        }
    }

    async _removeUserAccess(userId) {
        const res = await this.model.removePermission(this.currentAlbum.id, userId);
        if (res.success) {
            this.view.showToast('Accès révoqué');
            this._loadAlbumPermissions();
        }
    }
    _bindVisibility() {
        const visMap = ['public', 'restricted', 'private'];

        document.querySelectorAll('.vis-card').forEach((card, i) => {
            card.addEventListener('click', async () => {
                if (!this.currentAlbum) return;
                const newVis = visMap[i];

                document.querySelectorAll('.vis-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const res = await this.model.updateVisibility(this.currentAlbum.id, newVis);
                if (res.success) {
                    this.currentAlbum.visibility = newVis;
                    this.view.updateLinkBox(this.currentAlbum.id, this.currentAlbum.title, newVis);
                    this.view.showToast(`Visibilité mise à jour : ${card.querySelector('.vis-name').textContent}`);

                    const chip = this.view.albumStrip.querySelector(`[data-id="${this.currentAlbum.id}"]`);
                    if (chip) chip.dataset.visibility = newVis;
                } else {
                    this.view.showToast('Erreur lors de la mise à jour');
                }
            });
        });
    }

    _bindSocialShare() {
        const getUrl = () => {
            if (!this.currentAlbum || this.currentAlbum.visibility === 'private') return null;
            return `${window.location.origin}/Projet_fullstack/Projet_1/app-photo-album/frontend/photo-add/photo-add.html?album_id=${this.currentAlbum.id}&album_nom=${encodeURIComponent(this.currentAlbum.title)}`;
        };

        document.querySelector('.s-wa')?.addEventListener('click', () => {
            const url = getUrl();
            if (!url) return this.view.showToast('Album privé, pas de lien disponible');
            const text = encodeURIComponent(`Regarde cet album photo : ${url}`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
        });

        document.querySelector('.s-sms')?.addEventListener('click', () => {
            const url = getUrl();
            if (!url) return this.view.showToast('Album privé, pas de lien disponible');
            const text = encodeURIComponent(`Regarde cet album photo : ${url}`);
            window.open(`sms:?body=${text}`, '_blank');
        });

        document.querySelector('.s-ig')?.addEventListener('click', () => {
            const url = getUrl();
            if (!url) return this.view.showToast('Album privé, pas de lien disponible');
            navigator.clipboard.writeText(url).then(() => {
                this.view.showToast('Lien copié ! Colle-le dans ta story Instagram');
            });
        });

        document.querySelector('.s-tt')?.addEventListener('click', () => {
            const url = getUrl();
            if (!url) return this.view.showToast('Album privé, pas de lien disponible');
            navigator.clipboard.writeText(url).then(() => {
                this.view.showToast('Lien copié ! Colle-le dans ta bio TikTok');
            });
        });
    }
    _bindCopy() {
        document.getElementById('copyBtn')?.addEventListener('click', () => {
            const url = document.getElementById('linkUrl')?.textContent;
            if (!url || url.includes('privé')) return;
            navigator.clipboard.writeText(url).then(() => {
                this.view.showToast('Lien copié !');
                const btn = document.getElementById('copyBtn');
                btn.textContent = 'Copié ✓';
                setTimeout(() => btn.textContent = 'Copier', 2000);
            });
        });
    }

    _bindTabs() {
        document.getElementById('tabMesAlbums')?.addEventListener('click', () => {
            this.view.showPanel('mes');
        });

        document.getElementById('tabPartagesAvecMoi')?.addEventListener('click', async () => {
            this.view.showPanel('partages');
            await this._loadPublicAlbums();
        });
    }
    async _loadPublicAlbums() {
        const grid = document.getElementById('publicAlbumsGrid');
        if (!grid) return;
        grid.innerHTML = '<p class="public-album-empty">Chargement...</p>';
        try {
            const data = await this.model.getPublicAlbums();
            if (data.success) {
                this.view.renderPublicAlbums(data.albums, (album) => {
                    window.location.href = `../photo-add/photo-add.html?album_id=${album.id}&album_nom=${encodeURIComponent(album.title)}`;
                });
            } else {
                grid.innerHTML = '<p class="public-album-empty">Erreur : ' + (data.error || 'chargement impossible') + '</p>';
            }
        } catch (err) {
            grid.innerHTML = '<p class="public-album-empty">Erreur serveur.</p>';
            console.error(err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new ShareController());