const BASE = '/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php';

class CompteController {
    constructor() {
        this.user = null;
        this._init();
        this._bindEvents();
    }

    async _init() {
        const params = new URLSearchParams(window.location.search);
        this.viewedUserId = params.get('user_id') || null;
        await this._loadProfile();
        await this._loadFavorites();
        this._renderFollowBtn();
    }

    async _loadProfile() {
        const url = this.viewedUserId
            ? `${BASE}?t=profile&user_id=${this.viewedUserId}`
            : `${BASE}?t=profile`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) return;
        this.user = data.user;

        document.getElementById('profileName').textContent = data.user.name || '—';
        document.getElementById('profileEmail').textContent = data.user.email || '—';
        document.getElementById('followersCount').textContent = data.user.followers ?? 0;
        document.getElementById('followingCount').textContent = data.user.following ?? 0;
        document.getElementById('bioText').textContent = data.user.bio || 'Aucune bio pour l\'instant.';
        document.getElementById('bioInput').value = data.user.bio || '';

        if (data.user.avatar_url) {
            const img = document.getElementById('avatarImg');
            img.src = data.user.avatar_url;
            img.style.display = 'block';
            document.getElementById('avatarPlaceholder').style.display = 'none';
        }
    }

    async _loadFavorites() {
        const res = await fetch(`${BASE}?t=likes`);
        const data = await res.json();
        const grid = document.getElementById('favorisGrid');
        if (!data.success || !data.photos.length) {
            grid.innerHTML = '<p class="empty-state">Aucun favori pour l\'instant.</p>';
            return;
        }
        grid.innerHTML = data.photos.map(p => `
            <div class="favori-card" data-id="${p.id}">
                <img src="${p.url}" alt="photo" />
                <button class="unlike-btn" data-id="${p.id}" title="Retirer des favoris">❤️</button>
            </div>
        `).join('');

        grid.querySelectorAll('.unlike-btn').forEach(btn => {
            btn.addEventListener('click', () => this._toggleLike(btn.dataset.id, btn.closest('.favori-card')));
        });
    }

    _renderFollowBtn() {
        if (!this.viewedUserId) return;
        const container = document.querySelector('.profile-block');
        if (!container) return;

        const btn = document.createElement('button');
        btn.id = 'followBtn';
        btn.textContent = 'S\'abonner';
        btn.style.cssText = `
        margin-top: 12px;
        background: white;
        color: #A71F81;
        border: 2px solid #A71F81;
        border-radius: 20px;
        padding: 8px 24px;
        font-size: 14px;
        font-family: McLaren, sans-serif;
        cursor: pointer;
        font-weight: 700;
    `;
        const isFollowing = this.user?.is_following || false;
        btn.dataset.following = isFollowing ? 'true' : 'false';
        btn.textContent = isFollowing ? 'Se désabonner' : 'S\'abonner';
        btn.style.background = isFollowing ? '#A71F81' : 'white';
        btn.style.color = isFollowing ? 'white' : '#A71F81';
        
        btn.addEventListener('click', () => this._toggleFollow(btn));
        container.after(btn);
    }

    async _toggleLike(photoId, card) {
        const res = await fetch(`${BASE}?t=likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_id: photoId })
        });
        const data = await res.json();
        if (data.success && !data.liked) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            card.style.transition = '0.3s';
            setTimeout(() => { card.remove(); this._checkEmptyFavoris(); }, 300);
        }
    }

    async _toggleFollow(btn) {
        const isFollowing = btn.dataset.following === 'true';
        const method = isFollowing ? 'DELETE' : 'POST';
        const res = await fetch(`${BASE}?t=follow`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_id: parseInt(this.viewedUserId) })
        });
        const data = await res.json();
        if (data.success) {
            btn.dataset.following = isFollowing ? 'false' : 'true';
            btn.textContent = isFollowing ? 'S\'abonner' : 'Se désabonner';
            btn.style.background = isFollowing ? 'white' : '#A71F81';
            btn.style.color = isFollowing ? '#A71F81' : 'white';
            await this._loadProfile();
        }
    }

    _checkEmptyFavoris() {
        const grid = document.getElementById('favorisGrid');
        if (!grid.querySelector('.favori-card')) {
            grid.innerHTML = '<p class="empty-state">Aucun favori pour l\'instant.</p>';
        }
    }

    _bindEvents() {
        // Edit mode
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            document.getElementById('bioEditBlock').style.display = 'block';
            document.getElementById('bioBlock').style.display = 'none';
            document.getElementById('avatarEditLabel').style.display = 'flex';
        });

        document.getElementById('cancelBioBtn')?.addEventListener('click', () => {
            document.getElementById('bioEditBlock').style.display = 'none';
            document.getElementById('bioBlock').style.display = 'block';
            document.getElementById('avatarEditLabel').style.display = 'none';
        });

        document.getElementById('saveBioBtn')?.addEventListener('click', () => this._saveProfile());

        // Avatar
        document.getElementById('avatarInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('avatarImg').src = ev.target.result;
                document.getElementById('avatarImg').style.display = 'block';
                document.getElementById('avatarPlaceholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        });

        // Tabs
        document.getElementById('tabFavoris')?.addEventListener('click', () => {
            document.getElementById('panelFavoris').style.display = 'block';
            document.getElementById('panelParams').style.display = 'none';
            document.getElementById('tabFavoris').classList.add('active');
            document.getElementById('tabParams').classList.remove('active');
        });

        document.getElementById('tabParams')?.addEventListener('click', () => {
            document.getElementById('panelFavoris').style.display = 'none';
            document.getElementById('panelParams').style.display = 'block';
            document.getElementById('tabParams').classList.add('active');
            document.getElementById('tabFavoris').classList.remove('active');
        });

        // Déco
        document.getElementById('decoBtn')?.addEventListener('click', () => {
            if (!confirm('Se déconnecter ?')) return;
            fetch(`${BASE}?t=logout`, { method: 'POST' }).then(() => {
                window.location.href = '../Login/login.html';
            });
        });
    }

    async _saveProfile() {
        const formData = new FormData();
        formData.append('bio', document.getElementById('bioInput').value.trim());
        formData.append('name', this.user?.name || '');
        const avatarFile = document.getElementById('avatarInput').files[0];
        if (avatarFile) formData.append('avatar', avatarFile);

        const res = await fetch(`${BASE}?t=profile`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            document.getElementById('bioText').textContent = document.getElementById('bioInput').value || 'Aucune bio.';
            document.getElementById('bioEditBlock').style.display = 'none';
            document.getElementById('bioBlock').style.display = 'block';
            document.getElementById('avatarEditLabel').style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new CompteController());