# 恋色パレット

ブラウザで遊べる学園恋愛ノベルゲーム。

## 遊び方

ES モジュールを使っているため、`index.html` を直接開くのではなくローカルサーバー経由で開いてください。

```bash
python -m http.server 8000
# → ブラウザで http://localhost:8000 を開く
```

VS Code の拡張機能「Live Server」でも動きます。

### 操作

| 操作 | 内容 |
|---|---|
| クリック / Enter / Space | 文章を進める(表示途中なら全文表示) |
| 右クリック | メッセージウィンドウの表示・非表示 |
| ホイール上 | バックログ |
| Esc | 開いている画面を閉じる |

## 構成

```
index.html                 画面の HTML
style.css                  見た目・アニメーション
audio/                     BGM(タイトル / 本編)
images/                    背景・ロゴ
images/chara/              立ち絵
src/
  main.js                  起動処理
  Game.js                  全体のまとめ役(画面の流れ・操作の受け付け)
  script.js                シナリオデータ(背景・立ち絵・セリフ) ← 本編はここに書く
  engine/
    Story.js               シナリオの進行・ロード地点の再現
    Stage.js               背景・立ち絵・画面演出・場面転換
    TextBox.js             メッセージウィンドウ・文字送り
    Particles.js           光の粒などのエフェクト
    BgmPlayer.js           BGM の再生・切り替え・音量
    Storage.js             設定とセーブデータの保存
    ui/
      Overlay.js           重ねて開く画面の共通処理・確認ダイアログ
      Backlog.js           バックログ
      SaveMenu.js          セーブ / ロード画面
      ConfigMenu.js        設定画面
```

新しい機能を足すときは `src/engine/` に新しいファイルを作り、`Game.js` から呼び出す形にしてください。

## シナリオの書き方

`src/script.js` の `OPENING` に1行足すと、その順番で表示されます。書いた項目だけが変わり、書かなかった項目は前の状態を引き継ぎます。

```js
{ speaker: "女神", text: "セリフ", chara: { id: "goddess", expr: "smile" }, fx: "flash" },
```

| 項目 | 内容 |
|---|---|
| `speaker` | 話者名(`主人公` はプレイヤー名になる。省略で地の文) |
| `text` | 本文(`{name}` はプレイヤー名になる) |
| `bg` | 背景(`BACKGROUNDS` のキー) |
| `chara` | 立ち絵 `{ id, expr, silhouette }`。`null` で退場 |
| `particles` | `"light"` 光の粒 / `"dust"` ほこり / `"none"` なし |
| `style` | `"center"` で画面中央の赤枠 |
| `fx` | `"shake"` 画面揺れ / `"flash"` 白フラッシュ |
| `transition` | `"black"` 暗転 / `"eyelid"` まぶたが開く |

## 素材・クレジット

| 種類 | 素材 | 提供 |
|---|---|---|
| 立ち絵(女神) | 神秘的な女性 | kei02工房 https://booth.pm/ja/items/5320599 |
| 本編BGM | ウキウキららら | 甘茶の音楽工房 |
| フォント | Zen Maru Gothic | Google Fonts(SIL Open Font License) |

各素材の再配布は禁止されています。素材ファイル単体での配布はしないでください。

## 進捗

- [x] タイトル画面・BGM
- [x] 名前入力・質問
- [x] オープニング(女神との会話〜転生後の部屋)
- [x] 文字送り・名前欄・立ち絵・背景演出・エフェクト
- [x] バックログ・セーブ6枠・設定画面
- [ ] 本編
