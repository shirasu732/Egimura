export class Game {
    constructor() {
        this.SAVE_KEY = "koiiro_palette_save";
        this.VOLUME_KEY = "koiiro_palette_volume";

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

        // 音量調整UIの取得
        this.volumeSlider = document.getElementById("volume-slider");
        this.volumeValueText = document.getElementById("volume-value");

        // キャンバスの取得
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

        // BGM管理
        this.bgm = new Audio("audio/bgm_title.mp3");
        this.bgm.loop = true;
        this.isBgmStarted = false;

        // 音量設定の読み込み（保存値がなければデフォルト0.4）
        const savedVolume = localStorage.getItem(this.VOLUME_KEY);
        this.currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.4;
        this.bgm.volume = this.currentVolume;

        this.nextAction = "";

        this.initEvents();
        this.initVolumeUI();
        this.resizeCanvas();
    }

    // イベント登録
    initEvents() {
        window.addEventListener("resize", () => this.resizeCanvas());

        // 初回画面操作（クリック/タップ）時にタイトル画面でBGM再生開始
        const enableAudio = () => {
            this.startBGM();
            document.removeEventListener("pointerdown", enableAudio);
        };
        document.addEventListener("pointerdown", enableAudio);

        // タイトルボタン操作
        this.btnStart.addEventListener("click", () => this.showQuestion());
        this.btnLoad.addEventListener("click", () => this.loadGame());
        this.btnExit.addEventListener("click", () => this.exitGame());

        // 質問ボタン操作
        this.btnYes.addEventListener("click", () => this.handleAnswer(true));
        this.btnNo.addEventListener("click", () => this.handleAnswer(false));

        // メッセージボックス操作
        this.messageBox.addEventListener("click", () => this.handleNextMessage());
    }

    // 音量スライダーの初期化
    initVolumeUI() {
        if (this.volumeSlider && this.volumeValueText) {
            this.volumeSlider.value = this.currentVolume;
            this.volumeValueText.innerText = `${Math.round(this.currentVolume * 100)}%`;

            this.volumeSlider.addEventListener("input", (e) => {
                const vol = parseFloat(e.target.value);
                this.setVolume(vol);
            });
        }
    }

    // 音量設定処理
    setVolume(vol) {
        this.currentVolume = vol;
        this.bgm.volume = vol;
        if (this.volumeValueText) {
            this.volumeValueText.innerText = `${Math.round(vol * 100)}%`;
        }
        localStorage.setItem(this.VOLUME_KEY, vol);
    }

    // BGM再生
    startBGM() {
        if (!this.isBgmStarted) {
            this.bgm.play().then(() => {
                this.isBgmStarted = true;
            }).catch(err => {
                console.log("BGM自動再生の待機中:", err);
            });
        }
    }

    // BGM停止
    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
        this.isBgmStarted = false;
    }

    // キャンバス調整
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.draw();
        }
    }

    draw() {
        if (this.ctx) {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // レイヤー非表示
    hideAllLayers() {
        this.titleLayer.style.display = "none";
        this.questionLayer.style.display = "none";
        this.messageLayer.style.display = "none";
    }

    // 質問画面表示
    showQuestion() {
        this.hideAllLayers();
        this.questionLayer.style.display = "flex";
    }

    // メッセージ表示
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

    // 選択肢分岐
    handleAnswer(hasGirlfriend) {
        if (hasGirlfriend) {
            this.showMessage("ウソなのわかってるから\nおとなしく「いいえ」を選べってw", "retry", true);
        } else {
            this.saveGame({ hasGirlfriend: false, sceneId: "本編開始" });
            this.showMessage("いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww", "start_game", false);
        }
    }

    // メッセージ進行
    handleNextMessage() {
        if (this.nextAction === "retry") {
            this.showQuestion();
        } else if (this.nextAction === "start_game") {
            this.hideAllLayers();
            console.log("ゲーム本編を開始します");
        }
    }

    // セーブデータ確認
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

    // ゲーム終了
    exitGame() {
        if (confirm("ゲームを終了しますか？")) {
            this.stopBGM();
            this.titleLayer.innerHTML = "<h2 style='color: white;'>プレイありがとうございました！<br>タブを閉じて終了してください。</h2>";
        }
    }

    // 起動
    start() {
        this.checkSaveData();
        console.log("『恋色パレット』が起動しました。");
    }
}