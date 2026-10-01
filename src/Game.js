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
            // ▼ 改行(\n)を追加して美しく2行に配置
            this.showMessage('ウソなのわかってるから\nおとなしく「いいえ」を選べってw', 'retry');
        } else {
            // ▼ 綺麗なバランスで2行に配置
            this.showMessage('いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww', 'start_game');
        }
    }

    showMessage(text, nextAction) {
        this.messageText.innerText = text;
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