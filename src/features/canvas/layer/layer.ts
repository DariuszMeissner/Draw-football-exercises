import { CanvasObject } from "../canvas-object/canvas-object";
import { BaseDrawOptionsInterface, CanvasObjectInterface } from "../canvas-object/type";
import { LayerInterface } from "./type";

export class Layer extends CanvasObject<BaseDrawOptionsInterface> implements LayerInterface {
  private active = false;
  private children: Array<CanvasObjectInterface<BaseDrawOptionsInterface>> = [];

  setActive(state: boolean): void {
    this.active = state;
  }

  isActive(): boolean {
    return this.active;
  }

  addChild(child: CanvasObjectInterface<BaseDrawOptionsInterface>): void {
    this.children.push(child);
  }

  getChildren(): CanvasObjectInterface<any>[] {
    return this.children;
  }

  isPointInside(pointX: number, pointY: number, padding = 0) {
    const { x, y, w, h } = this.getOptions();

    return (
      pointX > x - padding &&
      pointX < x + w + padding &&
      pointY > y - padding &&
      pointY < y + h + padding
    );
  }

  move(movementX: number, movementY: number): void {
    super.move(movementX, movementY);
    this.moveChildrenAccordingly(movementX, movementY);
  }

  moveChildrenAccordingly(movementX: number, movementY: number) {
    for (const child of this.children) {
      child.move(movementX, movementY);
    }
  }
}
