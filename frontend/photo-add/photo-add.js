class PhotoModel {
    constructor(albumId) {
        this.albumId = albumId;
        this.base = '/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php';
    }

    async getPhotos() {
        const res = await fetch(`${this.base}?t=photos&album_id=${this.albumId}`);
        return await res.json();
    }

    async getComment(photoId) {
        const res = await fetch(`${this.base}?t=comments&photo_id=${photoId}`);
        return await res.json();
    }

    async deletePhoto(photoId) {
        const res = await fetch(`${this.base}?t=photos&album_id=${this.albumId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                photo_id: photoId
            })
        });
        return await res.json();
    }

    async uploadPhotos(formData) {
        const res = await fetch(`${this.base}?t=photos`, {
            method: 'POST',
            body: formData
        });
        const text = await res.text();
        return JSON.parse(text);
    }
    async addComment(photoId, content) {
        const res = await fetch(`${this.base}?t=comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_id: photoId, content })
        });
        return await res.json();
    }

    async getAlbumAccess(albumId) {
        const res = await fetch(`${this.base}?t=album_access&album_id=${albumId}`);
        return await res.json();
    }
    async editComment(commentId, content) {
        const res = await fetch(`${this.base}?t=comments`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_id: commentId, content })
        });
        return await res.json();
    }

    async deleteComment(commentId) {
        console.log('Suppression du commentaire', commentId);
        const res = await fetch(`${this.base}?t=comments`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_id: commentId })
        });
        return await res.json();
    }

    async toggleLike(photoId) {
        const res = await fetch(`${this.base}?t=likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_id: photoId })
        });
        return await res.json();
    }
}
class PhotoView {
    constructor() {
        this.photosGrid = document.getElementById('photosGrid');
        this.previewGrid = document.getElementById('previewGrid');
        this.formSection = document.getElementById('formSection');
        this.formError = document.getElementById('formError');
        this.submitBtn = document.getElementById('submitBtn');
        this.photoPreview = document.getElementById('photoPreview');
        this.photoInput = document.getElementById('photoInput');
        this.hideDeleteButtons = false;
    }

    hideUploadSection() {
        if (this.formSection) this.formSection.style.display = 'none';
        if (this.photoPreview) this.photoPreview.style.display = 'none';
        const tagsSection = document.querySelector('.popup-section-label');
        if (tagsSection) tagsSection.closest('.popup')?.querySelectorAll('*').forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.4';
        });
    }

    renderExistingPhotos(photos, onDelete, onCommentClick) {
        this.photosGrid.innerHTML = '';

        if (!photos.length) {
            this.photosGrid.innerHTML = '<p class="no-photos">Aucune photo dans cet album.</p>';
            return;
        }

        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'photo-card';
            item.dataset.id = photo.id;

            const tagsHtml = Array.isArray(photo.tags) && photo.tags.length
                ? photo.tags.map(t => `<span class="photo-tag">${t}</span>`).join('')
                : '';

            item.innerHTML = `
                <img src="${photo.url}" alt="photo" style="cursor:pointer;" />
                ${tagsHtml ? `<div class="photo-tags-row">${tagsHtml}</div>` : ''}
                ${this.hideDeleteButtons ? '' : `<button class="delete-btn" title="Supprimer"><i class="fa-solid fa-trash-can" style="color: rgb(255, 255, 255);"></i></button>`}
            `;

            item.querySelector('img').addEventListener('click', () => onCommentClick(photo));

            if (!this.hideDeleteButtons) {
                item.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onDelete(photo.id, item);
                });
            }
            this.photosGrid.appendChild(item);
        });
    }

    addPreviewItem(file, index, onRemove) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const item = document.createElement('div');
            item.className = 'preview-item';
            item.dataset.index = index;
            item.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="preview-remove" title="Retirer">✕</button>
            `;
            item.querySelector('.preview-remove').addEventListener('click', (ev) => {
                ev.stopPropagation();
                onRemove(index);
                item.remove();
            });
            this.previewGrid.appendChild(item);
        };
        reader.readAsDataURL(file);
    }
    removeExistingItem(element) {
        element.classList.add('deleting');
        setTimeout(() => element.remove(), 300);
    }

    showFormSection(visible) {
        this.formSection.style.display = visible ? 'flex' : 'none';
    }

    setError(msg) {
        this.formError.textContent = msg;
    }

    setSubmitLoading(loading) {
        this.submitBtn.disabled = loading;
        this.submitBtn.textContent = loading ? 'Envoi en cours…' : 'Enregistrer les photos';
    }

    resetUploadForm() {
        this.previewGrid.innerHTML = '';
        document.getElementById('photoDesc').value = '';
        document.getElementById('photoDate').value = '';
        this.showFormSection(false);
        this.setError('');
    }

    showNoPhotos() {
        if (!this.photosGrid.querySelector('.photo-card')) {
            this.photosGrid.innerHTML = '<p class="no-photos">Aucune photo dans cet album.</p>';
        }
    }

    commentModal(photo, comments, currentUserId, handlers, canComment = true) {
        const existing = document.getElementById('commentModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'commentModal';
        modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 20px;
    `;

        modal.innerHTML = `
        <div style="background: #fff; border-radius: 16px; width: 100%;
                    max-width: 500px; max-height: 85vh; display: flex;
                    flex-direction: column; overflow: hidden;">

            <div style="display: flex; align-items: center; justify-content: space-between;
                        padding: 14px 16px; border-bottom: 1px solid #f0f0f0;">
                <h3 style="font-size: 15px; font-weight: 600; margin: 0;">Commentaires</h3>
                <button id="closeCommentModal" style="background: #eee; border: none;
                        border-radius: 50%; width: 28px; height: 28px;
                        cursor: pointer; font-size: 16px; color: #555;">✕</button>
            </div>

            <img src="${photo.url}" alt="photo"
                 style="width: 100%; max-height: 240px; object-fit: cover; flex-shrink: 0;" />

            <div style="padding:8px 16px; display:flex; align-items:center; gap:8px; border-bottom:1px solid #f0f0f0;">
                <button id="likePhotoBtn" style="background:none;border:none;font-size:22px;cursor:pointer;">🤍</button>
                <span id="likeLabel" style="font-size:12px;color:#aaa;">Aimer cette photo</span>
            </div >

            <div id="commentsList" style="flex: 1; overflow-y: auto;
                 padding: 12px 16px; display: flex; flex-direction: column; gap: 12px;">
                ${this._renderComments(comments, currentUserId)}
            </div>

            <div style="border-top: 1px solid #f0f0f0; padding: 10px 14px;
                        display: flex; align-items: center; gap: 10px;">
                <input id="commentInput" type="text" placeholder="Ajouter un commentaire..."
                       style="flex: 1; border: none; outline: none; font-size: 13px;
                              font-family: inherit; background: transparent;" />
                <button id="submitComment" style="font-size: 13px; font-weight: 600;
                        color: #A71F81; background: none; border: none;
                        cursor: pointer; padding: 0;">Publier</button>
            </div>
        </div>
    `;
        document.body.appendChild(modal);
        document.getElementById('likePhotoBtn')?.addEventListener('click', async () => {
            if (!handlers.onLike) return;
            const res = await handlers.onLike(photo.id);
            const btn = document.getElementById('likePhotoBtn');
            const label = document.getElementById('likeLabel');
            if (res.success) {
                btn.textContent = res.liked ? '❤️' : '🤍';
                label.textContent = res.liked ? 'Retiré des favoris' : 'Aimer cette photo';
                setTimeout(() => { label.textContent = 'Aimer cette photo'; }, 1500);
            }
        });
        if (!canComment) {
            const inputZone = modal.querySelector('#commentInput');
            const submitZone = modal.querySelector('#submitComment');
            if (inputZone) inputZone.style.display = 'none';
            if (submitZone) submitZone.style.display = 'none';

            const bar = modal.querySelector('[style*="border-top"]');
            if (bar) bar.innerHTML = '<p style="color:#aaa;font-size:12px;padding:10px 14px;text-align:center;">Vous pouvez voir les commentaires mais pas en écrire.</p>';
        }
        modal.querySelector('#closeCommentModal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        const input = modal.querySelector('#commentInput');
        const submitBtn = modal.querySelector('#submitComment');

        submitBtn.addEventListener('click', () => handlers.onAdd(input.value.trim(), () => input.value = ''));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handlers.onAdd(input.value.trim(), () => input.value = '');
        });
        this._bindCommentEvent(modal, handlers);
        modal._handlers = handlers;
    }

    _renderComments(comments, currentUserId) {
        if (!comments.length) {
            return '<p style="color:#999; font-size:13px; text-align:center; padding: 20px 0;">Aucun commentaire pour l\'instant.</p>';
        }
        return comments.map(c => {
            const initiales = (c.username || 'U').slice(0, 2).toUpperCase();
            const isAuthor = parseInt(c.user_id) === parseInt(currentUserId);
            const actions = isAuthor ? `
            <button class="edit-comment-btn" data-id="${c.id}" data-content="${c.content.replace(/"/g, '&quot;')}"
                    style="font-size:11px; color:#888; background:none; border:none; cursor:pointer; padding:0;">
                Modifier
            </button>
            <button class="delete-comment-btn" data-id="${c.id}"
                    style="font-size:11px; color:#e0305a; background:none; border:none; cursor:pointer; padding:0;">
                Supprimer
            </button>
        ` : '';
            return `
            <div class="comment-item" data-comment-id="${c.id}"
                 style="display:flex; gap:10px; align-items:flex-start;">
                <div style="width:32px; height:32px; border-radius:50%; background:#EEEDFE;
                            display:flex; align-items:center; justify-content:center;
                            font-size:11px; font-weight:600; color:#3C3489; flex-shrink:0;">
                    ${initiales}
                </div>
                <div style="flex:1; min-width:0;">
                    <p style="margin:0; font-size:13px; line-height:1.4;">
                        <span style="font-weight:600; color:#111;">${c.username || 'Utilisateur'}</span>
                        <span class="comment-text" style="color:#222; margin-left:4px;">${c.content}</span>
                    </p>
                    <div style="display:flex; align-items:center; gap:12px; margin-top:3px;">
                        <span style="font-size:11px; color:#aaa;">${this._timeAgo(c.created_at)}</span>
                        ${actions}
                    </div>
                    <div class="edit-zone" style="display:none; margin-top:6px;">
                        <div style="display:flex; gap:6px;">
                            <input class="edit-input" type="text" value="${c.content.replace(/"/g, '&quot;')}"
                                   style="flex:1; font-size:13px; padding:5px 8px; border:1px solid #ddd;
                                          border-radius:8px; font-family:inherit;" />
                            <button class="confirm-edit-btn" data-id="${c.id}"
                                    style="font-size:12px; padding:5px 10px; background:#A71F81;
                                           color:white; border:none; border-radius:8px; cursor:pointer;">
                                OK
                            </button>
                            <button class="cancel-edit-btn"
                                    style="font-size:12px; padding:5px 10px; background:#eee;
                                           border:none; border-radius:8px; cursor:pointer;">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    _bindCommentEvent(modal, handlers) {
        modal.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', () => handlers.onDelete(btn.dataset.id, btn));
        });
        modal.querySelectorAll('.edit-comment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.comment-item');
                item.querySelector('.edit-zone').style.display = 'block';
                btn.style.display = 'none';
            });
        });

        modal.querySelectorAll('.cancel-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.comment-item');
                item.querySelector('.edit-zone').style.display = 'none';
                item.querySelector('.edit-comment-btn').style.display = '';
            });
        });

        modal.querySelectorAll('.confirm-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.comment-item');
                const newContent = item.querySelector('.edit-input').value.trim();
                if (newContent) handlers.onEdit(btn.dataset.id, newContent, item);
            });
        });
    }

    refreshComments(comments, currentUserId) {
        const list = document.getElementById('commentsList');
        if (list) list.innerHTML = this._renderComments(comments, currentUserId);
        const modal = document.getElementById('commentModal');
        if (modal) {
            const handlers = modal._handlers;
            if (handlers) this._bindCommentEvent(modal, handlers);
        }
    }

    _timeAgo(dateStr) {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'à l\'instant';
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
        return `il y a ${Math.floor(diff / 86400)}j`;
    }
}

class PhotoController {
    constructor(albumId) {
        this.albumId = albumId;
        this.model = new PhotoModel(albumId);
        this.view = new PhotoView();
        this.selectedFiles = [];
        this.selectedTags = [];
        this.currentUserId = 0;
        this.userPermission = null;

        this._bindEvents();
        this._bindTagEvents();
        this._init();
    }


    async _init() {
        await this._loadCurrentUser();
        this._loadPhotos();
    }

    async _loadCurrentUser() {
        try {
            const res = await fetch(`${this.model.base}?t=whoami`);
            const data = await res.json();
            if (data.success) this.currentUserId = data.user_id;
        } catch (err) {
            console.error('Erreur récupération user:', err);
        }
    }
    async _loadPhotos() {
        try {
            const data = await this.model.getPhotos();
            if (data.success) {
                this.userPermission = data.permission;

                const canEdit = data.is_owner || data.permission === 'edit';

                if (!canEdit) {
                    this.view.hideUploadSection();
                    this.view.hideDeleteButtons = true;
                }

                this.view.renderExistingPhotos(
                    data.photos,
                    (id, el) => this._deletePhoto(id, el),
                    (photo) => this._openComments(photo)
                );
            }
        } catch (err) {
            console.error('Erreur chargement photos:', err);
        }
    }

    // SUPPR PHOTO
    async _deletePhoto(photoId, element) {
        if (!confirm('Supprimer cette photo définitivement ?')) return;
        try {
            const data = await this.model.deletePhoto(photoId);
            if (data.success) {
                this.view.removeExistingItem(element);
                setTimeout(() => this.view.showNoPhotos(), 350);
            } else {
                alert('Erreur : ' + (data.error || 'Suppression impossible'));
            }
        } catch (err) {
            alert('Impossible de joindre le serveur.');
        }
    }

    async _openComments(photo) {
        try {
            const data = await this.model.getComment(photo.id);
            const comments = data.success ? data.comments : [];
            const currentUserId = this.currentUserId;
            const canComment = ['owner', 'edit', 'comment'].includes(this.userPermission);

            const handlers = {
                onLike: async (photoId) => {
                    return await this.model.toggleLike(photoId); 
                },
                onAdd: async (content, clearInput) => {
                    if (!content) return;
                    const res = await this.model.addComment(photo.id, content);
                    if (res.success) {
                        clearInput();
                        const updated = await this.model.getComment(photo.id);
                        this.view.refreshComments(updated.comments, currentUserId);
                    }
                },
                onDelete: async (commentId, btn) => {
                    if (!confirm('supprimer ce commentaire?')) return;
                    const res = await this.model.deleteComment(commentId);
                    if (res.success) {
                        btn.closest('.comment-item').remove();
                    } else {
                        alert('Erreur :' + (res.error || 'Suppression impossible'));
                    }
                },
                onEdit: async (commentId, newContent, item) => {
                    const res = await this.model.editComment(commentId, newContent);
                    if (res.success) {
                        item.querySelector('.comment-text').textContent = newContent;
                        item.querySelector('.edit-input').value = newContent;
                        item.querySelector('.edit-zone').style.display = 'none';
                        item.querySelector('.edit-comment-btn').style.display = '';
                        item.querySelector('.edit-comment-btn').dataset.content = newContent;
                    } else {
                        alert('Erreur : ' + (res.error || 'Modification impossible'));
                    }
                }
            };
            this.view.commentModal(photo, comments, currentUserId, handlers, canComment);
        } catch (err) {
            console.log('Erreur commentaires: ', err);
        }
        console.log('permission actuelle:', this.userPermission);
    }


    // UPLOAD PHOTO
    async _uploadPhotos() {
        const filesToSend = this.selectedFiles.filter(Boolean);
        if (!filesToSend.length) {
            this.view.setError('Sélectionne au moins une photo.');
            return;
        }

        const formData = new FormData();
        formData.append('album_id', this.albumId);
        formData.append('description', document.getElementById('photoDesc').value.trim());
        formData.append('date', document.getElementById('photoDate').value);
        filesToSend.forEach(file => formData.append('photos[]', file));
        formData.append('tags', JSON.stringify(this.selectedTags));

        this.view.setSubmitLoading(true);
        this.view.setError('');

        try {
            const data = await this.model.uploadPhotos(formData);
            if (data.success) {
                this.selectedFiles = [];
                this.selectedTags = [];
                this._renderTags();
                this.view.resetUploadForm();
                this._loadPhotos();
            } else {
                this.view.setError(data.error || 'Erreur lors de l\'envoi.');
            }
        } catch (err) {
            this.view.setError('Erreur serveur. Voir la console (F12).');
            console.error(err);
        } finally {
            this.view.setSubmitLoading(false);
        }
    }

    _handleFiles(fileList) {
        const allowed = ['image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;

        Array.from(fileList).forEach(file => {
            if (!allowed.includes(file.type)) { alert(`"${file.name}" : JPG/PNG uniquement.`); return; }
            if (file.size > maxSize) { alert(`"${file.name}" dépasse 5 Mo.`); return; }

            const index = this.selectedFiles.length;
            this.selectedFiles.push(file);
            this.view.addPreviewItem(file, index, (i) => {
                this.selectedFiles[i] = null;
                if (!this.selectedFiles.filter(Boolean).length) this.view.showFormSection(false);
            });
        });

        this.view.showFormSection(this.selectedFiles.filter(Boolean).length > 0);
    }

    _bindTagEvents() {
        document.querySelectorAll('.sug-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                const tagValue = btn.getAttribute('data-tag') || btn.textContent.trim();

                if (!this.selectedTags.includes(tagValue)) {
                    this.selectedTags.push(tagValue);
                    btn.classList.add('used');
                    this._renderTags();
                }
            });
        });

        const addCustomBtn = document.getElementById('addCustomTag');
        const customInput = document.getElementById('customTagInput');

        if (addCustomBtn && customInput) {
            const handleCustomTag = () => {
                const tagValue = customInput.value.trim();
                if (tagValue && !this.selectedTags.includes(tagValue)) {
                    this.selectedTags.push(tagValue);
                    this._renderTags();
                    customInput.value = '';
                }
            };

            addCustomBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleCustomTag();
            });

            customInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomTag();
                }
            });
        }
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

                document.querySelectorAll(`.sug-tag`).forEach(c => {
                    if ((c.getAttribute('data-tag') || c.textContent.trim()) === removed) {
                        c.classList.remove('used');
                    }
                });
                this._renderTags();
            });
        });
    }

    _bindEvents() {
        const { photoPreview, photoInput, submitBtn } = this.view;

        if (photoPreview) photoPreview.addEventListener('click', () => photoInput.click());

        if (photoPreview) {
            photoPreview.addEventListener('dragover', (e) => { e.preventDefault(); photoPreview.classList.add('drag-over'); });
            photoPreview.addEventListener('dragleave', () => photoPreview.classList.remove('drag-over'));
            photoPreview.addEventListener('drop', (e) => {
                e.preventDefault();
                photoPreview.classList.remove('drag-over');
                this._handleFiles(e.dataTransfer.files);
            });
        }

        if (photoInput) {
            photoInput.addEventListener('change', () => {
                this._handleFiles(photoInput.files);
                photoInput.value = '';
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this._uploadPhotos()
            });
        }
    }
}

const params = new URLSearchParams(window.location.search);
const albumId = params.get('album_id');
const albumNom = params.get('album_nom') || 'Inconnu';

document.getElementById('albumNomDisplay').textContent = decodeURIComponent(albumNom);

if (albumId) {
    new PhotoController(albumId);
} else {
    console.warn('album_id manquant dans l\'URL');
}