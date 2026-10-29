// ============================================================
//  画面の粒エフェクト（キャンバス描画）
//  "title" : タイトルのきらめき / "light" : 女神空間の光の粒
//  "dust"  : 部屋に差し込む光のほこり / "none" : なし
// ============================================================

const PRESETS = {
    title: { count: 45, colors: ["255,182,222", "255,255,255", "200,170,255"], size: [1, 3], speed: [0.15, 0.5], dir: -1, twinkle: true },
    light: { count: 70, colors: ["255,236,170", "230,190,255", "255,255,255"], size: [1.5, 4], speed: [0.2, 0.7], dir: -1, twinkle: true },
    dust:  { count: 35, colors: ["255,245,220"], size: [0.8, 2.2], speed: [0.05, 0.2], dir: 0, twinkle: false }
};

const rand = (a, b) => a + Math.random() * (b - a);

export class Particles {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.items = [];
        this.preset = null;
        this.running = false;
        this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        this.resize();
        window.addEventListener("resize", () => this.resize());
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && this.preset) this.loop();
        });
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // 種類を切り替える（同じ種類なら何もしない）
    set(name) {
        const preset = PRESETS[name] || null;
        if (preset === this.preset) return;
        this.preset = preset;
        this.canvas.classList.toggle("visible", !!preset);
        if (!preset) return;
        const count = this.reduced ? Math.round(preset.count / 3) : preset.count;
        this.items = Array.from({ length: count }, () => this.spawn(true));
        this.loop();
    }

    spawn(anywhere) {
        const p = this.preset;
        return {
            x: rand(0, this.w),
            y: anywhere ? rand(0, this.h) : (p.dir < 0 ? this.h + 10 : rand(0, this.h)),
            r: rand(p.size[0], p.size[1]),
            vy: p.dir === 0 ? rand(-p.speed[1], p.speed[1]) : p.dir * rand(p.speed[0], p.speed[1]),
            vx: rand(-0.25, 0.25),
            color: p.colors[Math.floor(Math.random() * p.colors.length)],
            phase: rand(0, Math.PI * 2),
            alpha: rand(0.3, 0.9)
        };
    }

    loop() {
        if (this.running) return;
        this.running = true;
        let last = performance.now();
        const step = (now) => {
            if (!this.preset || document.hidden) { this.running = false; this.ctx.clearRect(0, 0, this.w, this.h); return; }
            const dt = Math.min((now - last) / 16.7, 3);
            last = now;
            this.draw(dt, now);
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    draw(dt, now) {
        const { ctx, preset } = this;
        ctx.clearRect(0, 0, this.w, this.h);
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < this.items.length; i++) {
            const it = this.items[i];
            it.x += (it.vx + Math.sin(now / 1500 + it.phase) * 0.2) * dt;
            it.y += it.vy * dt;
            if (it.y < -10 || it.y > this.h + 10 || it.x < -10 || it.x > this.w + 10) {
                this.items[i] = this.spawn(false);
                continue;
            }
            const a = preset.twinkle ? it.alpha * (0.55 + 0.45 * Math.sin(now / 400 + it.phase)) : it.alpha;
            const g = ctx.createRadialGradient(it.x, it.y, 0, it.x, it.y, it.r * 3);
            g.addColorStop(0, `rgba(${it.color},${a})`);
            g.addColorStop(1, `rgba(${it.color},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(it.x, it.y, it.r * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
    }
}
