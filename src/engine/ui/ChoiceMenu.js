// ============================================================
//  選択肢(会話の選択肢・行き先の選択)
//  数字キー 1〜9 でも選べる
// ============================================================
const $ = (id) => document.getElementById(id);

export class ChoiceMenu {
    constructor() {
        this.layer = $("choice-layer");
        this.list = $("choice-list");
        this.onPick = null;
        document.addEventListener("keydown", (ev) => {
            if (this.layer.hidden) return;
            const n = parseInt(ev.key, 10);
            const buttons = this.list.querySelectorAll("button");
            if (n >= 1 && n <= buttons.length) buttons[n - 1].click();
        });
    }

    get isOpen() { return !this.layer.hidden; }

    // labels: 表示する文字の配列 / onPick(i): 選ばれた番号
    show(labels, onPick) {
        this.onPick = onPick;
        this.list.replaceChildren(...labels.map((label, i) => {
            const btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.innerHTML = label;   // 行き先の補足(<small>)を出すため
            btn.addEventListener("click", (ev) => {
                ev.stopPropagation();
                this.hide();
                onPick(i);
            });
            return btn;
        }));
        this.layer.hidden = false;
    }

    hide() {
        this.layer.hidden = true;
    }
}
