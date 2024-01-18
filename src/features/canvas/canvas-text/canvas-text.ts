import { CanvasObject } from "../canvas-object/canvas-object";
import { TYPES } from "../enums";
import { CanvasTextInterface, TextDrawOptionsInterface } from "./type";

export class CanvasText
  extends CanvasObject<TextDrawOptionsInterface>
  implements CanvasTextInterface
{
  private textOptions = {
    size: 0,
    color: "#000",
    text: "title",
  };

  constructor(options: TextDrawOptionsInterface) {
    super(options);
    this.setType(TYPES.TEXT);
  }

  setColor(color: string): void {
    this.textOptions.color = color;
  }

  getColor(): string {
    return this.textOptions.color;
  }

  getSize(): number {
    return this.textOptions.size;
  }

  setSize(size: number): void {
    this.textOptions.size = size;
  }

  setText(text: string): void {
    this.textOptions.text = text;
  }

  getText(): string {
    return this.textOptions.text;
  }
}
