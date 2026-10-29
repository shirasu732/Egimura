// ============================================================
//  ゲーム全体のまとめ役：画面の流れと操作の受け付け
//  細かい処理は src/engine/ 以下のファイルに分けている
// ============================================================
import { BgmPlayer } from "./engine/BgmPlayer.js";
import { Stage } from "./engine/Stage.js";
import { TextBox } from "./engine/TextBox.js";
import { Story } from "./engine/Story.js";
import { loadConfig, hasAnySave } from "./engine/Storage.js";
import { Backlog } from "./engine/ui/Backlog.js";
import { SaveMenu } from "./engine/ui/SaveMenu.js";
import { ConfigMenu } from "./engine/ui/ConfigMenu.js";
import { initOverlays, isOverlayOpen, closeTopOverlay, confirmDialog } from "./engine/ui/Overlay.js";

const $ = (id) => document.getElementById(id);

export class Game {
    constructor() {
        this.mode = "title";     // title / name / question / story / end
        this.playerName = "";
        this.config = loadConfig();

        this.bgm = new BgmPlayer({ title: $("bgm-title"), main: $("bgm-main") });
        this.bgm.setVolume(this.config.volume);
        this.stage = new Stage(this.config);
        this.textBox = new TextBox(this.config);
        this.backlog = new Backlog();
        this.story = new Story({
            stage: this.stage,
            textBox: this.textBox,
            backlog: this.backlog,
            getName: () => this.playerName || "主人公",
            onEnd: () => this.showEnd()
        });
        this.saveMenu = new SaveMenu({
            getSaveData: () => ({ ...this.story.getSaveData(), playerName: this.playerName }),
            onLoad: (data) => this.loadGame(data),
            isPlaying: () => this.mode === "story"
        });
        this.configMenu = new ConfigMenu(this.config, (v) => this.bgm.setVolume(v));

        this.screens = { title: $("title-layer"), name: $("name-input-layer"), question: $("question-layer"), end: $("end-layer") };
        initOverlays();
        this.bindEvents();
    }

    start() {
        this.showTitle();
        console.log("『恋色パレット』が起動しました。");
    }

    // ============================================================
    //  操作の受け付け
    // ============================================================
    bindEvents() {
        const on = (id, fn) => $(id).addEventListener("click", fn);
        on("btn-start", () => this.showNameInput());
        on("btn-load", () => this.saveMenu.open("load"));
        on("btn-config", () => this.configMenu.open());
        on("btn-exit", () => this.exitGame());
        on("btn-name-submit", () => this.submitName());
        on("btn-yes", () => this.answer(true));
        on("btn-no", () => this.answer(false));
        on("btn-end-title", () => this.returnToTitle());

        $("player-name-input").addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" && !ev.isComposing) this.submitName();
        });

        const stage = $("stage");
        stage.addEventListener("click", () => this.advance());
        stage.addEventListener("contextmenu", (ev) => {
            if (this.mode !== "story") return;
            ev.preventDefault();
            this.textBox.toggle();
        });
        stage.addEventListener("wheel", (ev) => {
            if (this.mode === "story" && ev.deltaY < 0 && !isOverlayOpen()) this.backlog.open();
        }, { passive: true });

        document.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") return closeTopOverlay();
            if (ev.key === "Enter" || ev.key === " ") {
                if (this.mode !== "story" || isOverlayOpen()) return;
                ev.preventDefault();
                this.advance();
            }
        });

        // メッセージウィンドウ右下のメニュー
        $("quick-menu").addEventListener("click", (ev) => {
            ev.stopPropagation();   // 文章が進まないように
            const actions = {
                log: () => this.backlog.open(),
                save: () => this.saveMenu.open("save"),
                load: () => this.saveMenu.open("load"),
                config: () => this.configMenu.open(),
                title: () => this.confirmReturnToTitle()
            };
            actions[ev.target.dataset.action]?.();
        });
    }

    advance() {
        if (this.mode !== "story" || isOverlayOpen()) return;
        if (this.textBox.hiddenByUser) return this.textBox.toggle();
        this.story.advance();
    }

    // ============================================================
    //  画面の流れ
    // ============================================================
    showScreen(name) {
        this.mode = name;
        Object.entries(this.screens).forEach(([key, el]) => { el.hidden = key !== name; });
    }

    showTitle() {
        this.showScreen("title");
        this.textBox.hide();
        this.stage.apply({ bg: "title", chara: null, particles: "title" });
        $("btn-load").disabled = !hasAnySave();
    }

    async returnToTitle() {
        await this.stage.fadeBlack(() => {
            this.bgm.play("title");
            this.showTitle();
        });
    }

    async confirmReturnToTitle() {
        if (await confirmDialog("タイトルに戻りますか?\n(セーブしていない進行は失われます)")) this.returnToTitle();
    }

    showNameInput() {
        this.bgm.play("main");
        this.showScreen("name");
        const input = $("player-name-input");
        input.value = this.playerName;
        input.focus();
    }

    submitName() {
        this.playerName = $("player-name-input").value.trim();
        this.showQuestion();
    }

    showQuestion() {
        this.showScreen("question");
        this.textBox.hide();
        this.stage.apply({ bg: "question", particles: "none" });
        $("question-text").textContent = `${this.playerName || "主人公"}には彼女がいますか?`;
    }

    answer(hasGirlfriend) {
        this.showScreen("story");
        if (hasGirlfriend) {
            // 「はい」は煽られて質問に戻る
            this.story.showExtra(
                { style: "center", fx: "shake", text: "ウソなのわかってるから\nおとなしく「いいえ」を選べってw" },
                () => this.showQuestion()
            );
        } else {
            this.story.start();
        }
    }

    showEnd() {
        this.stage.fadeBlack(() => {
            this.showScreen("end");
            this.textBox.hide();
            this.stage.apply({ bg: "title", chara: null, particles: "title" });
        });
    }

    loadGame(data) {
        this.stage.fadeBlack(() => {
            this.bgm.play("main");
            this.playerName = data.playerName || "";
            this.showScreen("story");
            this.story.loadAt(data.index);
        });
    }

    async exitGame() {
        if (!(await confirmDialog("ゲームを終了しますか?"))) return;
        this.bgm.stop();
        this.stage.particles.set("none");
        this.screens.title.innerHTML = "<p class='end-text'>プレイありがとうございました</p><p class='title-hint'>タブを閉じて終了してください</p>";
    }
}
