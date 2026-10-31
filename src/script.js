// ============================================================
//  シナリオデータ
// ============================================================
//  1行 = 1メッセージ。書いた項目だけが変わり、書かなかった項目は前の状態を引き継ぐ。
//
//  speaker   : 話している人（"主人公" はプレイヤー名に置き換わる。省略で地の文）
//  text      : セリフ・地の文（{name} はプレイヤー名に置き換わる）
//  bg        : 背景（BACKGROUNDS のキー）
//  chara     : 立ち絵 { id, expr, silhouette }。null で退場
//  particles : 画面の粒エフェクト（"light" / "dust" / "none"）
//  overlay   : 画像エフェクト（"rays" 後光 / "sunlight" 差し込む光 / "none"）
//  style     : "center" で画面中央の赤枠（強調演出）
//  fx        : 表示と同時の演出（"shake" 揺れ / "flash" 白フラッシュ / "lines" 集中線）
//  transition: 表示前の場面転換（"black" 暗転 / "eyelid" まぶたが開く）
// ============================================================

// 背景画像（images/ フォルダ）
export const BACKGROUNDS = {
    title: null,                    // タイトルはグラデーション
    question: "bg_question.jpg",    // 夜の住宅街
    god: "bg_god.jpg",              // 女神空間
    room: "bg_room.jpg",            // 主人公の部屋
    // 本編の場所（images/bg/）
    classroom: "bg/classroom.jpg",
    classroomAfter: "bg/classroom_after.jpg",
    library: "bg/library.jpg",
    lab: "bg/lab.jpg",
    ground: "bg/ground.jpg",
    rooftop: "bg/rooftop.jpg",
    cafeteria: "bg/cafeteria.jpg",
    residential: "bg/residential.jpg",
    mall: "bg/mall.jpg",
    seaside: "bg/seaside.jpg"
};

// 立ち絵（images/chara/ フォルダ）
// 表情差分が増えたら、ファイル名を差し替えるだけで切り替わる
// 素材：「神秘的な女性」kei02工房（https://booth.pm/ja/items/5320599）
export const CHARACTERS = {
    goddess: {
        name: "女神",
        expressions: {
            normal: "goddess_normal.png",
            smile: "goddess_normal.png",   // 差分を入手したら goddess_smile.png に
            smug: "goddess_normal.png"     // 差分を入手したら goddess_smug.png に
        }
    }
};

// 「いいえ」を選んだあとのオープニング
export const OPENING = [
    { bg: "question", particles: "none", overlay: "none", style: "center", fx: "lines",
      text: "いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww" },
    { style: "center", fx: "flash",
      text: "あまりに鋭いちくちく言葉が心に刺さったことが致命傷となり、俺の意識は暗闇へと沈んでいった。" },

    { transition: "black", bg: "god", particles: "light", style: null,
      chara: { id: "goddess", expr: "normal", silhouette: true },
      speaker: "???", text: "………………ふむ。これはまた、随分と珍妙な死に方をしたものじゃな" },
    { speaker: "主人公", text: "………………誰?" },
    { chara: { id: "goddess", expr: "smile" }, overlay: "rays", fx: "flash",
      speaker: "女神", text: "妾は恋愛を司る女神じゃ" },
    { chara: { id: "goddess", expr: "smug" },
      speaker: "女神", text: "しかし、恋人ができぬと言われた程度で死ぬとは･･････くくっ、愉快な奴よ" },
    { speaker: "主人公", text: "笑い事じゃないんだけど!?", fx: "lines" },
    { chara: { id: "goddess", expr: "normal" },
      speaker: "女神", text: "しかも恋愛経験は皆無、と。･･････なるほど、哀れじゃな" },
    { speaker: "主人公", text: "追い打ちかけるのやめてくれる? もう一回死ぬよ?" },
    { speaker: "女神", text: "ふむ…………･･よし、決めた。お前にもう一度、青春をくれてやろう" },
    { speaker: "主人公", text: "･･････は?" },
    { chara: { id: "goddess", expr: "smile" },
      speaker: "女神", text: "高校二年生、転入生。始業式は明日じゃ。住む場所も生活の面倒も見てやる" },
    { speaker: "主人公", text: "いや、勝手に決めるなって!", fx: "shake" },
    { speaker: "女神", text: "なに、難しいことはない。今度こそ恋人の一人でも作ってみせよ" },
    { speaker: "主人公", text: "だから話を――" },
    { chara: { id: "goddess", expr: "smug" }, fx: "flash",
      speaker: "女神", text: "では、妾を退屈させるでないぞ?" },

    { transition: "eyelid", bg: "room", chara: null, particles: "dust", overlay: "sunlight",
      text: "目が覚めると見知らぬ天井が目に映る。\nどうやら、本当に転生したらしい。" },
    { text: "机の上には、学生証と転入手続きの書類。\nそして荷解き途中と思しき段ボールの山。" },
    { text: "高校二年生、明日から転入･･･ 。\nあの女神、言っていたことは本当だったのか。" },
    { text: "玄関には、引っ越しの挨拶用らしい菓子折りが置かれている。\nその上には一枚のメモ。" },
    { text: "『近所への挨拶くらいはしておけ。人付き合いは恋愛の基本じゃぞ』" },
    { text: "『追伸:まあ、お前には難しいかもしれぬがな』" },
    { speaker: "主人公", text: "………………最後まで余計なお世話だ!", fx: "lines" },
    { text: "とはいえ、これから暮らす場所だ。\n挨拶くらいはしておこう。" }
];
