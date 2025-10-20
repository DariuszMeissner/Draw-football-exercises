export interface Keyframe {
  time: number; // seconds
  x: number;
  y: number;
}

export interface BaseObject {
  id: number;
  name: string;
  type: 'circle' | 'rectangle';
  x: number;
  y: number;
  color: string;
  radius?: number;
  width?: number;
  height?: number;
  keyframes: Keyframe[];
  hidden?: boolean;
}

export interface ActiveKeyframe {
  objId: number;
  keyIndex: number;
}
