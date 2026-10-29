// ============================================================
//  BGM の再生・切り替え・音量
// ============================================================
const BGM_FACTOR = 0.5;   // スライダー値に対する実際の音量の倍率

export class BgmPlayer {
    constructor(tracks) {
        this.tracks = tracks;              // { title: <audio>, main: <audio> }
        this.current = tracks.title;
        // ブラウザは操作があるまで音を出せないので、最初の操作で再生を始める
        document.addEventListener("pointerdown", () => this.resume());
    }

    resume() {
        if (this.current && this.current.paused) this.current.play().catch(() => { /* 操作待ち */ });
    }

    play(name) {
        const next = this.tracks[name];
        if (next === this.current) return this.resume();
        this.stop();
        this.current = next;
        this.resume();
    }

    stop() {
        if (!this.current) return;
        this.current.pause();
        this.current.currentTime = 0;
    }

    setVolume(volume) {
        Object.values(this.tracks).forEach((a) => { a.volume = volume * BGM_FACTOR; });
    }
}
