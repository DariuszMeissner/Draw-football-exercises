export interface Keyframe {
  time: number; // seconds
  x: number;
  y: number;
}

export type ProjectMode = 'image' | 'animation';

export type ObjectSize = 1 | 2 | 3 | 4 | 5;

export type PlayerFrameName =
  | 'player-run-back'
  | 'player-run-back-left'
  | 'player-run-back-right'
  | 'player-run-front'
  | 'player-run-front-left'
  | 'player-run-front-right'
  | 'player-run-left'
  | 'player-run-right';

// Mapping to Polish labels for UI
export const PLAYER_FRAME_LABELS: Record<PlayerFrameName, string> = {
  'player-run-back': 'bieg-tył',
  'player-run-back-left': 'bieg-tył-lewo',
  'player-run-back-right': 'bieg-tył-prawo',
  'player-run-front': 'bieg-przód',
  'player-run-front-left': 'bieg-przód-lewo',
  'player-run-front-right': 'bieg-przód-prawo',
  'player-run-left': 'bieg-lewo',
  'player-run-right': 'bieg-prawo',
};

export type ObjectType = 'circle' | 'player';
export type Mode = 'pointer' | 'circle' | 'player';

export interface BaseObject {
  id: number;
  name: string;
  type: ObjectType;
  x: number;
  y: number;
  color: string;
  radius?: number;
  width: number;
  height: number;
  keyframes: Keyframe[];
  hidden?: boolean;
  imageFrame: number;
  size: number;
  frameName?: PlayerFrameName;
}

export interface ActiveKeyframe {
  objId: number;
  keyIndex: number;
}

export interface Project {
  version: number;
  backgroundColor: string;
  backgroundImage: string | undefined;
  objects: BaseObject[];
  lastId: number;
}
