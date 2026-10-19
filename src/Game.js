export class Game {
    constructor() {
        this.SAVE_KEY = "koiiro_palette_save";
        this.VOLUME_KEY = "koiiro_palette_volume";

        // 内部音量倍率（0.5 = さらに音量を半分にする）
        this.bgmFactor = 0.5;

        // プレイヤー名の初期値
        this.playerName = "";

        // シーンごとの背景グラデーション設定
        this.BG_GRADIENTS = {
            title: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", // タイトル：夜空の深み
            question: "linear-gradient(135deg, #2c3e50, #3498db)",       // 質問：日常のブルー
            dice: "linear-gradient(135deg, #4b0000, #1a0000, #000000)",   // ダイス：不気味な赤黒
            god: "linear-gradient(135deg, #f39c12, #e67e22, #ffffff)",    // 女神：神聖な黄金の光
            room: "linear-gradient(135deg, #7f8c8d, #bdc3c7, #2c3e50)"   // 新しい部屋：引っ越しの雰囲気
        };

        // UI層・要素の取得
        this.titleLayer = document.getElementById("title-layer");
        this.nameInputLayer = document.getElementById("name-input-layer");
        this.questionLayer = document.getElementById("question-layer");
        this.messageLayer = document.getElementById("message-layer");
        this.messageText = document.getElementById("message-text");
        this.messageBox = document.getElementById("message-box");
        this.backgroundLayer = document.getElementById("background-layer");

        // 名前入力UIの取得
        this.playerNameInput = document.getElementById("player-name-input");
        this.btnNameSubmit = document.getElementById("btn-name-submit");

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

        // 初期背景を設定
        this.setBackground(this.BG_GRADIENTS.title);
    }

    // 背景を設定するヘルパーメソッド
    setBackground(gradientStyle) {
        if (this.backgroundLayer) {
            this.backgroundLayer.style.background = gradientStyle;
        }
    }

    // Web Audio APIの初期化（初回のみ実行）
    initDiceAudioContext() {
        if (this.isAudioConnected || !this.seDice) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();

            const source = this.audioCtx.createMediaElementSource(this.seDice);
            this.seGainNode = this.audioCtx.createGain();
            this.seGainNode.gain.value = 3.0;

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

        const tryPlayBgm = () => {
            this.startBGM();
        };
        document.addEventListener("click", tryPlayBgm);
        document.addEventListener("pointerdown", tryPlayBgm);

        // タイトルボタン操作
        this.btnStart.addEventListener("click", () => {
            this.startBGM();
            this.showNameInputScreen();
        });
        this.btnLoad.addEventListener("click", () => {
            this.startBGM();
            this.loadGame();
        });
        this.btnExit.addEventListener("click", () => this.exitGame());

        // 名前決定ボタン操作
        this.btnNameSubmit.addEventListener("click", () => this.submitPlayerName());

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
        if (this.nameInputLayer) this.nameInputLayer.style.display = "none";
        this.questionLayer.style.display = "none";
        this.messageLayer.style.display = "none";
        if (this.diceLayer) this.diceLayer.style.display = "none";
        const eyelidLayer = document.getElementById("eyelid-layer");
        if (eyelidLayer) eyelidLayer.style.display = "none";
    }

    // 名前入力画面表示
    showNameInputScreen() {
        this.hideAllLayers();
        this.setBackground(this.BG_GRADIENTS.title);
        if (this.playerNameInput) {
            this.playerNameInput.value = "";
        }
        this.nameInputLayer.style.display = "flex";
    }

    // 名前の決定処理
    submitPlayerName() {
        const inputVal = this.playerNameInput.value.trim();
        if (inputVal !== "") {
            this.playerName = inputVal;
        }
        this.showQuestion();
    }

    // 質問画面表示（名前を反映）
    showQuestion() {
        this.hideAllLayers();
        this.setBackground(this.BG_GRADIENTS.question);
        const questionTextEl = document.getElementById("question-text");
        if (questionTextEl) {
            questionTextEl.innerText = `${this.playerName}には彼女がいますか？`;
        }
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
            this.setBackground(this.BG_GRADIENTS.question);
            this.showMessage("ウソなのわかってるから\nおとなしく「いいえ」を選べってw", "retry", true);
        } else {
            this.saveGame({ playerName: this.playerName, hasGirlfriend: false, sceneId: "SAN値チェック直前" });
            this.setBackground(this.BG_GRADIENTS.question);
            this.showMessage("いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww", "san_check_intro", false);
        }
    }

    // メッセージ進行処理
    handleNextMessage() {
        if (this.nextAction === "retry") {
            this.showQuestion();
        } else if (this.nextAction === "san_check_intro") {
            this.setBackground(this.BG_GRADIENTS.question);
            this.showMessage(`辛辣な言葉を浴びせられた${this.playerName}は1D100のSAN値チェックです`, "show_dice_screen", false);
        } else if (this.nextAction === "show_dice_screen") {
            this.showDiceScreen();
        } else if (this.nextAction === "angel_intro") {
            this.setBackground(this.BG_GRADIENTS.god);
            this.showMessage("次に目を覚ました時には、目の前に女神様が居た", "god_speech_1", true);
        } else if (this.nextAction === "god_speech_1") {
            this.setBackground(this.BG_GRADIENTS.god);
            this.showMessage(`おぉ${this.playerName}よww、恋の1つも知らずに死んでしまうとは...ww`, "god_speech_2", true);
        } else if (this.nextAction === "god_speech_2") {
            this.setBackground(this.BG_GRADIENTS.god);
            this.showMessage("そんなあなたにはもう一度チャンスをあげます", "god_speech_3", true);
        } else if (this.nextAction === "god_speech_3") {
            this.setBackground(this.BG_GRADIENTS.god);
            this.showMessage("さぁその後ろの扉を通るのです", "room_awake_1", true);
        } else if (this.nextAction === "room_awake_1") {
            this.setBackground(this.BG_GRADIENTS.god);
            this.showMessage("まばゆい光の向こう側へ足を踏み入れた瞬間、\n意識が暗転した――", "room_eyelid_open", true);
        } else if (this.nextAction === "room_eyelid_open") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.playEyelidOpenAnimation(() => {
                this.showMessage("…………\n……っ", "room_awake_3", true);
            });
        } else if (this.nextAction === "room_awake_3") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("見覚えのない天井。そして、山積みにされた段ボールの山。", "room_awake_4", false);
        } else if (this.nextAction === "room_awake_4") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("どうやら、引っ越し先の新しい部屋のようだ。\n荷物はすでにすべて運び込まれているらしい。", "room_awake_5", false);
        } else if (this.nextAction === "room_awake_5") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("スマホのカレンダーを確認する。\n……明日はいよいよ、記念すべき転校初日だった。", "start_game", false);
        } else if (this.nextAction === "start_game") {
            this.hideAllLayers();
            console.log("ゲーム本編を開始します");
        }
    }

    // まぶたがパカッと開くアニメーション演出
    playEyelidOpenAnimation(callback) {
        this.hideAllLayers();
        const eyelidLayer = document.getElementById("eyelid-layer");
        if (eyelidLayer) {
            eyelidLayer.style.display = "block";
            eyelidLayer.classList.remove("open");
            
            setTimeout(() => {
                eyelidLayer.classList.add("open");
            }, 200);

            setTimeout(() => {
                eyelidLayer.style.display = "none";
                eyelidLayer.classList.remove("open");
                if (callback) callback();
            }, 1700);
        } else {
            if (callback) callback();
        }
    }

    // SAN値チェック（ダイス）画面の表示
    showDiceScreen() {
        this.hideAllLayers();
        this.setBackground(this.BG_GRADIENTS.dice);
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

        this.initDiceAudioContext();
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }

        if (this.seDice) {
            this.seDice.currentTime = 0;
            this.seDice.play().catch(err => console.log("効果音再生エラー:", err));
        }

        const duration = 1800;
        const intervalTime = 40;

        const timer = setInterval(() => {
            const randomVal = Math.floor(Math.random() * 99) + 1;
            this.diceResult.innerText = randomVal;
        }, intervalTime);

        setTimeout(() => {
            clearInterval(timer);

            if (this.seDice) {
                this.seDice.pause();
                this.seDice.currentTime = 0;
            }

            this.diceResult.innerText = "100";
            this.diceResult.classList.add("fumble-effect", "shake");

            setTimeout(() => {
                this.btnRollDice.style.display = "none";
                this.btnDiceNext.style.display = "inline-block";
            }, 600);

        }, duration);
    }

    // ダイス決定後の処理
    handleAfterDice() {
        this.setBackground(this.BG_GRADIENTS.dice);
        this.showMessage(`${this.playerName}の正気は無くなった...`, "angel_intro", true);
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
            if (saveData.playerName) {
                this.playerName = saveData.playerName;
            }
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage(`セーブデータを読み込みました。\n（プレイヤー: ${this.playerName}）`, "start_game", false);
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