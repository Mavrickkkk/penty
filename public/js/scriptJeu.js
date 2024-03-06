document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    let drawing = false;
    let currentColor = 'black';
    let currentSize = 5; // Taille du crayon par défaut
    let timerValue = 20; // Valeur initiale du timer en secondes
    let countdownInterval; // Variable pour stocker l'intervalle de compte à rebours

    const colorPalette = document.getElementById('colorPalette');
    colorPalette.addEventListener('click', (event) => {
        if (event.target.style.backgroundColor) {
            currentColor = event.target.style.backgroundColor;
        }
    });

    const eraserButton = document.getElementById('eraserButton');
    eraserButton.addEventListener('click', () => {
        currentColor = 'white';
    });

    const brushSizeInput = document.getElementById('brushSize');
    brushSizeInput.addEventListener('input', () => {
        currentSize = parseInt(brushSizeInput.value, 10);
    });

    // Initialisation de la valeur par défaut du bouton de taille de pinceau
    brushSizeInput.value = currentSize;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    // Fonction pour démarrer le dessin
    function startDrawing(e) {
        if (timerValue > 0 || e.buttons !== 1) {
            drawing = true;
            draw(e);
        }
    }

    // Fonction pour arrêter le dessin
    function stopDrawing() {
        drawing = false;
        context.beginPath();
    }

    // Fonction pour dessiner
    function draw(e) {
        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        context.lineWidth = currentSize;
        context.lineCap = 'round';
        context.strokeStyle = currentColor;

        context.lineTo(mouseX, mouseY);
        context.stroke();
        context.beginPath();
        context.moveTo(mouseX, mouseY);
    }


    // Fonction pour démarrer le timer
    function startTimer() {
        countdownInterval = setInterval(() => {
            timerValue--;
            if (timerValue <= 0) {
                stopTimer();
            }
            updateTimerDisplay();
        }, 1000);
    }

    // Fonction pour arrêter le timer
    function stopTimer() {
        clearInterval(countdownInterval);
    }

    // Fonction pour mettre à jour l'affichage du timer
    function updateTimerDisplay() {
        const countdownElement = document.getElementById('countdown');
        countdownElement.textContent = timerValue;
    }

    // Démarrer le timer lorsque le DOM est chargé
    startTimer();
});
