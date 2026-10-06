export class Game {
    constructor() {
        this.SAVE_KEY = "koiiro_palette_save";
        this.VOLUME_KEY = "koiiro_palette_volume";

        // ★【内部音量倍率】コード側で実際の音量をさらに絞る設定（0.5 = さらに半分）
        // もっと小さくしたい場合は 0.3 や 0.2 に変更してください。
        this.bgmFactor = 0.5;

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

        // BGM要素の取得
        this.bgm = document.getElementById("bgm-title");

        // 音量設定の読み込み（保存値がなければデフォルト 0.1 = 10%）
        const savedVolume = localStorage.getItem(this.VOLUME_KEY);
        this.currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.1;
        
        // 内部倍率を反映して音量を適用
        this.applyVolume();

        this.nextAction = "";

        this.initEvents();
        this.initVolumeUI();
        this.resizeCanvas();
    }

    // 実際に鳴らす音量の適用処理（UI音量 × 内部倍率）
    applyVolume() {
        if (this.bgm) {
            // 例: UIが0.1(10%)で bgmFactorが0.5なら、実際の再生音量は 0.05(5%) になります
            this.bgm.volume = this.currentVolume * this.bgmFactor;
        }
    }

    // イベント登録
    initEvents() {
        window.addEventListener("resize", () => this.resizeCanvas());

        // 画面のどこをクリック/タッチしてもBGM再生を試みる
        const tryPlayBgm = () => {
            this.startBGM();
        };
        document.addEventListener("click", tryPlayBgm);
        document.addEventListener("pointerdown", tryPlayBgm);

        // タイトルボタン操作
        this.btnStart.addEventListener("click", () => {
            this.startBGM();
            this.showQuestion();
        });
        this.btnLoad.addEventListener("click", () => {
            this.startBGM();
            this.loadGame();
        });
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
                this.startBGM();
            });
        }
    }

    // 音量設定処理
    setVolume(vol) {
        this.currentVolume = vol;
        this.applyVolume();
        if (this.volumeValueText) {
            this.volumeValueText.innerText = `${Math.round(vol * 100)}%`;
        }
        localStorage.setItem(this.VOLUME_KEY, vol);
    }

    // BGM再生
    startBGM() {
        if (this.bgm && this.bgm.paused) {
            this.bgm.play().then(() => {
                console.log("BGM再生成功");
            }).catch(err => {
                console.log("BGM自動再生ブロック（操作待ち）:", err);
            });
        }
    }

    // BGM停止
    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
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