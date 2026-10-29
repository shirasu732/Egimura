# 恋色パレット

ブラウザで遊べる学園恋愛ノベルゲーム。

## 遊び方

ES モジュールを使っているため、`index.html` を直接開くのではなくローカルサーバー経由で開いてください。

```bash
# 例: Python がある場合
python -m http.server 8000
# → ブラウザで http://localhost:8000 を開く
```

VS Code の拡張機能「Live Server」でも動きます。

## 構成

```
index.html      画面の HTML
style.css       見た目
src/main.js     起動処理
src/Game.js     ゲーム本体（会話データ・進行・セーブ）
audio/          BGM
images/         ロゴなどの画像
```

## 会話の追加方法

`src/Game.js` 冒頭の `OPENING` 配列に1行足すと、その順番で表示されます。

```js
{ bg: "room", center: false, text: "表示するセリフ" },
```

- `bg` … 背景（`title` / `question` / `god` / `room`、`BG` に追加すれば増やせる）
- `center` … `true` で画面中央の赤枠表示
- `eyelid` … `true` で表示前にまぶたが開く演出

## 進捗

- [x] タイトル画面・BGM・音量調整
- [x] 名前入力・質問
- [x] オープニング（女神との会話〜転生後の部屋）
- [x] セーブ / つづきから
- [ ] 本編
