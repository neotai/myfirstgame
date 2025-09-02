// Pixel-perfect 碰撞判定（安全版）
function pixelCollisionCanvasSafe(aImg, aPos, bImg, bPos) {
    // 計算重疊區域
    const overlapX = Math.max(aPos.x, bPos.x);
    const overlapY = Math.max(aPos.y, bPos.y);
    const overlapWidth = Math.min(aPos.x + aPos.width, bPos.x + bPos.width) - overlapX;
    const overlapHeight = Math.min(aPos.y + aPos.height, bPos.y + bPos.height) - overlapY;

    // 無重疊直接回傳 false
    if (overlapWidth <= 0 || overlapHeight <= 0) return false;

    // 如果重疊寬高為 0，也回傳 false
    if (overlapWidth <= 0 || overlapHeight <= 0) return false;

    // 建立暫存 canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = overlapWidth;
    tempCanvas.height = overlapHeight;
    const tctx = tempCanvas.getContext('2d');

    // 繪製 a 圖片到暫存 canvas
    tctx.clearRect(0, 0, overlapWidth, overlapHeight);
    tctx.drawImage(
        aImg,
        overlapX - aPos.x, overlapY - aPos.y, aPos.width, aPos.height,
        0, 0, overlapWidth, overlapHeight
    );
    const aData = tctx.getImageData(0, 0, overlapWidth, overlapHeight).data;

    // 繪製 b 圖片到暫存 canvas
    tctx.clearRect(0, 0, overlapWidth, overlapHeight);
    tctx.drawImage(
        bImg,
        overlapX - bPos.x, overlapY - bPos.y, bPos.width, bPos.height,
        0, 0, overlapWidth, overlapHeight
    );
    const bData = tctx.getImageData(0, 0, overlapWidth, overlapHeight).data;

    // 檢查像素 alpha 是否同時存在
    for (let i = 3; i < aData.length; i += 4) {
        if (aData[i] > 0 && bData[i] > 0) return true;
    }

    return false;
}
