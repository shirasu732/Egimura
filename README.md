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
| 1〜9 | 選択肢を選ぶ |

### 開発用の表示

URL の末尾に `?debug` を付けると(例:`http://localhost:8000/?debug`)、画面右上に今のターン・各ヒロインの好感度・今週の居場所が表示されます。

## 構成

```
index.html                 画面の HTML
style.css                  見た目・アニメーション
audio/                     BGM(タイトル / 本編)
images/                    背景・ロゴ
images/bg/                 本編の場所の背景
images/chara/              立ち絵
images/effects/            エフェクト画像
src/
  main.js                  起動処理
  Game.js                  全体のまとめ役(画面の流れ・操作の受け付け)
  script.js                背景・立ち絵の登録とオープニング
  data/                    ← 本編の中身はここに書く
    heroines.js            ヒロインの名前・ルートの締め切り
    schedules.js           ヒロインがどこにいやすいか
    locations.js           行き先の一覧・雨の日の移動
    events.js              条件つきイベント(選択肢つき)
    daily.js               毎日の地の文・ヒロインと会ったときの会話
    friend.js              親友のセリフ
    endings.js             エンディング
    balance.js             好感度の上がり方・ぼっちエンドの基準などの数値
  engine/
    DayLoop.js             本編の進行(ターン → フェーズ)
    Calendar.js            72ターンの暦・1日のフェーズ・日付の表示
    Affection.js           好感度・締め切り・エンディング判定
    Schedule.js            毎週の居場所と天気の抽選
    EventRunner.js         条件に合うイベントを探す
    Story.js               セリフの再生・選択肢・ロード地点の再現
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
      ChoiceMenu.js        選択肢(行き先の選択もここ。マップができたら置き換える)
      DateBadge.js         画面左上の日付
      DebugPanel.js        開発用の表示
```

新しい機能を足すときは `src/engine/` に新しいファイルを作り、`Game.js` から呼び出す形にしてください。

## 本編の流れ

4月〜3月を1か月6ターン(平日・平日・休日・平日・平日・休日)、全72ターンで進みます。

- 平日は「昼休み」「放課後」、休日は「午前」「午後」に行き先を選べます。ヒロインのいる場所へ行くと好感度が上がります。
- 平日の昼休み・放課後に「親友に話を聞く」を選ぶと、各ヒロインの好感度が5段階で分かり、その週(週末まで)の居場所が行き先に表示されます。週に1回まで、時間は消費しません。
- `data/heroines.js` の締め切りまでに好感度が足りないと、そのヒロインのルートから外れます。
- `data/balance.js` のぼっちエンド判定の時期に、誰も基準に届いていなければぼっちエンド。1年の終わりに基準を超えた中で一番好感度の高いヒロインのエンディングになります。
- 本編中のセーブは「今のフェーズの始まり」を保存します。居場所の抽選結果も保存するので、ロードし直しても結果は変わりません。

### イベントの書き方

`src/data/events.js` に追加します。`when` に書いた条件をすべて満たすと、そのフェーズ(移動フェーズならその場所を選んだとき)に流れます。

```js
{
    id: "aizawa_boxes",
    when: { phase: "afterSchool", place: "lab", heroine: "aizawa", affection: ["aizawa", 10] },
    once: true,
    affection: { aizawa: 10 },
    lines: [
        { bg: "lab", text: "理科準備室の前で……" },
        { choice: [
            { text: "黙って半分持つ", affection: { aizawa: 5 }, lines: [ { speaker: "相沢", text: "……助かります" } ] },
            { text: "声をかける",     affection: { aizawa: 0 }, lines: [ ... ] }
        ] }
    ]
}
```

## セリフの書き方

オープニングは `src/script.js` の `OPENING`、本編は `src/data/` の各ファイルに書きます。書いた項目だけが変わり、書かなかった項目は前の状態を引き継ぎます。

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
| `overlay` | `"rays"` 後光 / `"sunlight"` 差し込む光 / `"none"` なし |
| `style` | `"center"` で画面中央の赤枠 |
| `fx` | `"shake"` 画面揺れ / `"flash"` 白フラッシュ / `"lines"` 集中線 |
| `transition` | `"black"` 暗転 / `"eyelid"` まぶたが開く |
| `choice` | 選択肢 `[{ text, affection, lines }]` |

## 素材・クレジット

| 種類 | 素材 | 提供 |
|---|---|---|
| 立ち絵(女神) | 神秘的な女性 | kei02工房 https://booth.pm/ja/items/5320599 |
| 本編BGM | ウキウキららら | 甘茶の音楽工房 |
| エフェクト画像 | 集中線・後光・差し込む光 | 自作(images/effects/) |
| 背景(本編の場所) | 教室・図書室・理科準備室ほか | D:\素材画像 の手持ち素材(出典は要確認) |
| フォント | Zen Maru Gothic / Shippori Mincho | Google Fonts(SIL Open Font License) |

各素材の再配布は禁止されています。素材ファイル単体での配布はしないでください。

## 進捗

- [x] タイトル画面・BGM
- [x] 名前入力・質問
- [x] オープニング(女神との会話〜転生後の部屋)
- [x] 文字送り・名前欄・立ち絵・背景演出・エフェクト
- [x] バックログ・セーブ6枠・設定画面
- [x] 本編の仕組み(72ターン・1日の流れ・好感度・親友・締め切り・エンディング)
- [ ] マップ画面・ミニキャラ(今は行き先を選択肢で選ぶ)
- [ ] 本編のシナリオ・イベント・ヒロインの立ち絵
