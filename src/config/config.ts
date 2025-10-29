import { ObjectSize } from '../types/types';

export const CANVAS_WIDTH_INIT = 1100;
export const CANVAS_HEIGHT_INIT = 750;

export const DEBOUNCE = 10;

export const DURATION = 5; // seconds
export const FORMAT = 'mp4';
export const DEFAULT_SIZE: ObjectSize = 3;
export const STEP_SIZE = 12;
export const STEP_SIZE_RADIUS = 6;
export const RADIUS_INIT = STEP_SIZE_RADIUS * DEFAULT_SIZE;
export const WIDTH_INIT = STEP_SIZE * DEFAULT_SIZE;
export const HEIGHT_INIT = STEP_SIZE * DEFAULT_SIZE * 1.2;

export const PLAYER_DIRECTIONS = [
  { frame: 'player-run-left', angle: Math.PI },
  { frame: 'player-run-back-left', angle: (-3 * Math.PI) / 4 },
  { frame: 'player-run-back', angle: -Math.PI / 2 },
  { frame: 'player-run-back-right', angle: -Math.PI / 4 },
  { frame: 'player-run-right', angle: 0 },
  { frame: 'player-run-front-right', angle: Math.PI / 4 },
  { frame: 'player-run-front', angle: Math.PI / 2 },
  { frame: 'player-run-front-left', angle: (3 * Math.PI) / 4 },
] as const;

// ✅ Derived helpers
export const directions = PLAYER_DIRECTIONS.map((d, index) => ({ ...d, index }));

export const directionAngles = Object.fromEntries(PLAYER_DIRECTIONS.map(({ frame, angle }) => [frame, angle]));

export const playerNamesHelper = PLAYER_DIRECTIONS.map((d) => d.frame);
