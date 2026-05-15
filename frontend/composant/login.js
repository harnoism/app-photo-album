console.log("login.js chargé");

//.trim() => Supprime les espaces inutiles au début et à la fin.

const form = document.getElementById("registerForm2");

form.addEventListener("submit", function (event) {
    event.preventDefault();  //Bloquer le rechargement de la page

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error");

    console.log("email:", email);
    console.log("password:", password);
    console.log("errorMsg:", errorMsg);

    if (!email || !password) {
        errorMsg.textContent = " Remplis tous les champs. ";
        return;
    }
    fetch("/Projet_fullstack/Projet_1/app-photo-album/bdd/login.php", {
        method: "POST", //POST cache les données dans la requête HTTP.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
        .then(res => res.json())
        .then(reponse => {
            console.log("réponse complète:", reponse);
            if (reponse.success) {
                console.log("Connexion réussie → redirect album ")
                window.location.href = "album.html";
            } else {
                console.log("Erreur serveur:", reponse.message);
                errorMsg.textContent = reponse.message || "Une erreur est survenue.";
            }
        })
        .catch(() => {
            console.error("fetch échoué:", err);
            errorMsg.textContent = "Impossible de joindre le serveur.";
        });
});