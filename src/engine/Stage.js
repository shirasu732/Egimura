// ============================================================
//  舞台：背景・立ち絵・粒エフェクト・画面演出・場面転換
// ============================================================
import { BACKGROUNDS, CHARACTERS } from "../script.js";
import { Particles } from "./Particles.js";

const $ = (id) => document.getElementById(id);
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class Stage {
    constructor(config) {
        this.config = config;   // fx(揺れ・フラッシュ)のオン/オフを見る
        this.el = {
            stage: $("stage"), bgA: $("bg-a"), bgB: $("bg-b"),
            charaLayer: $("chara-layer"), charaImg: $("chara-img"),
            flash: $("flash-layer"), black: $("black-layer"), eyelid: $("eyelid-layer")
        };
        this.particles = new Particles($("fx-canvas"));
        this.currentBg = null;
        this.currentChara = null;
        this.activeBgEl = null;
        this.preload();
    }

    preload() {
        Object.values(BACKGROUNDS).filter(Boolean).forEach((f) => { new Image().src = `images/${f}`; });
        Object.values(CHARACTERS).forEach((c) =>
            new Set(Object.values(c.expressions)).forEach((f) => { new Image().src = `images/chara/${f}`; }));
    }

    // シナリオの状態(bg / chara / particles)をまとめて反映
    apply(state) {
        if ("bg" in state) this.setBackground(state.bg);
        if ("chara" in state) this.setChara(state.chara);
        if ("particles" in state) this.particles.set(state.particles);
    }

    // ---------- 背景(2枚を交互に使ってクロスフェード) ----------
    setBackground(name) {
        if (name === this.currentBg) return;
        this.currentBg = name;
        const file = BACKGROUNDS[name];
        const next = this.activeBgEl === this.el.bgA ? this.el.bgB : this.el.bgA;
        next.classList.toggle("title-bg", !file);
        next.style.background = file ? `url("images/${file}") center / cover no-repeat #000` : "";
        next.classList.add("active");
        if (this.activeBgEl) this.activeBgEl.classList.remove("active");
        this.activeBgEl = next;
    }

    // ---------- 立ち絵 ----------
    setChara(chara) {
        const img = this.el.charaImg;
        const prev = this.currentChara;
        this.currentChara = chara ? { ...chara } : null;
        if (!chara) return img.classList.remove("shown");

        const src = `images/chara/${CHARACTERS[chara.id].expressions[chara.expr || "normal"]}`;
        img.classList.toggle("silhouette", !!chara.silhouette);
        if (img.getAttribute("src") !== src) {
            img.onload = () => img.classList.add("shown");
            img.onerror = () => img.classList.remove("shown");
            img.setAttribute("src", src);
        } else {
            img.classList.add("shown");
        }
        // 同じキャラの表情変化・シルエット解除は小さく跳ねて反応させる
        const changed = prev && prev.id === chara.id && (prev.expr !== chara.expr || prev.silhouette !== chara.silhouette);
        if (changed) restart(this.el.charaLayer, "react");
    }

    // ---------- 一瞬の演出 ----------
    playFx(fx) {
        if (this.config.fx === "off") return;
        if (fx === "shake") restart(this.el.stage, "shake");
        if (fx === "flash") restart(this.el.flash, "go");
    }

    // ---------- 場面転換 ----------
    // 暗転 → change() → 明転
    async fadeBlack(change) {
        this.el.black.classList.add("on");
        await wait(750);
        await change();
        await wait(150);
        this.el.black.classList.remove("on");
        await wait(500);
    }

    // まぶたが開く(ぼやけた視界がはっきりしていく)
    async eyelidOpen(change) {
        const { eyelid, stage } = this.el;
        eyelid.classList.remove("open");
        eyelid.classList.add("active");
        await wait(400);
        change();
        stage.classList.add("blur");
        await wait(300);
        eyelid.classList.add("open");
        stage.classList.remove("blur");
        await wait(1700);
        eyelid.classList.remove("active", "open");
    }
}

// CSS アニメーションを最初からやり直す
function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
}
