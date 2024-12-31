// おみくじの結果リスト（拡充版）
const omikujiList = [
    "大吉 - 最高の運勢！願いがすべて叶います。",
    "中吉 - 良い運気。前向きに行動すれば成果が得られます。",
    "小吉 - 少しずつ運が開けてきます。焦らずに進みましょう。",
    "吉 - 良いことが訪れるでしょう。楽しみにしてください。",
    "末吉 - まだ先は見えますが、努力は報われます。",
    "凶 - 注意が必要な時期です。慎重に行動しましょう。",
    "大凶 - 非常に注意が必要です。無理をせず、安全を第一に。",
];


// クリックカウントと必要なクリック数の設定
let clickCount = 0;
let requiredClicks = 10; // ページロード時にランダムに設定

// クリック間隔の設定（オプション）
let lastClickTime = 0;
const clickInterval = 200; // ミリ秒

// 要素の取得
const daruma = document.getElementById('daruma');
const resultDiv = document.getElementById('result');
const clickInfoDiv = document.getElementById('click-info');
const alreadyDrawnDiv = document.getElementById('already-drawn');
const finalResultDiv = document.getElementById('final-result');
const popup = document.getElementById('popup');
const closePopupButton = document.getElementById('close-popup');
const twitterShareButton = document.getElementById('twitter-share'); // Twitterボタンの取得

// クッキー操作のヘルパー関数
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const sameSite = "; SameSite=Lax";
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";" + sameSite + secure + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

// おみくじを引く関数
function drawOmikuji() {
    if (clickCount >= requiredClicks) {
        const randomIndex = Math.floor(Math.random() * omikujiList.length);
        const result = omikujiList[randomIndex];
        resultDiv.textContent = result;
        finalResultDiv.textContent = result;
        alreadyDrawnDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        setCookie('omikuji-drawn', 'true', 365); // 1年間有効
        setCookie('omikuji-result', result, 365);
        resetClickCount();

        // Google アナリティクスのイベントを発火
        if (typeof gtag === 'function') {
            // 抽選結果をカテゴリ、アクション、ラベルとして送信
            const fortune = result.split(' - ')[0]; // "大吉", "中吉"など
            gtag('event', 'Draw', {
                'event_category': 'Omikuji',
                'event_label': fortune
            });
        } else {
            console.warn('gtag 関数が見つかりません。Google アナリティクスが正しく設定されているか確認してください。');
        }
    } else {
        // 必要なクリック数に達していない場合
        resultDiv.textContent = "足りません！";
    }
}

// クリックカウントをリセットする関数
function resetClickCount() {
    clickCount = 0;
    updateShakeDegree();
}

// Shake animation intensityを更新する関数
function updateShakeDegree() {
    // 最大揺れ角度を15度とする
    const maxDegree = 15;
    // 現在のクリック数の割合
    const proportion = Math.min(clickCount / requiredClicks, 1);
    // 揺れ角度を5度から15度の間で設定
    const shakeDegree = 5 + (maxDegree - 5) * proportion;
    // CSS変数を設定
    daruma.style.setProperty('--shake-degree', `${shakeDegree}deg`);
}

// ポップアップを表示する関数
function showPopup() {
    popup.classList.add('show');
    document.body.classList.add('popup-active'); // 背景をぼかす場合
}

// ポップアップを閉じる関数
function closePopup() {
    popup.classList.remove('show');
    document.body.classList.remove('popup-active'); // 背景をぼかす場合
}

// Twitter共有ボタンをクリックしたときの関数
function shareOnTwitter() {
    const result = finalResultDiv.textContent;
    const text = encodeURIComponent(`今年の運勢は「${result}」でした！ #ぎんのダルマおみくじ2025`);
    const url = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank');
}

// ポップアップの閉じるボタンにイベントリスナーを追加
closePopupButton.addEventListener('click', closePopup);

// Twitter共有ボタンにイベントリスナーを追加
if (twitterShareButton) {
    twitterShareButton.addEventListener('click', shareOnTwitter);
}

// ページロード時にポップアップを表示し、既におみくじを引いているかをチェック
window.addEventListener('load', () => {
    showPopup();
    const alreadyDrawn = getCookie('omikuji-drawn');
    const savedResult = getCookie('omikuji-result');
    if (alreadyDrawn === 'true' && savedResult) {
        // 既におみくじを引いている場合
        daruma.style.pointerEvents = 'none'; // クリックを無効化
        daruma.style.opacity = '0.5'; // 視覚的に無効化を示す
        alreadyDrawnDiv.style.display = 'block';
        finalResultDiv.textContent = savedResult;
        resultDiv.style.display = 'none';
    } else {
        // おみくじを引いていない場合、requiredClicksを5から15の間でランダムに設定
        requiredClicks = Math.floor(Math.random() * 11) + 5; // 5から15
        updateShakeDegree();
    }
});

// ダルマ画像にクリックイベントを追加
daruma.addEventListener('click', () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < clickInterval) {
        return; // 最低間隔内のクリックは無視
    }
    lastClickTime = currentTime;

    clickCount++;
    updateShakeDegree();
    drawOmikuji();

    // ダルマに揺れアニメーションを追加
    daruma.classList.add('shake');
    setTimeout(() => {
        daruma.classList.remove('shake');
    }, 500); // アニメーション時間と同じに設定
});
