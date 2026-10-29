// ============================================================
//  設定とセーブデータの保存(ブラウザの localStorage)
// ============================================================
const CONFIG_KEY = "koiiro_palette_config";
const SLOT_KEY = "koiiro_palette_slots";
export const SLOT_COUNT = 6;

const readJson = (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};

// ---------- 設定 ----------
export function loadConfig() {
    const saved = readJson(CONFIG_KEY) || {};
    const oldVolume = localStorage.getItem("koiiro_palette_volume");   // 旧バージョンの音量設定
    return {
        volume: saved.volume ?? (oldVolume !== null ? parseFloat(oldVolume) : 0.1),
        speed: saved.speed || "normal",   // slow / normal / fast / instant
        fx: saved.fx || "on"              // 画面の揺れ・フラッシュ
    };
}

export function saveConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// ---------- セーブスロット ----------
export function readSlots() {
    const slots = readJson(SLOT_KEY);
    return Array.from({ length: SLOT_COUNT }, (_, i) => (Array.isArray(slots) && slots[i]) || null);
}

export function writeSlot(i, data) {
    const slots = readSlots();
    slots[i] = data;
    localStorage.setItem(SLOT_KEY, JSON.stringify(slots));
}

export function hasAnySave() {
    return readSlots().some(Boolean);
}
