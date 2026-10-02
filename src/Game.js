export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.uiLayer = document.getElementById('ui-layer');
        this.btnYes = document.getElementById('btn-yes');
        this.btnNo = document.getElementById('btn-no');

        this.messageLayer = document.getElementById('message-layer');
        this.messageText = document.getElementById('message-text');
        this.messageBox = document.getElementById('message-box');

        this.nextAction = '';

        this.initEvents();
        this.resizeCanvas();
    }

    initEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        this.btnYes.addEventListener('click', () => {
            this.handleAnswer('はい');
        });

        this.btnNo.addEventListener('click', () => {
            this.handleAnswer('いいえ');
        });

        this.messageBox.addEventListener('click', () => {
            this.handleNextMessage();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.draw();
    }

    handleAnswer(answer) {
        this.uiLayer.style.display = 'none';

        if (answer === 'はい') {
            // 「はい」：画面中央(第3引数を true)に超巨大文字で表示
            this.showMessage('ウソなのわかってるから\nおとなしく「いいえ」を選べってw', 'retry', true);
        } else {
            // 「いいえ」：画面下部(第3引数を false)に表示
            this.showMessage('いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww', 'start_game', false);
        }
    }

    // 第3引数(isCenter)で中央表示かどうかを判定
    showMessage(text, nextAction, isCenter = false) {
        this.messageText.innerText = text;

        if (isCenter) {
            this.messageLayer.classList.add('center-mode'); // 中央表示にする
        } else {
            this.messageLayer.classList.remove('center-mode'); // 下部表示に戻す
        }

        this.messageLayer.style.display = 'flex';
        this.nextAction = nextAction; 
    }

    handleNextMessage() {
        this.messageLayer.style.display = 'none';

        if (this.nextAction === 'retry') {
            this.uiLayer.style.display = 'flex';
        } else if (this.nextAction === 'start_game') {
            console.log("ゲーム本編に移動します");
        }
    }

    draw() {
        this.ctx.fillStyle = '#87CEEB'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    start() {
        console.log("ゲームが起動しました。");
    }
}