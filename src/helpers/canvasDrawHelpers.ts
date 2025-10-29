import { directionAngles, playerNamesHelper } from '../config/config';
import { getPlayerRingGeometry } from '../utils/playerGeometryUtils';
import { BaseObject } from '../types/types';

export function drawPlayerRing(ctx: CanvasRenderingContext2D, obj: BaseObject) {
  const frameIndex = obj.imageFrame ?? 0;
  const playerDir = playerNamesHelper[frameIndex] || 'player-run-front';
  const { centerX, centerY, radiusX, radiusY } = getPlayerRingGeometry(obj);

  // === Draw elliptical ring ===
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
  ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
  ctx.stroke();
  ctx.fill();
  ctx.restore();

  // === Draw direction arrow ===
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(1, radiusY / radiusX); // flatten to match ellipse

  const angle = directionAngles[playerDir];
  const arrowRadius = radiusX;
  const baseRadius = 12;
  const baseAngleLeft = angle + Math.PI * 0.6;
  const baseAngleRight = angle - Math.PI * 0.6;

  ctx.beginPath();
  ctx.moveTo(arrowRadius * Math.cos(angle), arrowRadius * Math.sin(angle));
  ctx.lineTo(
    (arrowRadius - baseRadius) * Math.cos(baseAngleLeft),
    (arrowRadius - baseRadius) * Math.sin(baseAngleLeft)
  );
  ctx.lineTo(
    (arrowRadius - baseRadius) * Math.cos(baseAngleRight),
    (arrowRadius - baseRadius) * Math.sin(baseAngleRight)
  );
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 238, 0, 1)';
  ctx.fill();

  ctx.restore();
}

export function drawCircleOutline(ctx: CanvasRenderingContext2D, obj: BaseObject) {
  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, (obj.radius ?? 0) + 5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

export function drawObject(ctx: CanvasRenderingContext2D, obj: BaseObject, playerFrames: HTMLImageElement[]) {
  ctx.save();
  ctx.fillStyle = obj.color;
  ctx.beginPath();

  if (obj.type === 'circle' && obj.radius) {
    ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
    ctx.fill();
  } else if (obj.type === 'player') {
    const frame = playerFrames[obj.imageFrame ?? 0];
    ctx.drawImage(frame, obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
  }

  ctx.restore();
}
