// ============================================================
//  設定画面(BGM音量・文字の速さ・画面効果)
// ============================================================
import { saveConfig } from "../Storage.js";
import { openOverlay } from "./Overlay.js";

const $ = (id) => document.getElementById(id);

export class ConfigMenu {
    // config は他のクラスと共有している設定オブジェクト。onVolume(v) は音量変更時に呼ばれる
    constructor(config, onVolume) {
        this.config = config;
        this.onVolume = onVolume;
        this.layer = $("config-layer");
        this.volume = $("cfg-volume");
        this.volumeText = $("cfg-volume-value");

        this.volume.addEventListener("input", () => {
            this.config.volume = parseFloat(this.volume.value);
            this.onVolume(this.config.volume);
            this.update();
        });
        this.bindChoice("cfg-speed", "speed");
        this.bindChoice("cfg-fx", "fx");
    }

    // ボタンの data-speed / data-fx を設定値に反映する
    bindChoice(groupId, key) {
        $(groupId).addEventListener("click", (ev) => {
            const value = ev.target.dataset[key];
            if (!value) return;
            this.config[key] = value;
            this.update();
        });
    }

    open() {
        this.volume.value = this.config.volume;
        this.refresh();
        openOverlay(this.layer);
    }

    update() {
        saveConfig(this.config);
        this.refresh();
    }

    refresh() {
        this.volumeText.textContent = `${Math.round(this.config.volume * 100)}%`;
        document.querySelectorAll("#cfg-speed button").forEach((b) =>
            b.classList.toggle("selected", b.dataset.speed === this.config.speed));
        document.querySelectorAll("#cfg-fx button").forEach((b) =>
            b.classList.toggle("selected", b.dataset.fx === this.config.fx));
    }
}
