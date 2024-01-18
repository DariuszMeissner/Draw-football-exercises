import { BaseDrawOptionsInterface } from "../canvas-object/type";

export interface CanvasTextInterface {
  setColor(color: string): void;
  getColor(): string;

  setSize(size: number): void;
  getSize(): number;

  getText(): string;
  setText(text: string): void;
}

export interface TextDrawOptionsInterface extends BaseDrawOptionsInterface {
  text: string;
  color: string;
  size: number;
}
