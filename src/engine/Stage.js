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
            flash: $("flash-layer"), black: $("black-layer"), eyelid: $("eyelid-layer"),
            fxBack: $("fx-back"), fxFront: $("fx-front"), fxLines: $("fx-lines")
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

    // シナリオの状態(bg / chara / particles / overlay)をまとめて反映
    apply(state) {
        if ("bg" in state) this.setBackground(state.bg);
        if ("chara" in state) this.setChara(state.chara);
        if ("particles" in state) this.particles.set(state.particles);
        if ("overlay" in state) this.setOverlay(state.overlay);
    }

    // 画像エフェクト:"rays" 後光 / "sunlight" 差し込む光 / "none"
    setOverlay(name) {
        this.el.fxBack.classList.toggle("visible", name === "rays");
        this.el.fxFront.classList.toggle("visible", name === "sunlight");
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
        if (fx === "lines") restart(this.el.fxLines, "go");
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

    // 目覚め:暗転 → 薄く開く → まばたき → ぼやけた視界がゆっくりはっきりする
    async eyelidOpen(change) {
        const { eyelid, stage, black } = this.el;
        black.classList.add("on");
        await wait(750);
        drawEye(eyelid, 0);
        eyelid.classList.add("active");
        black.classList.remove("on");
        change();
        stage.classList.add("blur");
        await animateEye(eyelid, [[0, 0], [600, 0.22], [850, 0.03], [1000, 0.03]]);
        stage.classList.remove("blur");
        await animateEye(eyelid, [[0, 0.03], [1500, 1.4]]);
        eyelid.classList.remove("active");
    }
}

// CSS アニメーションを最初からやり直す
function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
}

// 目の開き具合(0 = 閉じている、1 以上 = 全開)を楕円のマスクで描く
function drawEye(el, open) {
    if (open < 0.005) {
        el.style.background = "#000";
        return;
    }
    const h = open * 100;
    const w = 70 + open * 90;
    el.style.background = `radial-gradient(ellipse ${w}% ${h}% at 50% 50%, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.85) 82%, #000 100%)`;
}

// [[時間ms, 開き具合], ...] の順に、なめらかに変化させる
function animateEye(el, keys) {
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const total = keys[keys.length - 1][0];
    return new Promise((resolve) => {
        const t0 = performance.now();
        const frame = (now) => {
            const t = Math.min(now - t0, total);
            let i = 1;
            while (i < keys.length - 1 && keys[i][0] < t) i++;
            const [ta, va] = keys[i - 1];
            const [tb, vb] = keys[i];
            const k = tb === ta ? 1 : ease((t - ta) / (tb - ta));
            drawEye(el, va + (vb - va) * k);
            if (t < total) requestAnimationFrame(frame);
            else resolve();
        };
        requestAnimationFrame(frame);
    });
}
