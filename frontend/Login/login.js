class LoginManager {
    constructor() {
        console.log("login.js chargé (Mode POO)");
        
        this.form = document.getElementById("registerForm2");
        this.emailInput = document.getElementById("email");
        this.passwordInput = document.getElementById("password");
        this.errorMsg = document.getElementById("error");

        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener("submit", (event) => this.handleSubmit(event));
        } else {
            console.warn("Formulaire de connexion introuvable dans le HTML.");
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!email || !password) {
            this.errorMsg.textContent = "Remplis tous les champs.";
            return;
        }

        this.sendLoginData(email, password);
    }

    sendLoginData(email, password) {
        fetch("/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php?t=login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
        .then(res => res.json())
        .then(reponse => {
            console.log("réponse complète:", reponse);
            if (reponse.success) {
                window.location.href = "../albums/album.html";
            } else {
                this.errorMsg.textContent = reponse.message || "Une erreur est survenue.";
            }
        })
        .catch((err) => {
            console.error("fetch échoué:", err);
            this.errorMsg.textContent = "Impossible de joindre le serveur.";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new LoginManager();
});