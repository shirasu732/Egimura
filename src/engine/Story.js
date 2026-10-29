// ============================================================
//  シナリオの進行(1行ずつ読み進める・ロード地点の再現)
// ============================================================
import { OPENING } from "../script.js";

const SCENE_KEYS = ["bg", "chara", "particles", "style"];

export class Story {
    // getName(): プレイヤー名 / onEnd(): 最後まで読んだとき
    constructor({ stage, textBox, backlog, getName, onEnd }) {
        this.stage = stage;
        this.textBox = textBox;
        this.backlog = backlog;
        this.getName = getName;
        this.onEnd = onEnd;
        this.script = OPENING;
        this.index = -1;
        this.busy = false;        // 場面転換中は進めない
        this.onNext = null;       // 次のクリックで行う特別な処理
    }

    start() {
        this.backlog.reset();
        this.index = -1;
        this.onNext = null;
        this.next();
    }

    // クリック・Enter で呼ばれる
    advance() {
        if (this.busy) return;
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
            return this.onEnd();
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
        this.present(line, { log: true });
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

    // ---------- セーブ / ロード ----------
    getSaveData() {
        const last = this.backlog.last;
        const text = last ? (last.speaker ? `${last.speaker}「${last.text}」` : last.text) : "";
        return { index: this.index, bg: this.stage.currentBg, text: text.replace(/\n/g, " ") };
    }

    // 指定した行を、そこまでの背景・立ち絵などを再現した状態で表示する
    loadAt(index) {
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
        const scene = { bg: "question", chara: null, particles: "none", style: null };
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
