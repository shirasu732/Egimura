const SAVE_KEY = "koiiro_palette_save";

document.addEventListener("DOMContentLoaded", () => {
    // 画面レイヤー
    const titleLayer = document.getElementById("title-layer");
    const questionLayer = document.getElementById("question-layer");
    const messageLayer = document.getElementById("message-layer");
    const messageText = document.getElementById("message-text");
    const messageBox = document.getElementById("message-box");

    // ボタン類
    const btnStart = document.getElementById("btn-start");
    const btnLoad = document.getElementById("btn-load");
    const btnExit = document.getElementById("btn-exit");
    const btnYes = document.getElementById("btn-yes");
    const btnNo = document.getElementById("btn-no");

    let nextAction = ""; // メッセージクリック後の動作判定用

    // セーブデータの確認＆ボタン状態更新
    const checkSaveData = () => {
        const data = localStorage.getItem(SAVE_KEY);
        if (btnLoad) btnLoad.disabled = !data;
    };

    checkSaveData();

    // すべてのレイヤーを非表示にする
    const hideAllLayers = () => {
        titleLayer.style.display = "none";
        questionLayer.style.display = "none";
        messageLayer.style.display = "none";
    };

    // メッセージ表示共通処理
    const showMessage = (text, actionType, isCenter = false) => {
        hideAllLayers();
        messageText.innerText = text;

        if (isCenter) {
            messageLayer.classList.add("center-mode");
        } else {
            messageLayer.classList.remove("center-mode");
        }

        messageLayer.style.display = "flex";
        nextAction = actionType;
    };

    // --- 1. タイトル画面の処理 ---
    btnStart.onclick = () => {
        hideAllLayers();
        questionLayer.style.display = "flex";
    };

    btnLoad.onclick = () => {
        const data = localStorage.getItem(SAVE_KEY);
        if (data) {
            const saveData = JSON.parse(data);
            showMessage(`セーブデータを読み込みました。\n（場面: ${saveData.sceneId || "本編"}）`, "start_game", false);
        }
    };

    btnExit.onclick = () => {
        if (confirm("ゲームを終了しますか？")) {
            titleLayer.innerHTML = "<h2 style='color: white;'>プレイありがとうございました！<br>タブを閉じて終了してください。</h2>";
        }
    };

    // --- 2. 質問画面の選択処理 ---
    // 「はい」を選択：画面中央に超巨大文字で煽り文 ➔ 再び質問へ
    btnYes.onclick = () => {
        showMessage("ウソなのわかってるから\nおとなしく「いいえ」を選べってw", "retry", true);
    };

    // 「いいえ」を選択：下部に煽り文 ➔ 本編へ進行
    btnNo.onclick = () => {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ hasGirlfriend: false, sceneId: "本編開始" }));
        checkSaveData();
        showMessage("いないのは知ってるwwwww\n彼女ができるわけないもんなwwwwwwww", "start_game", false);
    };

    // --- 3. メッセージボックス画面クリック時の処理 ---
    messageBox.onclick = () => {
        if (nextAction === "retry") {
            // 「はい」からの復帰 ➔ 質問画面に戻す
            hideAllLayers();
            questionLayer.style.display = "flex";
        } else if (nextAction === "start_game") {
            // 「いいえ」からの進行 ➔ メッセージを消してゲーム本編へ
            hideAllLayers();
            console.log("ゲーム本編を開始します");
        }
    };
});