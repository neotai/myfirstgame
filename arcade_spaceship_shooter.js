// 引入必要的 Canvas 元素
const canvas = document.createElement('canvas'); // 建立畫布
document.body.appendChild(canvas); // 加入到頁面
canvas.width = 480; // 設定畫布寬度
canvas.height = 600; // 設定畫布高度
const ctx = canvas.getContext('2d'); // 取得繪圖上下文
const shipImg = new Image(); // 建立圖片物件
shipImg.src = 'spaceship.png'; // 圖片檔名
const ship2Img = new Image(); // 建立圖片物件
ship2Img.src = 'spaceship2.png'; // 圖片檔名
var start=false
var Level=1
var Rspeed=0
let imagesLoaded = 0;

shipImg.onload = () => { imagesLoaded++}
ship2Img.onload = () => { imagesLoaded++}

// 定義太空船物件
const ship = {
  x: canvas.width / 2, // 太空船初始 X 座標在中間
  y: canvas.height - 100, // 太空船初始 Y 座標靠下
  width: 60, // 太空船寬度
  height:90, // 太空船高度
  speed: 5 // 太空船移動速度
};

// 定義子彈陣列
let bullets = []; // 儲存目前所有子彈

// 定義敵人陣列
let enemies = []; // 儲存目前所有敵人

// 定義分數
let score = 0; // 初始分數為 0

// 定義遊戲狀態
let isGameOver = false; // 是否遊戲結束

// 監聽鍵盤事件
let keys = {}; // 儲存按鍵狀態
document.addEventListener('keydown', e => { keys[e.code] = true; }); // 按下鍵
document.addEventListener('keyup', e => { keys[e.code] = false; }); // 放開鍵

// 太空船發射子彈
function shoot() {
  if(start){
    bullets.push({
      x: ship.x + ship.width / 2 - 4, // 子彈 X 座標，太空船正中間
      y: ship.y, // 子彈 Y 座標，太空船頂端
      width: 8, // 子彈寬度
      height: 16, // 子彈高度
      speed: 8 // 子彈速度
    });
  }
}

// 生成敵人
function spawnEnemy() {
  const enemyWidth = 54; // 敵人寬度
  //訂定速度
  if(Level<5){
    Rspeed = Level + Math.random() * Level/2 // 敵人速度隨機
  }else{
    Rspeed = 10 //敵人速度固定
  }
  enemies.push({
    x: Math.random() * (canvas.width - enemyWidth), // 敵人 X 座標隨機
    y: -40, // 敵人 Y 座標在螢幕外
    width: enemyWidth, // 敵人寬度
    height: 81, // 敵人高度
    speed: Rspeed //敵人速度
  });
}

//檢查子彈碰撞
function isCollide(a, b) {
  // 判斷兩個矩形是否重疊
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// 檢查太空船碰撞
function pixelCollisionCanvas(ctx, a, b) {
    // 計算兩個區域重疊的座標與大小
    const overlapX = Math.max(a.x, b.x);
    const overlapY = Math.max(a.y, b.y);
    const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - overlapX;
    const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - overlapY;

    // 如果沒有重疊，直接回傳 false
    if (overlapWidth <= 0 || overlapHeight <= 0) return false;

    // 從主 canvas 取得重疊區域的像素資料
    const data = ctx.getImageData(overlapX, overlapY, overlapWidth, overlapHeight).data;
    console.log(data)
    // 檢查每個像素的 alpha 是否同時存在
    // 假設 a 和 b 是不同顏色區域，這裡簡單判斷 alpha > 0 就視為有像素
    for (let i = 3; i < aData.length; i += 4) {
        if (aData[i] > 0 && bData[i] > 0) {
            return true; // 兩張圖對應像素都不透明才算碰撞
        }
    }

    return false; // 沒有像素重疊 → 沒碰撞
}

// 主遊戲迴圈
function gameLoop() {
  if (isGameOver) { // 如果遊戲結束
    ctx.fillStyle = 'white'; // 設定文字顏色
    ctx.font = '36px Arial'; // 設定字型
    ctx.fillText('遊戲結束', canvas.width / 2 - 90, canvas.height / 2); // 顯示遊戲結束
    ctx.font = '24px Arial'; // 設定字型
    ctx.fillText('分數: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 40); // 顯示分數
    return; // 結束迴圈
  }

  // 清空畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清理畫布

  // 處理太空船移動
  if (keys['ArrowLeft']) ship.x -= ship.speed; // 左鍵按下
  if (keys['ArrowRight']) ship.x += ship.speed; // 右鍵按下
  if (keys['Space']) { // 空白鍵按下
    if (!keys['_lastShot'] || Date.now() - keys['_lastShot'] > 250) { // 控制射擊間隔
      shoot();
      keys['_lastShot'] = Date.now();
    }
  }
  // 限制太空船不超出邊界
  ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x)); // X 座標限制

  // 繪製太空船
  //ctx.fillStyle = 'blue'; // 太空船顏色
  //ctx.fillRect(ship.x, ship.y, ship.width, ship.height); // 畫太空船
  ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  // 更新並繪製子彈
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed; // 子彈向上移動
    ctx.fillStyle = 'yellow'; // 子彈顏色
    ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height); // 畫子彈

    // 子彈超出畫面移除
    if (bullets[i].y + bullets[i].height < 0) bullets.splice(i, 1);
  }

  // 生成敵人
    if (Math.random() < 0.03 && enemies.length<Math.floor(Level*1.5)+2) spawnEnemy(); // 隨機生成敵人

  // 更新並繪製敵人
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed; // 敵人向下移動
    //ctx.fillStyle = 'red'; // 敵人顏色
    //ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height); // 畫敵人
    ctx.drawImage(ship2Img,enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
    // 檢查敵人是否與太空船碰撞
    if (pixelCollisionCanvas( ctx, ship, enemies[i])) {
      isGameOver = true; // 遊戲結束
    }

    // 檢查敵人是否被子彈擊中
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (isCollide(enemies[i], bullets[j])) {
        enemies.splice(i, 1); // 移除敵人
        bullets.splice(j, 1); // 移除子彈
        score += 10; // 分數加 10
        break; // 跳出內迴圈
      }
    }

    // 敵人超出畫面移除
    if (enemies[i] && enemies[i].y > canvas.height) enemies.splice(i, 1);
  }

  // 顯示分數
  ctx.fillStyle = 'white'; // 設定分數顏色
  ctx.font = '20px Arial'; // 設定分數字型
  Level=1+Math.floor(score/100)
  ctx.fillText('Level: ' + Level, 10,50)
  ctx.fillText('分數: ' + score, 10, 30); // 顯示分數
  
  if(keys['ArrowUp']) score += 10//測試用
  // 要求下一幀
  requestAnimationFrame(gameLoop); // 進入下一次迴圈
}

// 開始遊戲
//if (keys['Space'] && !start){
//  start=true
//  gameLoop(); // 啟動主迴圈
//}
document.addEventListener('keydown', function (e){
  if (e.code === 'Space' && !start && imagesLoaded == 2) {
    $('#space').hide()
    start = true;
    gameLoop();
  }
});
