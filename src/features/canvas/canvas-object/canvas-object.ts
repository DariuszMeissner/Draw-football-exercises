import { TYPES } from "../enums";
import { CanvasObjectInterface, BaseDrawOptionsInterface } from "./type";

export class CanvasObject<T extends BaseDrawOptionsInterface> implements CanvasObjectInterface<T> {
  options: T = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  } as T;

  private type = TYPES.RECT;

  constructor(options: T) {
    this.options = { ...options };
  }

  getOptions(): T {
    return this.options;
  }

  setOptions(options: T): void {
    this.options = { ...this.options, options };
  }

  getXY(): number[] {
    return [this.options.x, this.options.y];
  }

  setXY(x: number, y: number): void {
    this.options.x = x;
    this.options.y = y;
  }

  setWidthHeight(width: number, height: number): void {
    this.options.w = width;
    this.options.h = height;
  }

  getWidthHeight(): number[] {
    return [this.options.w, this.options.h];
  }

  move(movementX: number, movementY: number): void {
    const { x, y } = this.options;
    const layerX = x + movementX;
    const layerY = y + movementY;

    this.setXY(layerX, layerY);
  }

  setType(type: TYPES): void {
    this.type = type;
  }

  getType(): TYPES {
    return this.type;
  }
}
