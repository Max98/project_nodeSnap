import { Vector2 } from "three";
import { SelectionBox } from "./js/SelectionBox";

export default class SelectionHelper {
  private element: HTMLDivElement;

  public isDown: boolean;
  public isDisabled = false;

  private pointBottomRight: Vector2;
  private pointTopLeft: Vector2;
  private startPoint: Vector2;

  private canvas: HTMLCanvasElement;

  private selectionBox: SelectionBox;

  constructor(
    _canvas: HTMLCanvasElement,
    _camera: THREE.Camera,
    _scene: THREE.Scene
  ) {
    this.element = document.createElement("div");
    this.element.classList.add("selectBox");
    this.element.style.pointerEvents = "none";

    this.startPoint = new Vector2();
    this.pointTopLeft = new Vector2();
    this.pointBottomRight = new Vector2();

    this.isDown = false;

    this.canvas = _canvas;

    this.selectionBox = new SelectionBox(_camera, _scene);

    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
  }

  private onMouseDown(e: MouseEvent) {
    if (this.isDisabled) return;
    if (e.button != 0) return;

    this.isDown = true;
    this.onSelectStart(e);
    console.log("START");

    if (e.button != 0) return;

    this.selectionBox.startPoint.set(
      (e.offsetX / this.canvas.width) * 2 - 1,
      -(e.offsetY / this.canvas.height) * 2 + 1,
      0.5
    );
  }

  private onMouseMove(e: MouseEvent) {
    if (this.isDisabled) return;

    if (this.isDown) {
      this.onSelectMove(e);
      this.selectionBox.endPoint.set(
        (e.offsetX / this.canvas.width) * 2 - 1,
        -(e.offsetY / this.canvas.height) * 2 + 1,
        0.5
      );

      const allSelected = this.selectionBox.select();
    }
  }

  private onMouseUp(e: MouseEvent) {
    if (this.isDisabled) return;

    this.isDown = false;
    this.onSelectOver();

    this.selectionBox.endPoint.set(
      (e.offsetX / this.canvas.width) * 2 - 1,
      -(e.offsetY / this.canvas.height) * 2 + 1,
      0.5
    );

    console.log(this.selectionBox.select());
    // selectionBox.select();
  }

  public getSelected() {
    return this.selectionBox.select();
  }

  onSelectStart(event: MouseEvent) {
    this.canvas.parentElement?.appendChild(this.element);

    this.element.style.left = event.clientX + "px";
    this.element.style.top = event.clientY + "px";
    this.element.style.width = "0px";
    this.element.style.height = "0px";

    this.startPoint.x = event.clientX;
    this.startPoint.y = event.clientY;
  }

  onSelectMove(event: MouseEvent) {
    this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
    this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
    this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
    this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);

    this.element.style.left = this.pointTopLeft.x + "px";
    this.element.style.top = this.pointTopLeft.y + "px";
    this.element.style.width =
      this.pointBottomRight.x - this.pointTopLeft.x + "px";
    this.element.style.height =
      this.pointBottomRight.y - this.pointTopLeft.y + "px";
  }

  onSelectOver() {
    this.element.parentElement?.removeChild(this.element);
  }
}
