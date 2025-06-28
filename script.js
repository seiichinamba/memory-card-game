class MemoryCardGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.gameStarted = false;
        this.gameInterval = null;
        
        // カードの絵文字（8ペア）
        this.cardSymbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.bindEvents();
        this.updateDisplay();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        // カードペアを作成してシャッフル
        const cardData = [...this.cardSymbols, ...this.cardSymbols];
        this.shuffleArray(cardData);
        
        this.cards = cardData.map((symbol, index) => {
            const card = {
                id: index,
                symbol: symbol,
                isFlipped: false,
                isMatched: false,
                element: this.createCardElement(symbol, index)
            };
            
            gameBoard.appendChild(card.element);
            return card;
        });
    }
    
    createCardElement(symbol, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.cardId = index;
        
        cardElement.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">${symbol}</div>
        `;
        
        cardElement.addEventListener('click', () => this.handleCardClick(index));
        
        return cardElement;
    }
    
    handleCardClick(cardId) {
        const card = this.cards[cardId];
        
        // 既にめくられているか、マッチ済みの場合は無視
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }
        
        // ゲーム開始
        if (!this.gameStarted) {
            this.startGame();
        }
        
        // カードをめくる
        this.flipCard(card);
        
        // 2枚めくられた場合の処理
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    flipCard(card) {
        card.isFlipped = true;
        card.element.classList.add('flipped');
        this.flippedCards.push(card);
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // マッチした場合
            this.handleMatch(card1, card2);
        } else {
            // マッチしなかった場合
            this.handleMismatch(card1, card2);
        }
        
        this.flippedCards = [];
    }
    
    handleMatch(card1, card2) {
        card1.isMatched = true;
        card2.isMatched = true;
        
        // 正解したカードは必ず表面（flipped状態）を維持
        card1.isFlipped = true;
        card2.isFlipped = true;
        card1.element.classList.add('flipped');
        card2.element.classList.add('flipped');
        
        // マッチしたクラスを追加
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        this.matchedPairs++;
        this.updateDisplay();
        
        // 全てマッチした場合
        if (this.matchedPairs === this.cardSymbols.length) {
            setTimeout(() => {
                this.endGame();
            }, 500);
        }
    }
    
    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.isFlipped = false;
            card2.isFlipped = false;
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }, 500);
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    
    endGame() {
        clearInterval(this.gameInterval);
        this.showWinModal();
    }
    
    showWinModal() {
        const modal = document.getElementById('winModal');
        const finalMoves = document.getElementById('finalMoves');
        const finalTime = document.getElementById('finalTime');
        
        finalMoves.textContent = this.moves;
        finalTime.textContent = this.formatTime(this.timer);
        
        modal.classList.add('show');
    }
    
    hideWinModal() {
        const modal = document.getElementById('winModal');
        modal.classList.remove('show');
    }
    
    resetGame() {
        // ゲーム状態をリセット
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.gameStarted = false;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        // ボードを再作成
        this.createBoard();
        this.updateDisplay();
        this.hideWinModal();
    }
    
    showHint() {
        if (this.flippedCards.length > 0 || !this.gameStarted) {
            return;
        }
        
        // マッチしていないカードからランダムに1枚選んでヒント表示
        const unmatched = this.cards.filter(card => !card.isMatched);
        if (unmatched.length > 0) {
            const randomCard = unmatched[Math.floor(Math.random() * unmatched.length)];
            randomCard.element.classList.add('hint');
            
            setTimeout(() => {
                randomCard.element.classList.remove('hint');
            }, 1000);
        }
    }
    
    updateDisplay() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('timer').textContent = this.formatTime(this.timer);
        document.getElementById('pairs').textContent = `${this.matchedPairs}/${this.cardSymbols.length}`;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    bindEvents() {
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // モーダルの外側をクリックで閉じる
        document.getElementById('winModal').addEventListener('click', (e) => {
            if (e.target.id === 'winModal') {
                this.hideWinModal();
            }
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'r':
                case 'R':
                    this.resetGame();
                    break;
                case 'h':
                case 'H':
                    this.showHint();
                    break;
            }
        });
    }
    
    
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new MemoryCardGame();
}); 