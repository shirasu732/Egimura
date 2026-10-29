// ============================================================
//  重ねて開く画面(ログ・セーブ・設定・確認)の共通処理
// ============================================================
const $ = (id) => document.getElementById(id);
const OVERLAY_IDS = ["confirm-layer", "config-layer", "slot-layer", "log-layer"];   // 手前にあるもの順

export function openOverlay(el) { el.hidden = false; }
export function closeOverlay(el) { el.hidden = true; }

export function isOverlayOpen() {
    return OVERLAY_IDS.some((id) => !$(id).hidden);
}

// Esc キー用：一番手前の画面を閉じる
export function closeTopOverlay() {
    const top = OVERLAY_IDS.map($).find((el) => !el.hidden);
    if (!top) return;
    if (top.id === "confirm-layer") return settleConfirm(false);
    closeOverlay(top);
}

// 「閉じる」ボタンと、外側クリックで閉じられるようにする
export function initOverlays() {
    document.querySelectorAll("[data-close]").forEach((btn) =>
        btn.addEventListener("click", () => closeOverlay(btn.closest(".overlay"))));
    ["log-layer", "slot-layer", "config-layer"].forEach((id) => {
        const ov = $(id);
        ov.addEventListener("click", (ev) => { if (ev.target === ov) closeOverlay(ov); });
    });
    $("confirm-yes").addEventListener("click", () => settleConfirm(true));
    $("confirm-no").addEventListener("click", () => settleConfirm(false));
}

// ---------- 確認ダイアログ(はい=true / いいえ=false) ----------
let resolver = null;

export function confirmDialog(message) {
    $("confirm-text").textContent = message;
    openOverlay($("confirm-layer"));
    return new Promise((resolve) => { resolver = resolve; });
}

function settleConfirm(result) {
    closeOverlay($("confirm-layer"));
    if (resolver) resolver(result);
    resolver = null;
}

// ---------- 画面上部に一瞬出るお知らせ ----------
let toastTimer = null;

export function toast(text) {
    const t = $("toast");
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 1600);
}
