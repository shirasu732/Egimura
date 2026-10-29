// 画像背景の書き方（中央に合わせて画面いっぱいに表示）
const img = (file) => `url("images/${file}") center / cover no-repeat #000`;

// シーンごとの背景
const BG = {
    title: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",   // タイトル
    question: img("bg_question.jpg"),                               // 質問（夜の住宅街）
    god: img("bg_god.jpg"),                                         // 女神空間
    room: img("bg_room.jpg")                                        // 新しい部屋
};

// 画像を先に読み込んでおき、切り替え時のちらつきを防ぐ
["bg_question.jpg", "bg_god.jpg", "bg_room.jpg"].forEach((file) => {
    new Image().src = `images/${file}`;
});

// オープニングの会話データ
// bg: 背景 / center: 中央の赤枠表示 / eyelid: 表示前にまぶたが開く演出を入れる
// 会話を増やすときはここに1行足すだけでOK
const OPENING = [
    { bg: "question", center: false, text: "いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww" },
    { bg: "question", center: true, text: "あまりに鋭いちくちく言葉が心に刺さったことが致命傷となり、俺の意識は暗闇へと沈んでいった。" },
    { bg: "god", center: true, text: "???「………………ふむ。これはまた、随分と珍妙な死に方をしたものじゃな」" },
    { bg: "god", center: true, text: "主人公「………………誰?」" },
    { bg: "god", center: true, text: "女神「妾は恋愛を司る女神じゃ」\n女神「しかし、恋人ができぬと言われた程度で死ぬとは･･････くくっ、愉快な奴よ」" },
    { bg: "god", center: true, text: "主人公「笑い事じゃないんだけど!?」" },
    { bg: "god", center: true, text: "女神「しかも恋愛経験は皆無、と。･･････なるほど、哀れじゃな」" },
    { bg: "god", center: true, text: "主人公「追い打ちかけるのやめてくれる? もう一回死ぬよ?」" },
    { bg: "god", center: true, text: "女神「ふむ…………･･よし、決めた。お前にもう一度、青春をくれてやろう」" },
    { bg: "god", center: true, text: "主人公「･･････は?」" },
    { bg: "god", center: true, text: "女神「高校二年生、転入生。始業式は明日じゃ。住む場所も生活の面倒も見てやる」" },
    { bg: "god", center: true, text: "主人公「いや、勝手に決めるなって!」" },
    { bg: "god", center: true, text: "女神「なに、難しいことはない。今度こそ恋人の一人でも作ってみせよ」" },
    { bg: "god", center: true, text: "主人公「だから話を――」" },
    { bg: "god", center: true, text: "女神「では、妾を退屈させるでないぞ?」" },
    { bg: "room", center: false, eyelid: true, text: "目が覚めると見知らぬ天井が目に映る。\nどうやら、本当に転生したらしい。" },
    { bg: "room", center: false, text: "机の上には、学生証と転入手続きの書類。\nそして荷解き途中と思しき段ボールの山。" },
    { bg: "room", center: false, text: "高校二年生、明日から転入･･･ 。\nあの女神、言っていたことは本当だったのか。" },
    { bg: "room", center: false, text: "玄関には、引っ越しの挨拶用らしい菓子折りが置かれている。\nその上には一枚のメモ。" },
    { bg: "room", center: false, text: "『近所への挨拶くらいはしておけ。人付き合いは恋愛の基本じゃぞ』" },
    { bg: "room", center: false, text: "『追伸:まあ、お前には難しいかもしれぬがな』" },
    { bg: "room", center: false, text: "主人公「………………最後まで余計なお世話だ!」" },
    { bg: "room", center: false, text: "とはいえ、これから暮らす場所だ。\n挨拶くらいはしておこう。" }
];

export class Game {
    constructor() {
        this.SAVE_KEY = "koiiro_palette_save";
        this.VOLUME_KEY = "koiiro_palette_volume";

        // 内部音量倍率（0.5 = スライダー値の半分の音量で鳴らす）
        this.bgmFactor = 0.5;

        this.playerName = "";

        // 進行状態: "retry" / "opening" / "start_game"
        this.nextAction = "";
        this.openingIndex = 0;
        this.isAnimating = false;

        const $ = (id) => document.getElementById(id);

        // 画面レイヤー
        this.backgroundLayer = $("background-layer");
        this.titleLayer = $("title-layer");
        this.nameInputLayer = $("name-input-layer");
        this.questionLayer = $("question-layer");
        this.messageLayer = $("message-layer");
        this.eyelidLayer = $("eyelid-layer");

        // 要素
        this.messageBox = $("message-box");
        this.messageText = $("message-text");
        this.questionText = $("question-text");
        this.playerNameInput = $("player-name-input");
        this.btnNameSubmit = $("btn-name-submit");
        this.btnStart = $("btn-start");
        this.btnLoad = $("btn-load");
        this.btnExit = $("btn-exit");
        this.btnYes = $("btn-yes");
        this.btnNo = $("btn-no");
        this.volumeSlider = $("volume-slider");
        this.volumeValueText = $("volume-value");
        this.bgmTitle = $("bgm-title");
        this.bgmMain = $("bgm-main");
        this.bgm = this.bgmTitle;   // 今鳴らしているBGM

        // 音量設定の読み込み
        const savedVolume = localStorage.getItem(this.VOLUME_KEY);
        this.currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.1;
        this.applyVolume();

        this.initEvents();
        this.initVolumeUI();
        this.setBackground("title");
    }

    // 背景を切り替える
    setBackground(name) {
        this.backgroundLayer.style.background = BG[name];
    }

    // 実際の音量を適用
    applyVolume() {
        const vol = this.currentVolume * this.bgmFactor;
        this.bgmTitle.volume = vol;
        this.bgmMain.volume = vol;
    }

    // イベント登録
    initEvents() {
        // 最初の操作でBGMを開始（ブラウザの自動再生制限対策）
        document.addEventListener("pointerdown", () => this.startBGM());

        this.btnStart.addEventListener("click", () => this.showNameInputScreen());
        this.btnLoad.addEventListener("click", () => this.loadGame());
        this.btnExit.addEventListener("click", () => this.exitGame());

        this.btnNameSubmit.addEventListener("click", () => this.submitPlayerName());
        this.playerNameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.isComposing) this.submitPlayerName();
        });

        this.btnYes.addEventListener("click", () => this.handleAnswer(true));
        this.btnNo.addEventListener("click", () => this.handleAnswer(false));

        this.messageBox.addEventListener("click", () => this.handleNextMessage());
    }

    // 音量スライダーの初期化
    initVolumeUI() {
        this.volumeSlider.value = this.currentVolume;
        this.volumeValueText.innerText = `${Math.round(this.currentVolume * 100)}%`;
        this.volumeSlider.addEventListener("input", (e) => {
            this.setVolume(parseFloat(e.target.value));
        });
    }

    setVolume(vol) {
        this.currentVolume = vol;
        this.applyVolume();
        this.volumeValueText.innerText = `${Math.round(vol * 100)}%`;
        localStorage.setItem(this.VOLUME_KEY, vol);
    }

    startBGM() {
        if (this.bgm.paused) {
            this.bgm.play().catch(() => { /* 操作待ち */ });
        }
    }

    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
    }

    // 本編BGMに切り替え（タイトル曲は止める）
    switchToMainBGM() {
        if (this.bgm === this.bgmMain) return;
        this.stopBGM();
        this.bgm = this.bgmMain;
        this.startBGM();
    }

    // 全レイヤー非表示
    hideAllLayers() {
        this.titleLayer.style.display = "none";
        this.nameInputLayer.style.display = "none";
        this.questionLayer.style.display = "none";
        this.messageLayer.style.display = "none";
        this.eyelidLayer.style.display = "none";
    }

    // 名前入力画面
    showNameInputScreen() {
        this.switchToMainBGM();
        this.hideAllLayers();
        this.setBackground("title");
        this.playerNameInput.value = "";
        this.nameInputLayer.style.display = "flex";
        this.playerNameInput.focus();
    }

    submitPlayerName() {
        const inputVal = this.playerNameInput.value.trim();
        if (inputVal !== "") {
            this.playerName = inputVal;
        }
        this.showQuestion();
    }

    // 質問画面
    showQuestion() {
        this.hideAllLayers();
        this.setBackground("question");
        this.questionText.innerText = `${this.playerName}には彼女がいますか？`;
        this.questionLayer.style.display = "flex";
    }

    // メッセージ表示
    showMessage(text, actionType, isCenter = false) {
        this.hideAllLayers();
        this.messageText.innerText = text;
        this.messageLayer.classList.toggle("center-mode", isCenter);
        this.messageLayer.style.display = "flex";
        this.nextAction = actionType;
    }

    // 選択肢分岐
    handleAnswer(hasGirlfriend) {
        if (hasGirlfriend) {
            this.setBackground("question");
            this.showMessage("ウソなのわかってるから\nおとなしく「いいえ」を選べってw", "retry", true);
        } else {
            this.saveGame({ playerName: this.playerName, hasGirlfriend: false, sceneId: "オープニング開始" });
            this.openingIndex = 0;
            this.showOpeningLine();
        }
    }

    // オープニングの現在の行を表示
    showOpeningLine() {
        const line = OPENING[this.openingIndex];
        const show = () => {
            this.setBackground(line.bg);
            this.showMessage(line.text, "opening", line.center);
        };
        if (line.eyelid) {
            this.setBackground(line.bg);
            this.playEyelidOpenAnimation(show);
        } else {
            show();
        }
    }

    // メッセージ進行
    handleNextMessage() {
        if (this.isAnimating) return;

        if (this.nextAction === "retry") {
            this.showQuestion();
        } else if (this.nextAction === "opening") {
            this.openingIndex++;
            if (this.openingIndex < OPENING.length) {
                this.showOpeningLine();
            } else {
                this.startMainGame();
            }
        } else if (this.nextAction === "start_game") {
            this.startMainGame();
        }
    }

    // 本編開始（未実装）
    startMainGame() {
        this.hideAllLayers();
        console.log("ゲーム本編を開始します");
    }

    // まぶたが開く演出
    playEyelidOpenAnimation(callback) {
        this.isAnimating = true;
        this.hideAllLayers();
        this.eyelidLayer.style.display = "block";
        this.eyelidLayer.classList.remove("open");

        setTimeout(() => this.eyelidLayer.classList.add("open"), 200);
        setTimeout(() => {
            this.eyelidLayer.style.display = "none";
            this.eyelidLayer.classList.remove("open");
            this.isAnimating = false;
            callback();
        }, 1700);
    }

    // セーブの有無で「つづきから」を有効/無効化
    checkSaveData() {
        this.btnLoad.disabled = !localStorage.getItem(this.SAVE_KEY);
    }

    saveGame(state) {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(state));
        this.checkSaveData();
    }

    loadGame() {
        const data = localStorage.getItem(this.SAVE_KEY);
        if (!data) return;
        this.switchToMainBGM();
        const saveData = JSON.parse(data);
        if (saveData.playerName) {
            this.playerName = saveData.playerName;
        }
        this.setBackground("room");
        this.showMessage(`セーブデータを読み込みました。\n（プレイヤー: ${this.playerName}）`, "start_game", false);
    }

    exitGame() {
        if (confirm("ゲームを終了しますか？")) {
            this.stopBGM();
            this.titleLayer.innerHTML = "<h2 style='color: white;'>プレイありがとうございました！<br>タブを閉じて終了してください。</h2>";
        }
    }

    start() {
        this.checkSaveData();
        console.log("『恋色パレット』が起動しました。");
    }
}
