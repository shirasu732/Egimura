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
            title: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", // タイトル
            question: "linear-gradient(135deg, #2c3e50, #3498db)",       // 質問
            god: "linear-gradient(135deg, #4b0082, #800080, #dda0dd)",    // 女神空間：神秘的な紫・光
            room: "linear-gradient(135deg, #7f8c8d, #bdc3c7, #2c3e50)"   // 新しい部屋
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

        // ダイスUIの取得（必要に応じて保持）
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
            this.saveGame({ playerName: this.playerName, hasGirlfriend: false, sceneId: "オープニング開始" });
            this.setBackground(this.BG_GRADIENTS.question);
            this.showMessage("いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww", "op_step_1", false);
        }
    }

    // メッセージ進行処理
    handleNextMessage() {
        if (this.nextAction === "retry") {
            this.showQuestion();
        } else if (this.nextAction === "op_step_1") {
            this.setBackground(this.BG_GRADIENTS.question);
            this.showMessage("あまりに鋭いちくちく言葉が心に刺さったことが致命傷となり、俺の意識は暗闇へと沈んでいった。", "op_step_2", true);
        } else if (this.nextAction === "op_step_2") {
            this.setBackground(this.BG_GRADIENTS.god);
            this.showMessage("???「………………ふむ。これはまた、随分と珍妙な死に方をしたものじゃな」", "op_step_3", true);
        } else if (this.nextAction === "op_step_3") {
            this.showMessage("主人公「………………誰?」", "op_step_4", true);
        } else if (this.nextAction === "op_step_4") {
            this.showMessage("女神「妾は恋愛を司る女神じゃ」\n女神「しかし、恋人ができぬと言われた程度で死ぬとは･･････くくっ、愉快な奴よ」", "op_step_5", true);
        } else if (this.nextAction === "op_step_5") {
            this.showMessage("主人公「笑い事じゃないんだけど!?」", "op_step_6", true);
        } else if (this.nextAction === "op_step_6") {
            this.showMessage("女神「しかも恋愛経験は皆無、と。･･････なるほど、哀れじゃな」", "op_step_7", true);
        } else if (this.nextAction === "op_step_7") {
            this.showMessage("主人公「追い打ちかけるのやめてくれる? もう一回死ぬよ?」", "op_step_8", true);
        } else if (this.nextAction === "op_step_8") {
            this.showMessage("女神「ふむ…………･･よし、決めた。お前にもう一度、青春をくれてやろう」", "op_step_9", true);
        } else if (this.nextAction === "op_step_9") {
            this.showMessage("主人公「･･････は?」", "op_step_10", true);
        } else if (this.nextAction === "op_step_10") {
            this.showMessage("女神「高校二年生、転入生。始業式は明日じゃ。住む場所も生活の面倒も見てやる」", "op_step_11", true);
        } else if (this.nextAction === "op_step_11") {
            this.showMessage("主人公「いや、勝手に決めるなって!」", "op_step_12", true);
        } else if (this.nextAction === "op_step_12") {
            this.showMessage("女神「なに、難しいことはない。今度こそ恋人の一人でも作ってみせよ」", "op_step_13", true);
        } else if (this.nextAction === "op_step_13") {
            this.showMessage("主人公「だから話を――」", "op_step_14", true);
        } else if (this.nextAction === "op_step_14") {
            this.showMessage("女神「では、妾を退屈させるでないぞ?」", "op_eyelid_open", true);
        } else if (this.nextAction === "op_eyelid_open") {
            // まぶたを開くアニメーション演出をはさんで新しい部屋へ
            this.setBackground(this.BG_GRADIENTS.room);
            this.playEyelidOpenAnimation(() => {
                this.showMessage("目が覚めると見知らぬ天井が目に映る。\nどうやら、本当に転生したらしい。", "op_step_15", false);
            });
        } else if (this.nextAction === "op_step_15") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("机の上には、学生証と転入手続きの書類。\nそして荷解き途中と思しき段ボールの山。", "op_step_16", false);
        } else if (this.nextAction === "op_step_16") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("高校二年生、明日から転入･･･ 。\nあの女神、言っていたことは本当だったのか。", "op_step_17", false);
        } else if (this.nextAction === "op_step_17") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("玄関には、引っ越しの挨拶用らしい菓子折りが置かれている。\nその上には一枚のメモ。", "op_step_18", false);
        } else if (this.nextAction === "op_step_18") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("『近所への挨拶くらいはしておけ。人付き合いは恋愛の基本じゃぞ』", "op_step_19", false);
        } else if (this.nextAction === "op_step_19") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("『追伸:まあ、お前には難しいかもしれぬがな』", "op_step_20", false);
        } else if (this.nextAction === "op_step_20") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("主人公「………………最後まで余計なお世話だ!」", "op_step_21", false);
        } else if (this.nextAction === "op_step_21") {
            this.setBackground(this.BG_GRADIENTS.room);
            this.showMessage("とはいえ、これから暮らす場所だ。\n挨拶くらいはしておこう。", "start_game", false);
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