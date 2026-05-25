document.addEventListener('DOMContentLoaded', () => {

    const overlay = document.getElementById('overlay');
    const overlay2 = document.getElementById('overlay2');

    const openPopup = () => overlay.classList.add('open');

    document.getElementById('addBtn').addEventListener('click', openPopup);
    document.getElementById('addAlbumCard').addEventListener('click', openPopup);

    document.getElementById('decoBtn').addEventListener('click', () => {
        overlay2.classList.add('open');
    });

    document.getElementById('closeBtn').addEventListener('click', () => {
        overlay.classList.remove('open');
    });

    document.getElementById('closeBtn2').addEventListener('click', () => {
        overlay2.classList.remove('open');
    });

    document.getElementById('confirmDecoBtn').addEventListener('click', () => {
        window.location.href = '../bdd/logout.php';
    });

    document.getElementById('addPhotosBtn').addEventListener('click', () => {
        document.getElementById('photoInput').click();
    });

    document.getElementById('photoInput').addEventListener('change', (e) => {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = '';
        [...e.target.files].forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style = 'width:50px;height:50px;object-fit:cover;border-radius:4px;';
            preview.appendChild(img);
        });
    });

    document.getElementById('createBtn').addEventListener('click', async (e) => {
        e.preventDefault(); // Bloque le rechargement de la page
        console.log('=== CLIC CREATE ===');

        const name = document.getElementById('albumName').value.trim();
        const desc = document.getElementById('albumDesc').value.trim();
        const photos = document.getElementById('photoInput').files;
        const grid = document.getElementById('albumsGrid');
        const addAlbumCard = document.getElementById('addAlbumCard');

        if (!name) return alert('Donne un nom à l\'album !');

        const formData = new FormData();
        formData.append('nom', name);
        formData.append('description', desc);
        [...photos].forEach(photo => formData.append('photos[]', photo));

        try {
            const res = await fetch('../bdd/create_album.php', {
                method: 'POST',
                body: formData
            });

            console.log('Status HTTP:', res.status);

            const texte = await res.text();
            console.log('Réponse PHP:', texte);

            let data;
            try {
                data = JSON.parse(texte);
            } catch (errJson) { 
                alert('Erreur de formatage PHP : ' + texte);
                return;
            }

            if (data.success) {
                // Création de la card
                const nouvelleCard = document.createElement('div');
                nouvelleCard.classList.add('album-card');
                nouvelleCard.dataset.id = data.album_id;
                nouvelleCard.innerHTML = `
                <div class="album-thumb">
                    <div></div><div></div>
                    <div></div><div></div>
                </div>
                <div class="album-label">${name}</div>
            `;

                if (grid && addAlbumCard) {
                    grid.insertBefore(nouvelleCard, addAlbumCard);
                } else {
                    console.error("L'élément 'albumsGrid' ou 'addAlbumCard' est introuvable dans le HTML.");
                }

                // Réinitialisation du formulaire et fermeture de la poput
                overlay.classList.remove('open');
                document.getElementById('albumName').value = '';
                document.getElementById('albumDesc').value = '';
                document.getElementById('photoInput').value = '';
                document.getElementById('photoPreview').innerHTML = '<img class="img-folder" src="../img/img.svg" alt="img" />';

            } else {
                alert("Erreur retournée par le serveur : " + (data.error || "Inconnue"));
            }

        } catch (errorFetch) { 
            console.error("Erreur critique durant le Fetch :", errorFetch);
            alert("Erreur JavaScript lors de la création de l'album. Regarde la console !");
        }
    });
});