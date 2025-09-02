// 建立 canvas 並加入頁面
const canvas = document.createElement('canvas'); // 建立畫布元素
document.body.appendChild(canvas); // 將畫布加到頁面上
canvas.width = 480; // 設定畫布寬度
canvas.height = 600; // 設定畫布高度
const ctx = canvas.getContext('2d'); // 取得 2D 繪圖上下文

// 載入太空船與敵人圖片
const shipImg = new Image(); 
shipImg.src = 'spaceship.png'; // 太空船圖片
const ship2Img = new Image();
ship2Img.src = 'spaceship2.png'; // 敵人圖片

let start = false; // 遊戲是否開始
let Level = 1;     // 遊戲等級
let Rspeed = 0;    // 敵人速度

// 定義太空船物件
const ship = { 
  x: canvas.width / 2, // 初始 X 座標置中
  y: canvas.height - 100, // 初始 Y 座標靠下
  width: 60,  // 太空船寬度
  height: 90, // 太空船高度
  speed: 5    // 移動速度
};

// 定義子彈與敵人陣列
let bullets = [];  // 儲存所有子彈
let enemies = [];  // 儲存所有敵人
let score = 0;     // 分數
let isGameOver = false; // 遊戲是否結束

// 監聽鍵盤事件
let keys = {}; 
document.addEventListener('keydown', e => { keys[e.code] = true; }); // 按鍵按下
document.addEventListener('keyup', e => { keys[e.code] = false; }); // 按鍵放開

// 太空船發射子彈
function shoot() {
  if (start) {
    bullets.push({
      x: ship.x + ship.width / 2 - 4, // 子彈 X 座標，太空船正中
      y: ship.y,                       // 子彈 Y 座標，太空船頂端
      width: 8,                        // 子彈寬度
      height: 16,                      // 子彈高度
      speed: 8                         // 子彈移動速度
    });
  }
}

// 生成敵人
function spawnEnemy() {
  const enemyWidth = 54; // 敵人寬度
  Rspeed = Level < 5 ? Level + Math.random() * Level / 2 : 10; // 敵人速度
  enemies.push({
    x: Math.random() * (canvas.width - enemyWidth), // 隨機 X
    y: -40,                                        // 出現在畫面上方外
    width: enemyWidth,                             // 寬度
    height: 81,                                    // 高度
    speed: Rspeed                                  // 移動速度
  });
}

// 矩形碰撞判定（用於子彈）
function isCollide(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

// Pixel-perfect 碰撞判定（安全版）
function pixelPerfectCollision(aImg, aPos, bImg, bPos) {
    // 確保圖片已載入
    if (!aImg.complete || !bImg.complete) return false;

    // 確保位置寬高有效
    if (aPos.width <= 0 || aPos.height <= 0 || bPos.width <= 0 || bPos.height <= 0) return false;

    // 計算重疊區域
    const overlapX = Math.max(aPos.x, bPos.x);
    const overlapY = Math.max(aPos.y, bPos.y);
    const overlapWidth = Math.min(aPos.x + aPos.width, bPos.x + bPos.width) - overlapX;
    const overlapHeight = Math.min(aPos.y + aPos.height, bPos.y + bPos.height) - overlapY;

    if (overlapWidth <= 0 || overlapHeight <= 0) return false; // 無重疊

    // 建立暫存 canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = overlapWidth;
    tempCanvas.height = overlapHeight;
    const tctx = tempCanvas.getContext('2d');

    // 取得 a 的像素
    tctx.clearRect(0, 0, overlapWidth, overlapHeight);
    tctx.drawImage(aImg, aPos.x - overlapX, aPos.y - overlapY, aPos.width, aPos.height);
    const aData = tctx.getImageData(0, 0, overlapWidth, overlapHeight).data;

    // 取得 b 的像素
    tctx.clearRect(0, 0, overlapWidth, overlapHeight);
    tctx.drawImage(bImg, bPos.x - overlapX, bPos.y - overlapY, bPos.width, bPos.height);
    const bData = tctx.getImageData(0, 0, overlapWidth, overlapHeight).data;

    // 像素比對，只要 a 和 b 對應像素都不透明就算碰撞
    for (let i = 3; i < aData.length; i += 4) {
        if (aData[i] > 0 && bData[i] > 0) return true;
    }
    return false;
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

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空畫布

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

  // 更新子彈
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed; // 向上移動
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
    if (bullets[i].y + bullets[i].height < 0) bullets.splice(i, 1); // 移除超出畫面子彈
  }

  // 生成敵人
  if (Math.random() < 0.03 && enemies.length < Math.floor(Level * 1.5) + 2) spawnEnemy();

  // 更新敵人
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed; // 向下移動
    ctx.drawImage(ship2Img, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);

    // Pixel-perfect 碰撞判定
    if (pixelPerfectCollision(shipImg, ship, ship2Img, enemies[i])) {
      isGameOver = true; // 碰撞就結束遊戲
    }

    // 子彈擊中敵人
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (isCollide(enemies[i], bullets[j])) {
        enemies.splice(i, 1); // 移除敵人
        bullets.splice(j, 1); // 移除子彈
        score += 10;          // 分數增加
        break;
      }
    }

    if (enemies[i] && enemies[i].y > canvas.height) enemies.splice(i, 1); // 超出畫面移除
  }

  // 顯示分數與等級
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  Level = 1 + Math.floor(score / 100);
  ctx.fillText('Level: ' + Level, 10, 50);
  ctx.fillText('分數: ' + score, 10, 30);

  requestAnimationFrame(gameLoop); // 下一幀
}

// 等待圖片載入完成再開始遊戲
let imagesLoaded = 0;
shipImg.onload = ship2Img.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    start = true;
    gameLoop();
  }
};
