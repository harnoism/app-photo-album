console.log("signup.js chargé");

const steps = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3"),
];
console.log("steps:", steps);

const inputs = [
    document.getElementById("name"),
    document.getElementById("email"),
    document.getElementById("password"),
];
console.log("inputs:", inputs);

const nextBtn     = document.getElementById("nextBtn");
const stepLabel   = document.getElementById("step-label");
const progressBar = document.getElementById("progressBar");
const errorMsg    = document.getElementById("error");

console.log("nextBtn:", nextBtn);
console.log("stepLabel:", stepLabel);
console.log("progressBar:", progressBar);
console.log("errorMsg:", errorMsg);

let currentStep = 0;
const progressValues = ["33%", "66%", "100%"];

function updateButton() {
    const val = inputs[currentStep].value.trim();
    console.log(`updateButton() — étape ${currentStep}, valeur: "${val}"`);
    nextBtn.disabled = val === "";
    console.log("bouton disabled:", nextBtn.disabled);
}

inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        console.log(`input[${index}] modifié:`, input.value);
        updateButton();
    });
});

nextBtn.addEventListener("click", function () {
    console.log("--- CLIC nextBtn ---");
    console.log("currentStep:", currentStep);

    const val = inputs[currentStep].value.trim();
    console.log("valeur input courant:", val);

    if (currentStep === 1 && !val.includes("@")) {
        console.log("Email invalide");
        errorMsg.textContent = "Entre une adresse email valide.";
        return;
    }

    if (currentStep === 2 && val.length < 8) {
        console.log("Mot de passe trop court");
        errorMsg.textContent = "Le mot de passe doit faire au moins 8 caractères.";
        return;
    }

    errorMsg.textContent = "";

    if (currentStep === 2) {
        console.log("Étape finale → submitForm()");
        submitForm();
        return;
    }

    console.log(`passage étape ${currentStep} → ${currentStep + 1}`);
    steps[currentStep].classList.remove("active");
    currentStep++;
    steps[currentStep].classList.add("active");

    if (stepLabel) {
        stepLabel.textContent = `Etape ${currentStep + 1} sur 3`;
    } else {
        console.warn("stepLabel introuvable dans le HTML !");
    }

    progressBar.style.width = progressValues[currentStep];
    console.log("progressBar width:", progressValues[currentStep]);

    if (currentStep === 2) {
        nextBtn.textContent = "Créer mon compte ✓";
        console.log("bouton → Créer mon compte");
    }

    nextBtn.disabled = true;
    inputs[currentStep].focus();
    console.log(`focus sur input[${currentStep}]`);
});

function submitForm() {
    const data = {
        name:     inputs[0].value.trim(),
        email:    inputs[1].value.trim(),
        password: inputs[2].value.trim(),
    };
    console.log("données envoyées:", data);

    fetch("/Projet_fullstack/Projet_1/app-photo-album/bdd/register.php", {
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
            window.location.href = "album.html";
        } else {
            console.log("Erreur serveur:", reponse.message);
            errorMsg.textContent = reponse.message || "Une erreur est survenue.";
        }
    })
    .catch(err => {
        console.error("fetch échoué:", err);
        errorMsg.textContent = "Impossible de joindre le serveur.";
    });
}