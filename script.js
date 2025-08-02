document.addEventListener('DOMContentLoaded', () => {

    // --- Game Logic & Confetti Celebration (Only runs on game.html)---
    if (document.body.classList.contains('game-page')) {

        const gameBoard = document.getElementById('game-board');
        const movesCountEl = document.getElementById('moves-count');
        const timerEl = document.getElementById('timer');
        const winModal = document.getElementById('win-modal');
        const finalMovesEl = document.getElementById('final-moves');
        const finalTimeEl = document.getElementById('final-time');
        const playAgainBtn = document.getElementById('play-again-btn');
        const confettiCanvas = document.getElementById('confetti-canvas');
        const confettiCtx = confettiCanvas.getContext('2d');

        const cardEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        let firstCard, secondCard, isBoardLocked, moves, matchedPairs;
        let timer, startTime, elapsedTime = 0;
        let confettiParticles = [];
        const confettiColors = ['#f472b6', '#c084fc', '#818cf8', '#60a5fa', '#34d399', '#a3e635', '#facc15'];

        function startGame() {
            // Reset game state
            [firstCard, secondCard, timer] = [null, null, null];
            [isBoardLocked, moves, matchedPairs, elapsedTime] = [false, 0, 0, 0];
            
            // Reset UI
            movesCountEl.textContent = '0';
            timerEl.textContent = '00:00';
            winModal.classList.add('hidden');
            
            createBoard();
        }

        function createBoard() {
            gameBoard.innerHTML = '';
            const cardValues = shuffle([...cardEmojis, ...cardEmojis]);
            cardValues.forEach(value => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.dataset.value = value;
                cardElement.innerHTML = `<div class="back"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg></div><div class="front">${value}</div>`;
                cardElement.addEventListener('click', handleCardClick);
                gameBoard.appendChild(cardElement);
            });
        }

        function handleCardClick(event) {
            const clickedCard = event.currentTarget;
            if (isBoardLocked || clickedCard === firstCard || clickedCard.classList.contains('matched')) return;
            if (!timer) startTimer();
            clickedCard.classList.add('flipped');
            if (!firstCard) firstCard = clickedCard;
            else { secondCard = clickedCard; isBoardLocked = true; incrementMoves(); checkForMatch(); }
        }

        function checkForMatch() {
            const isMatch = firstCard.dataset.value === secondCard.dataset.value;
            isMatch ? disableMatchedCards() : unflipMismatchedCards();
        }

        function disableMatchedCards() {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            matchedPairs++;
            triggerConfetti(25); // Celebration for a correct pair!
            if (matchedPairs === cardEmojis.length) endGame();
            resetTurn();
        }

        function unflipMismatchedCards() {
            setTimeout(() => { firstCard.classList.remove('flipped'); secondCard.classList.remove('flipped'); resetTurn(); }, 1000);
        }

        function resetTurn() { [firstCard, secondCard, isBoardLocked] = [null, null, false]; }
        function incrementMoves() { moves++; movesCountEl.textContent = moves; }
        function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

        // --- High-Precision Timer ---
        function startTimer() {
            startTime = Date.now() - elapsedTime;
            timer = requestAnimationFrame(updateTimer);
        }

        function stopTimer() {
            cancelAnimationFrame(timer);
        }

        function updateTimer() {
            elapsedTime = Date.now() - startTime;
            const seconds = Math.floor(elapsedTime / 1000);
            const milliseconds = Math.floor((elapsedTime % 1000) / 10); // Get two digits for ms
            timerEl.textContent = `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
            timer = requestAnimationFrame(updateTimer);
        }

        function endGame() {
            stopTimer();
            const finalTime = timerEl.textContent;
            finalMovesEl.textContent = `${moves} Moves`;
            finalTimeEl.textContent = finalTime;
            triggerConfetti(200); // Big celebration for winning!
            setTimeout(() => winModal.classList.remove('hidden'), 500);
        }

        // --- Confetti Celebration System ---
        function setupConfettiCanvas() { confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
        class ConfettiParticle {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.size = Math.random() * 7 + 3;
                this.weight = Math.random() * 2 + 1;
                this.angle = Math.random() * 360;
                this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                this.velocity = { x: Math.sin(this.angle * Math.PI / 180) * (Math.random() * 6 + 2), y: Math.cos(this.angle * Math.PI / 180) * (Math.random() * 6 + 2) };
                this.alpha = 1;
            }
            update() {
                this.y += this.velocity.y + this.weight;
                this.x += this.velocity.x;
                this.alpha -= 0.02;
            }
            draw() {
                confettiCtx.globalAlpha = this.alpha;
                confettiCtx.fillStyle = this.color;
                confettiCtx.beginPath();
                confettiCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                confettiCtx.fill();
            }
        }

        function triggerConfetti(amount) {
            for (let i = 0; i < amount; i++) {
                confettiParticles.push(new ConfettiParticle(confettiCanvas.width / 2, confettiCanvas.height / 2));
            }
        }

        function animateConfetti() {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiParticles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.alpha <= 0) confettiParticles.splice(index, 1);
            });
            requestAnimationFrame(animateConfetti);
        }

        // --- Event Listeners & Initial Setup ---
        window.addEventListener('resize', setupConfettiCanvas);
        playAgainBtn.addEventListener('click', startGame);
        
        setupConfettiCanvas();
        animateConfetti();
        startGame();
    }
});
