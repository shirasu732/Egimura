export class Game {
    constructor() {
        this.SAVE_KEY = "koiiro_palette_save";
        this.VOLUME_KEY = "koiiro_palette_volume";

        // 内部音量倍率（0.5 = さらに音量を半分にする）
        this.bgmFactor = 0.5;

        // UI層・要素の取得
        this.titleLayer = document.getElementById("title-layer");
        this.questionLayer = document.getElementById("question-layer");
        this.messageLayer = document.getElementById("message-layer");
        this.messageText = document.getElementById("message-text");
        this.messageBox = document.getElementById("message-box");

        // ダイスUIの取得
        this.diceLayer = document.getElementById("dice-layer");
        this.diceResult = document.getElementById("dice-result");
        this.btnRollDice = document.getElementById("btn-roll-dice");
        this.btnDiceNext = document.getElementById("btn-dice-next");

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

        // 音声要素の取得
        this.bgm = document.getElementById("bgm-title");
        this.seDice = document.getElementById("se-dice");

        // Web Audio API 用（重複接続防止フラグ）
        this.audioCtx = null;
        this.seGainNode = null;
        this.isAudioConnected = false;

        // 音量設定の読み込み
        const savedVolume = localStorage.getItem(this.VOLUME_KEY);
        this.currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.1;
        
        this.applyVolume();

        this.nextAction = "";

        this.initEvents();
        this.initVolumeUI();
        this.resizeCanvas();
    }

    // Web Audio APIの初期化（初回のみ実行）
    initDiceAudioContext() {
        if (this.isAudioConnected || !this.seDice) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();

            // 音源要素をWeb Audio APIに接続（1度だけ実行）
            const source = this.audioCtx.createMediaElementSource(this.seDice);
            this.seGainNode = this.audioCtx.createGain();

            // 音量を3倍（3.0）に設定
            this.seGainNode.gain.value = 1.0;

            source.connect(this.seGainNode);
            this.seGainNode.connect(this.audioCtx.destination);

            this.isAudioConnected = true;
        } catch (e) {
            console.warn("Web Audio API の初期化に失敗しました。通常再生に切り替えます:", e);
        }
    }

    // 実際の音量を適用
    applyVolume() {
        if (this.bgm) {
            this.bgm.volume = this.currentVolume * this.bgmFactor;
        }
    }

    // イベント登録
    initEvents() {
        window.addEventListener("resize", () => this.resizeCanvas());

        // タッチ/クリックでBGM再生
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

        // ダイス画面操作
        this.btnRollDice.addEventListener("click", () => this.rollDice());
        this.btnDiceNext.addEventListener("click", () => this.handleAfterDice());
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

    // 全レイヤー非表示
    hideAllLayers() {
        this.titleLayer.style.display = "none";
        this.questionLayer.style.display = "none";
        this.messageLayer.style.display = "none";
        if (this.diceLayer) this.diceLayer.style.display = "none";
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
            this.saveGame({ hasGirlfriend: false, sceneId: "SAN値チェック直前" });
            this.showMessage("いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww", "san_check_intro", false);
        }
    }

    // メッセージ進行処理
    handleNextMessage() {
        if (this.nextAction === "retry") {
            this.showQuestion();
        } else if (this.nextAction === "san_check_intro") {
            this.showMessage("辛辣な言葉を浴びせられたあなたは1D100のSAN値チェックです", "show_dice_screen", false);
        } else if (this.nextAction === "show_dice_screen") {
            this.showDiceScreen();
        } else if (this.nextAction === "angel_intro") {
            // ★ 「るるっかの正気は無くなった...」の次に表示
            this.showMessage("次に目を覚ました時には、目の前に天使が居た", "start_game", true);
        } else if (this.nextAction === "start_game") {
            this.hideAllLayers();
            console.log("ゲーム本編を開始します");
        }
    }

    // SAN値チェック（ダイス）画面の表示
    showDiceScreen() {
        this.hideAllLayers();
        this.diceLayer.style.display = "flex";
        this.diceResult.innerText = "??";
        this.diceResult.classList.remove("fumble-effect", "shake");
        this.btnRollDice.style.display = "inline-block";
        this.btnRollDice.disabled = false;
        this.btnDiceNext.style.display = "none";
    }

    // ダイス回転演出（効果音再生）
    rollDice() {
        this.btnRollDice.disabled = true;

        // Web Audio APIの初期化
        this.initDiceAudioContext();
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }

        // ダイス効果音の再生
        if (this.seDice) {
            this.seDice.currentTime = 0;
            this.seDice.play().catch(err => console.log("効果音再生エラー:", err));
        }

        const duration = 1800; // 回転時間（1.8秒）
        const intervalTime = 40; // 40ミリ秒ごとに数字更新

        // ランダムに数字が変わるパラパラアニメーション
        const timer = setInterval(() => {
            const randomVal = Math.floor(Math.random() * 99) + 1;
            this.diceResult.innerText = randomVal;
        }, intervalTime);

        // 指定時間後に100で停止
        setTimeout(() => {
            clearInterval(timer);

            // 効果音を停止
            if (this.seDice) {
                this.seDice.pause();
                this.seDice.currentTime = 0;
            }

            // 必ず100に固定
            this.diceResult.innerText = "100";
            
            // 赤発光＆画面シェイクの演出クラスを追加
            this.diceResult.classList.add("fumble-effect", "shake");

            // 0.6秒後に「次へ」ボタンを表示
            setTimeout(() => {
                this.btnRollDice.style.display = "none";
                this.btnDiceNext.style.display = "inline-block";
            }, 600);

        }, duration);
    }

    // ダイス決定後の処理
    handleAfterDice() {
        // 次のアクションを "angel_intro" に設定
        this.showMessage("るるっかの正気は無くなった...", "angel_intro", true);
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