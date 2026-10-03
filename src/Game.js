export class Game {
    constructor() {
        this.SAVE_KEY = "koiiro_palette_save";

        // UI層・要素の取得
        this.titleLayer = document.getElementById("title-layer");
        this.questionLayer = document.getElementById("question-layer");
        this.messageLayer = document.getElementById("message-layer");
        this.messageText = document.getElementById("message-text");
        this.messageBox = document.getElementById("message-box");

        // ボタンの取得
        this.btnStart = document.getElementById("btn-start");
        this.btnLoad = document.getElementById("btn-load");
        this.btnExit = document.getElementById("btn-exit");
        this.btnYes = document.getElementById("btn-yes");
        this.btnNo = document.getElementById("btn-no");

        // キャンバスの取得
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

        this.nextAction = "";

        this.initEvents();
        this.resizeCanvas();
    }

    // イベントリスナーの一括登録
    initEvents() {
        window.addEventListener("resize", () => this.resizeCanvas());

        // タイトル画面のボタン操作
        this.btnStart.addEventListener("click", () => this.showQuestion());
        this.btnLoad.addEventListener("click", () => this.loadGame());
        this.btnExit.addEventListener("click", () => this.exitGame());

        // 質問画面のボタン操作
        this.btnYes.addEventListener("click", () => this.handleAnswer(true));
        this.btnNo.addEventListener("click", () => this.handleAnswer(false));

        // メッセージボックスのクリック操作
        this.messageBox.addEventListener("click", () => this.handleNextMessage());
    }

    // キャンバスのリサイズ対応
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.draw();
        }
    }

    // 描画処理（背景など）
    draw() {
        if (this.ctx) {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // すべてのUIレイヤーを非表示にする
    hideAllLayers() {
        this.titleLayer.style.display = "none";
        this.questionLayer.style.display = "none";
        this.messageLayer.style.display = "none";
    }

    // 質問画面を表示
    showQuestion() {
        this.hideAllLayers();
        this.questionLayer.style.display = "flex";
    }

    // メッセージ画面を表示（第3引数で中央表示の切替）
    showMessage(text, actionType, isCenter = false) {
        this.hideAllLayers();
        this.messageText.innerText = text;

        if (isCenter) {
            this.messageLayer.classList.add("center-mode");
        } else {
            this.messageLayer.classList.remove("center-mode");
        }

        this.messageLayer.style.display = "flex";
        this.nextAction = actionType;
    }

    // 「はい / いいえ」の選択処理
    handleAnswer(hasGirlfriend) {
        if (hasGirlfriend) {
            // 「はい」：画面中央に超巨大文字で表示 ➔ 質問画面に戻る動作
            this.showMessage("ウソなのわかってるから\nおとなしく「いいえ」を選べってw", "retry", true);
        } else {
            // 「いいえ」：進行データを保存し ➔ 本編へ移行する動作
            this.saveGame({ hasGirlfriend: false, sceneId: "本編開始" });
            this.showMessage("いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww", "start_game", false);
        }
    }

    // メッセージクリック後の分岐処理
    handleNextMessage() {
        if (this.nextAction === "retry") {
            this.showQuestion();
        } else if (this.nextAction === "start_game") {
            this.hideAllLayers();
            console.log("ゲーム本編を開始します");
        }
    }

    // セーブデータの確認
    checkSaveData() {
        const data = localStorage.getItem(this.SAVE_KEY);
        if (this.btnLoad) {
            this.btnLoad.disabled = !data;
        }
    }

    // セーブ保存
    saveGame(state) {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(state));
        this.checkSaveData();
    }

    // セーブロード
    loadGame() {
        const data = localStorage.getItem(this.SAVE_KEY);
        if (data) {
            const saveData = JSON.parse(data);
            this.showMessage(`セーブデータを読み込みました。\n（場面: ${saveData.sceneId || "本編"}）`, "start_game", false);
        }
    }

    // ゲーム終了処理
    exitGame() {
        if (confirm("ゲームを終了しますか？")) {
            this.titleLayer.innerHTML = "<h2 style='color: white;'>プレイありがとうございました！<br>タブを閉じて終了してください。</h2>";
        }
    }

    // ゲーム起動
    start() {
        this.checkSaveData();
        console.log("『恋色パレット』が起動しました。");
    }
}