export interface CanvasObjectInterface<T> {
  getOptions(): T;
  setOptions(options: T): void;

  getXY(): number[];
  setXY(x: number, y: number): void;

  getWidthHeight(): number[];
  setWidthHeight(width: number, height: number): void;

  move(movementX: number, movementY: number): void;

  getType(): string;
  setType(type: string): void;
}

export interface BaseDrawOptionsInterface {
  x: number;
  y: number;
  w: number;
  h: number;
}
