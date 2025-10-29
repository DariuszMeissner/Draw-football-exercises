import { directions } from '../config/config';
import { BaseObject, PlayerFrameName } from '../types/types';
import { getPlayerRingGeometry } from '../utils/playerGeometryUtils';

export const normalizeAngle = (a: number) => {
  let angle = a;
  while (angle <= -Math.PI) angle += 2 * Math.PI;
  while (angle > Math.PI) angle -= 2 * Math.PI;
  return angle;
};

export const findClosestFrame = (angle: number): { frameName: PlayerFrameName; imageFrame: number } => {
  const norm = normalizeAngle(angle);
  let best = directions[0];
  let bestDist = Math.abs(normalizeAngle(norm - best.angle));
  for (let i = 1; i < directions.length; i++) {
    const d = Math.abs(normalizeAngle(norm - directions[i].angle));
    if (d < bestDist) {
      bestDist = d;
      best = directions[i];
    }
  }
  return { frameName: best.frame, imageFrame: best.index };
};

export const isClickOnRing = (x: number, y: number, obj: BaseObject) => {
  const { centerX, centerY, radiusX, radiusY } = getPlayerRingGeometry(obj);

  const inner = 0.4;
  const outer = 1.2;

  const dx = x - centerX;
  const dy = y - centerY;

  const ellipseDist = Math.sqrt((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY));

  return ellipseDist >= inner && ellipseDist <= outer;
};

export const getClickedObject = (x: number, y: number, layers: BaseObject[]) => {
  const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  for (let i = layers.length - 1; i >= 0; i--) {
    const obj = layers[i];

    if (obj.type === 'circle' && obj.radius) {
      if (distance(x, y, obj.x, obj.y) <= obj.radius) return obj.id;
    }

    if (obj.type === 'player' && obj.width && obj.height) {
      if (
        x >= obj.x - obj.width / 2 &&
        x <= obj.x + obj.width / 2 &&
        y >= obj.y - obj.height / 2 &&
        y <= obj.y + obj.height / 2
      )
        return obj.id;
    }
  }
  return null;
};
