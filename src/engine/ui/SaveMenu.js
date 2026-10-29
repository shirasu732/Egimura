// ============================================================
//  セーブ / ロード画面
// ============================================================
import { BACKGROUNDS } from "../../script.js";
import { readSlots, writeSlot } from "../Storage.js";
import { openOverlay, closeOverlay, confirmDialog, toast } from "./Overlay.js";

const $ = (id) => document.getElementById(id);

export class SaveMenu {
    // getSaveData(): 今の進行状況を返す / onLoad(data): ロードを実行 / isPlaying(): 本編中か
    constructor({ getSaveData, onLoad, isPlaying }) {
        this.getSaveData = getSaveData;
        this.onLoad = onLoad;
        this.isPlaying = isPlaying;
        this.layer = $("slot-layer");
        this.grid = $("slot-grid");
        this.title = $("slot-title");
        this.kind = "save";
    }

    open(kind) {
        this.kind = kind;
        this.title.textContent = kind === "save" ? "セーブ" : "ロード";
        this.render();
        openOverlay(this.layer);
    }

    render() {
        this.grid.replaceChildren(...readSlots().map((data, i) => this.slotButton(data, i)));
    }

    slotButton(data, i) {
        const btn = document.createElement("button");
        btn.className = "slot";
        btn.disabled = this.kind === "load" && !data;

        const thumb = document.createElement("div");
        thumb.className = "slot-thumb";
        if (data && BACKGROUNDS[data.bg]) thumb.style.backgroundImage = `url("images/${BACKGROUNDS[data.bg]}")`;

        const info = document.createElement("div");
        info.className = "slot-info";
        info.append(
            span("slot-no", `No.${i + 1}`),
            span("slot-date", data ? data.date : "― データなし ―"),
            span("slot-text", data ? data.text : "")
        );
        btn.append(thumb, info);
        btn.addEventListener("click", () => (this.kind === "save" ? this.save(i, data) : this.load(i, data)));
        return btn;
    }

    async save(i, existing) {
        if (existing && !(await confirmDialog(`No.${i + 1} に上書きしますか?`))) return;
        writeSlot(i, {
            ...this.getSaveData(),
            date: new Date().toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" })
        });
        this.render();
        toast(`No.${i + 1} にセーブしました`);
    }

    async load(i, data) {
        if (this.isPlaying() && !(await confirmDialog(`No.${i + 1} をロードしますか?`))) return;
        closeOverlay(this.layer);
        this.onLoad(data);
    }
}

function span(className, text) {
    return Object.assign(document.createElement("span"), { className, textContent: text });
}
