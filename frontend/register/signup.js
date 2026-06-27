class SignupManager {
    constructor() {
        console.log("signup.js chargé (Mode POO)");

        this.currentStep = 0;
        this.progressValues = ["33%", "66%", "100%"];

        this.steps = [
            document.getElementById("step1"),
            document.getElementById("step2"),
            document.getElementById("step3"),
        ];
        this.inputs = [
            document.getElementById("name"),
            document.getElementById("email"),
            document.getElementById("password"),
        ];
        this.nextBtn = document.getElementById("nextBtn");
        this.stepLabel = document.getElementById("step-label");
        this.progressBar = document.getElementById("progressBar");
        this.errorMsg = document.getElementById("error");

        console.log("steps:", this.steps);
        console.log("inputs:", this.inputs);
        console.log("nextBtn:", this.nextBtn);
        console.log("stepLabel:", this.stepLabel);
        console.log("progressBar:", this.progressBar);
        console.log("errorMsg:", this.errorMsg);

        this.init();
    }

    init() {
        this.inputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                console.log(`input[${index}] modifié:`, input.value);
                this.updateButton();
            });
        });

        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => this.handleNextStep());
        }
    }

    updateButton() {
        const val = this.inputs[this.currentStep].value.trim();
        console.log(`updateButton() — étape ${this.currentStep}, valeur: "${val}"`);
        this.nextBtn.disabled = val === "";
        console.log("bouton disabled:", this.nextBtn.disabled);
    }

    handleNextStep() {
        console.log("--- CLIC nextBtn ---");
        console.log("currentStep:", this.currentStep);

        const val = this.inputs[this.currentStep].value.trim();
        console.log("valeur input courant:", val);

        if (this.currentStep === 1 && !val.includes("@")) {
            console.log("Email invalide");
            this.errorMsg.textContent = "Entre une adresse email valide.";
            return;
        }

        if (this.currentStep === 2 && val.length < 8) {
            console.log("Mot de passe trop court");
            this.errorMsg.textContent = "Le mot de passe doit faire au moins 8 caractères.";
            return;
        }

        this.errorMsg.textContent = "";

        if (this.currentStep === 2) {
            console.log("Étape finale → submitForm()");
            this.submitForm();
            return;
        }

        console.log(`passage étape ${this.currentStep} → ${this.currentStep + 1}`);
        this.steps[this.currentStep].classList.remove("active");
        this.currentStep++;
        this.steps[this.currentStep].classList.add("active");

        if (this.stepLabel) {
            this.stepLabel.textContent = `Etape ${this.currentStep + 1} sur 3`;
        } else {
            console.warn("stepLabel introuvable dans le HTML !");
        }

        this.progressBar.style.width = this.progressValues[this.currentStep];
        console.log("progressBar width:", this.progressValues[this.currentStep]);

        if (this.currentStep === 2) {
            this.nextBtn.textContent = "Créer mon compte ✓";
            console.log("bouton → Créer mon compte");
        }

        this.nextBtn.disabled = true;
        this.inputs[this.currentStep].focus();
        console.log(`focus sur input[${this.currentStep}]`);
    }

    submitForm() {
        const data = {
            name: this.inputs[0].value.trim(),
            email: this.inputs[1].value.trim(),
            password: this.inputs[2].value.trim(),
        };
        console.log("données envoyées:", data);

        fetch("/Projet_fullstack/Projet_1/app-photo-album/bdd/index.php?t=register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then(res => {
                console.log("réponse HTTP status:", res.status);
                return res.json();
            })
            .then(reponse => {
                console.log("réponse JSON:", reponse);
                if (reponse.success) {
                    console.log("Inscription réussie → redirect album");
                    window.location.href = "../albums/album.html";
                } else {
                    console.log("Erreur serveur:", reponse.message);
                    this.errorMsg.textContent = reponse.message || "Une erreur est survenue.";
                }
            })
            .catch(err => {
                console.error("fetch échoué:", err);
                this.errorMsg.textContent = "Impossible de joindre le serveur.";
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new SignupManager();
});