import { CanvasObjectInterface } from "../canvas-object/type";

export interface LayerInterface {
  isPointInside(pointX: number, pointY: number): boolean;

  setActive(state: boolean): void;

  isActive(): boolean;

  addChild(child: CanvasObjectInterface<any>): void;

  getChildren(): CanvasObjectInterface<any>[];
}
