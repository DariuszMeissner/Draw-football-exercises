import { BaseObject } from '../types/types';

export const getPlayerRingGeometry = (
  obj: BaseObject
): { centerX: number; centerY: number; radiusX: number; radiusY: number; width?: number; height?: number } => {
  const width = obj.width ?? 60;
  const height = obj.height ?? 80;

  return {
    centerX: obj.x,
    centerY: obj.y + height / 2,
    radiusX: width / 2 + 7,
    radiusY: height / 2,
  };
};
