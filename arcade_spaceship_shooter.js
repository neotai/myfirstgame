// 引入必要的 Canvas 元素
const canvas = document.createElement('canvas'); // 建立畫布
document.body.appendChild(canvas); // 加入到頁面
canvas.width = 480; // 設定畫布寬度
canvas.height = 600; // 設定畫布高度
const ctx = canvas.getContext('2d'); // 取得繪圖上下文

// 載入太空船與敵人圖片
python -m http.server 8000
const shipImg = new Image(); 
shipImg.crossOrigin = 'anonymous'
shipImg.src = 'spaceship.png'; // 太空船圖片
const ship2Img = new Image();
ship2Img.crossOrigin = 'anonymous'
ship2Img.src = 'spaceship2.png'; // 敵人圖片

var start = false;
var Level = 1;
var Rspeed = 0;

// 定義太空船物件
const ship = {
    x: canvas.width / 2, // 太空船初始 X 座標在中間
    y: canvas.height - 100, // 太空船初始 Y 座標靠下
    width: 60,  // 太空船寬度
    height: 90, // 太空船高度
    speed: 5    // 太空船移動速度
};

// 定義子彈與敵人陣列
let bullets = []; // 儲存所有子彈
let enemies = []; // 儲存所有敵人

// 定義分數與遊戲狀態
let score = 0; 
let isGameOver = false;

// 監聽鍵盤事件
let keys = {}; 
document.addEventListener('keydown', e => { keys[e.code] = true; }); // 按鍵按下
document.addEventListener('keyup', e => { keys[e.code] = false; });  // 按鍵放開

// 太空船發射子彈
function shoot() {
    if (start) {
        bullets.push({
            x: ship.x + ship.width / 2 - 4, // 子彈 X 座標，太空船正中間
            y: ship.y,                       // 子彈 Y 座標，太空船頂端
            width: 8,                        // 子彈寬度
            height: 16,                      // 子彈高度
            speed: 8                         // 子彈速度
        });
    }
}

// 生成敵人
function spawnEnemy() {
    const enemyWidth = 54; // 敵人寬度
    // 訂定速度
    if (Level < 5) {
        Rspeed = Level + Math.random() * Level / 2; // 敵人速度隨機
    } else {
        Rspeed = 10; // 敵人速度固定
    }

    enemies.push({
        x: Math.random() * (canvas.width - enemyWidth), // 隨機 X
        y: -40,                                         // 出現在畫面上方外
        width: enemyWidth,                              // 寬度
        height: 81,                                     // 高度
        speed: Rspeed                                   // 移動速度
    });
}

// 檢查子彈矩形碰撞
function isCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Pixel-perfect 碰撞判定
function pixelCollisionCanvas(ctx, a, b) {
    // 計算重疊區域
    const overlapX = Math.max(a.x, b.x);
    const overlapY = Math.max(a.y, b.y);
    const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - overlapX;
    const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - overlapY;

    // 無重疊直接回傳 false
    if (overlapWidth <= 0 || overlapHeight <= 0) return false;

    // 從主 canvas 取得重疊區域像素
    const data = ctx.getImageData( overlapX, overlapY, overlapWidth, overlapHeight).data;

    // 檢查每個像素 alpha 是否 > 0
    //for (let i = 3; i < data.length; i += 4) {
    //    if (data[i] > 0) {
    //        return true; // 任一像素不透明 → 碰撞
    //    }
    //}

    return false; // 沒有像素重疊 → 沒碰撞
}

// 主遊戲迴圈
function gameLoop() {
    if (isGameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.fillText('遊戲結束', canvas.width / 2 - 90, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('分數: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 40);
        return;
    }

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 太空船移動
    if (keys['ArrowLeft']) ship.x -= ship.speed;
    if (keys['ArrowRight']) ship.x += ship.speed;
    if (keys['Space']) {
        if (!keys['_lastShot'] || Date.now() - keys['_lastShot'] > 250) {
            shoot();
            keys['_lastShot'] = Date.now();
        }
    }
    ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x)); // 限制邊界

    // 繪製太空船
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // 更新並繪製子彈
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed; // 子彈向上移動
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
        if (bullets[i].y + bullets[i].height < 0) bullets.splice(i, 1); // 移除超出畫面子彈
    }

    // 生成敵人
    if (Math.random() < 0.03 && enemies.length < Math.floor(Level * 1.5) + 2) spawnEnemy();

    // 更新並繪製敵人
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        ctx.drawImage(ship2Img, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);

        // 檢查太空船碰撞
        if (pixelCollisionCanvas(ctx, ship, enemies[i])) {
            isGameOver = true;
        }

        // 檢查敵人是否被子彈擊中
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (isCollide(enemies[i], bullets[j])) {
                enemies.splice(i, 1); // 移除敵人
                bullets.splice(j, 1); // 移除子彈
                score += 10;          // 分數增加
                break;
            }
        }

        // 敵人超出畫面移除
        if (enemies[i] && enemies[i].y > canvas.height) enemies.splice(i, 1);
    }

    // 顯示分數與等級
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    Level = 1 + Math.floor(score / 100);
    ctx.fillText('Level: ' + Level, 10, 50);
    ctx.fillText('分數: ' + score, 10, 30);

    if (keys['ArrowUp']) score += 10; // 測試用

    // 要求下一幀
    requestAnimationFrame(gameLoop);
}

// 開始遊戲
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !start) {
        $('#space').hide();
        start = true;
        gameLoop();
    }
});
