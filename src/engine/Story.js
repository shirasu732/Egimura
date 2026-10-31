// ============================================================
//  セリフの再生(1行ずつ読み進める・選択肢・ロード地点の再現)
//  オープニングも本編のイベントも、同じ run() で再生する
// ============================================================
import { OPENING } from "../script.js";

const SCENE_KEYS = ["bg", "chara", "particles", "overlay", "style"];

export class Story {
    // getName(): プレイヤー名 / choiceMenu: 選択肢の画面
    constructor({ stage, textBox, backlog, choiceMenu, getName }) {
        this.stage = stage;
        this.textBox = textBox;
        this.backlog = backlog;
        this.choiceMenu = choiceMenu;
        this.getName = getName;
        this.script = [];
        this.index = -1;
        this.busy = false;        // 場面転換中は進めない
        this.choosing = false;    // 選択肢を表示中
        this.onNext = null;       // 次のクリックで行う特別な処理
        this.handlers = {};
    }

    // lines を最初から再生する
    //   onEnd()        : 最後まで読んだとき
    //   onChoose(opt)  : 選択肢を選んだとき。返した配列がそのあとに続く(省略時は opt.lines)
    run(lines, handlers = {}) {
        this.script = lines.slice();
        this.handlers = handlers;
        this.index = -1;
        this.onNext = null;
        this.next();
    }

    runOpening(onEnd) {
        this.isOpening = true;
        this.backlog.reset();
        this.run(OPENING, { onEnd: () => { this.isOpening = false; onEnd(); } });
    }

    // クリック・Enter で呼ばれる
    advance() {
        if (this.busy || this.choosing) return;
        if (this.textBox.isTyping) return this.textBox.finish();
        if (this.onNext) {
            const fn = this.onNext;
            this.onNext = null;
            return fn();
        }
        this.next();
    }

    async next() {
        this.index++;
        if (this.index >= this.script.length) {
            this.index = this.script.length - 1;
            return this.handlers.onEnd?.();
        }
        const line = this.script[this.index];
        this.busy = true;
        if (line.transition === "black") {
            await this.stage.fadeBlack(() => this.stage.apply(line));
        } else if (line.transition === "eyelid") {
            this.textBox.hide();
            await this.stage.eyelidOpen(() => this.stage.apply(line));
        } else {
            this.stage.apply(line);
        }
        this.busy = false;
        if (line.text) this.present(line, { log: true });
        if (line.choice) return this.showChoice(line);
        if (!line.text) this.next();   // text も choice もない行は場面の切り替えだけ
    }

    showChoice(line) {
        this.choosing = true;
        this.choiceMenu.show(line.choice.map((opt) => this.fillName(opt.text)), (i) => {
            this.choosing = false;
            const opt = line.choice[i];
            this.backlog.add("", `▶ ${this.fillName(opt.text)}`);
            const more = this.handlers.onChoose ? this.handlers.onChoose(opt) : opt.lines;
            if (more?.length) this.script.splice(this.index + 1, 0, ...more);
            this.next();
        });
    }

    // シナリオ外の1メッセージ(ログに残さない)。クリックで then() を実行
    showExtra(line, then) {
        this.present(line, { log: false });
        this.onNext = then;
    }

    present(line, { log, fx = true }) {
        const speaker = this.speakerName(line.speaker);
        const text = this.fillName(line.text);
        this.textBox.show({
            speaker,
            text,
            center: "style" in line ? line.style === "center" : undefined,
            unknown: line.speaker === "???"
        });
        if (log) this.backlog.add(speaker, text);
        if (fx && line.fx) this.stage.playFx(line.fx);
    }

    // ---------- オープニングのセーブ / ロード ----------
    getSaveData() {
        const last = this.backlog.last;
        const text = last ? (last.speaker ? `${last.speaker}「${last.text}」` : last.text) : "";
        return { index: this.index, bg: this.stage.currentBg, text: text.replace(/\n/g, " ") };
    }

    // オープニングの指定した行を、そこまでの背景・立ち絵などを再現した状態で表示する
    loadOpeningAt(index, onEnd) {
        this.isOpening = true;
        this.script = OPENING.slice();
        this.handlers = { onEnd: () => { this.isOpening = false; onEnd(); } };
        this.index = Math.min(Math.max(index, 0), this.script.length - 1);
        this.onNext = null;
        const scene = this.sceneAt(this.index);
        this.stage.apply(scene);
        this.backlog.reset(this.script.slice(0, this.index).map((l) => ({
            speaker: this.speakerName(l.speaker), text: this.fillName(l.text)
        })));
        this.present({ ...this.script[this.index], style: scene.style }, { log: true, fx: false });
    }

    sceneAt(index) {
        const scene = { bg: "question", chara: null, particles: "none", overlay: "none", style: null };
        for (const line of this.script.slice(0, index + 1)) {
            SCENE_KEYS.forEach((key) => { if (key in line) scene[key] = line[key]; });
        }
        return scene;
    }

    // ---------- 名前の置き換え ----------
    speakerName(speaker) {
        if (!speaker) return "";
        return speaker === "主人公" ? this.getName() : speaker;
    }

    fillName(text) {
        return text.replaceAll("{name}", this.getName());
    }
}
