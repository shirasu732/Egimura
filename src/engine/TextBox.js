// ============================================================
//  メッセージウィンドウ：名前欄・1文字ずつ表示・非表示切り替え
// ============================================================
const TEXT_SPEED = { slow: 70, normal: 40, fast: 18, instant: 0 };   // 1文字あたりのミリ秒
const PAUSE_CHARS = "、。!?…\n";                                      // 少し間をとる文字

const $ = (id) => document.getElementById(id);

export class TextBox {
    constructor(config) {
        this.config = config;   // 文字の速さを見る
        this.el = {
            layer: $("message-layer"), box: $("message-box"),
            plate: $("name-plate"), name: $("name-text"), text: $("message-text")
        };
        this.typing = null;
        this.hiddenByUser = false;
    }

    get isTyping() { return !!this.typing; }

    // 名前・本文・表示スタイルを出して文字送りを始める
    show({ speaker, text, center, unknown }) {
        const { layer, plate, name } = this.el;
        if (center !== undefined) layer.classList.toggle("center-mode", center);
        plate.hidden = !speaker;
        name.textContent = speaker || "";
        plate.classList.toggle("unknown", !!unknown);
        layer.hidden = false;
        this.setHiddenByUser(false);
        this.type(text);
    }

    // 中央の強調表示をやめて通常のウィンドウに戻す
    resetStyle() {
        this.el.layer.classList.remove("center-mode");
    }

    hide() {
        this.stop();
        this.el.layer.hidden = true;
    }

    type(text) {
        this.stop();
        const { box, text: out } = this.el;
        const delay = TEXT_SPEED[this.config.speed];
        box.classList.remove("done");
        if (!delay) {
            out.textContent = text;
            box.classList.add("done");
            return;
        }
        const chars = Array.from(text);
        let i = 0;
        out.textContent = "";
        this.typing = { text };
        const tick = () => {
            if (!this.typing) return;
            out.textContent += chars[i++];
            if (i >= chars.length) return this.finish();
            const wait = PAUSE_CHARS.includes(chars[i - 1]) ? delay * 4 : delay;
            this.typing.timer = setTimeout(tick, wait);
        };
        tick();
    }

    // 表示途中なら全文を一気に出す
    finish() {
        if (!this.typing) return;
        clearTimeout(this.typing.timer);
        this.el.text.textContent = this.typing.text;
        this.typing = null;
        this.el.box.classList.add("done");
    }

    stop() {
        if (this.typing) clearTimeout(this.typing.timer);
        this.typing = null;
    }

    // 右クリックでウィンドウを隠す / 戻す
    toggle() {
        this.setHiddenByUser(!this.hiddenByUser);
    }

    setHiddenByUser(hidden) {
        this.hiddenByUser = hidden;
        this.el.layer.classList.toggle("window-hidden", hidden);
    }
}
