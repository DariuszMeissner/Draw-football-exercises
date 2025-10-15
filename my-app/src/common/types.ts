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
}

export interface Keyframe {
  time: number; // seconds
  x: number;
  y: number;
}
