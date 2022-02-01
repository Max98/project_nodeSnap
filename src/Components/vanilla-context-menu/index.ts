/**
 * https://github.com/Merujan99/vanilla-context-menu
 *
 * Edited to suit nodeSnap's needs.
 */

/**
 * * Types
 */
import { MenuItem, Options } from "./@types/interface";

interface State {
  menuItems: MenuItem[];
}

export default class ContextMenu {
  // * private vars
  private state: State = { menuItems: [] }; // ? state for pug template
  private options: Options;
  private isVisible: boolean = false;

  constructor(event: any, menuItems: MenuItem[]) {
    this.options = {
      transformOrigin: ["top", "left"],
      theme: "black",
      transitionDuration: 200,
      scope: document.body,
      menuItems: menuItems,
    };

    this.state.menuItems = this.options.menuItems;

    this.onShowContextMenu(event);

    // ? add a click event listener to create a modal effect for the context menu and close it if the user clicks outside of it
    document.addEventListener("mouseup", (e) => this.onDocumentClick(e));
  }

  /**
   * * Public methods (API)
   */

  /**
   * * Remove all the event listeners that were registered for this feature
   */
  public off(): void {
    document.removeEventListener("mouseup", (e) => this.onDocumentClick(e));
  }

  /**
   * * Private methods
   */

  /**
   * * Interpolate the state variables inside the pug element and create an HTML Element
   */
  private buildContextMenu(): HTMLElement {
    const wrapper: HTMLElement = document.createElement("div");

    let loop = "";

    this.state.menuItems.forEach((el) => {
      if (el == "hr") loop += `<hr />`;
      else {
        loop += `
        <div>
          <span>${el.label}</span>
        </div>`;
      }
    });

    wrapper.innerHTML = `<div id="editorContextMenu" class="context-menu">${loop}</div>`;

    const contextMenu: HTMLElement = wrapper.children[0] as HTMLElement;

    return contextMenu;
  }

  /**
   * * Normalize the context menu position so that it won't get out of bounds
   * @param mouseX
   * @param mouseY
   * @param contextMenu
   */
  private normalizePozition(
    mouseX: number,
    mouseY: number,
    contextMenu: HTMLElement
  ): { normalizedX: number; normalizedY: number } {
    const scope: HTMLElement = this.options.scope;

    // ? compute what is the mouse position relative to the container element (scope)
    const { left: scopeOffsetX, top: scopeOffsetY } =
      scope.getBoundingClientRect();

    const scopeX: number = mouseX - scopeOffsetX;
    const scopeY: number = mouseY - scopeOffsetY;

    // ? check if the element will go out of bounds
    const outOfBoundsOnX: boolean =
      scopeX + contextMenu.clientWidth > scope.clientWidth;

    const outOfBoundsOnY: boolean =
      scopeY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX: number = mouseX;
    let normalizedY: number = mouseY;

    // ? normalzie on X
    if (outOfBoundsOnX) {
      normalizedX = scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
    }

    // ? normalize on Y
    if (outOfBoundsOnY) {
      normalizedY =
        scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
    }

    return { normalizedX, normalizedY };
  }

  private removeExistingContextMenu(): void {
    this.isVisible = false;
    document.querySelector(`#editorContextMenu`)?.remove();
    this.off();
  }

  // *
  private applyStyleOnContextMenu(
    contextMenu: HTMLElement,
    outOfBoundsOnX: boolean,
    outOfBoundsOnY: boolean
  ): void {
    // ? transition duration
    contextMenu.style.transitionDuration = `${this.options.transitionDuration}ms`;

    // ? set the transition origin based on it's position
    const transformOrigin: [string, string] = Array.from(
      this.options.transformOrigin
    ) as [string, string];

    outOfBoundsOnX && (transformOrigin[1] = "right");
    outOfBoundsOnY && (transformOrigin[0] = "bottom");

    contextMenu.style.transformOrigin = transformOrigin.join(" ");
  }

  private bindCallbacks(
    contextMenu: HTMLElement,
    mouseX: any,
    mouseY: any
  ): void {
    this.options.menuItems.forEach((menuItem: MenuItem, index: number) => {
      if (menuItem === "hr") {
        return;
      }

      const htmlEl: HTMLElement = contextMenu.children[index] as HTMLElement;

      htmlEl.onclick = (e) => {
        if (menuItem.callback && typeof menuItem.callback == "function")
          menuItem.callback(e);

        // ? global value for all menu items, or the individual option or false
        const preventCloseOnClick: boolean =
          menuItem.preventCloseOnClick ??
          this.options.preventCloseOnClick ??
          false;

        if (!preventCloseOnClick) {
          this.removeExistingContextMenu();
        }
      };
    });
  }

  // *
  private onShowContextMenu(event: MouseEvent): void {
    event.preventDefault();

    // ? the current context menu should disappear when a new one is displayed
    this.removeExistingContextMenu();

    // ? build and show on ui
    const contextMenu: HTMLElement = this.buildContextMenu();
    document.querySelector("body")?.append(contextMenu);

    // ? set the position
    const { clientX: mouseX, clientY: mouseY } = event;

    const { normalizedX, normalizedY } = this.normalizePozition(
      mouseX,
      mouseY,
      contextMenu
    );

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    // ? apply the css configurable style
    this.applyStyleOnContextMenu(
      contextMenu,
      mouseX !== normalizedX,
      mouseY !== normalizedY
    );

    // ? disable context menu for it
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    // ? bind the callbacks on each option
    this.bindCallbacks(contextMenu, mouseX, mouseY);

    // ? make it visible but wait an event loop to pass
    setTimeout(() => {
      contextMenu.classList.add("visible");
      this.isVisible = true;
    });
  }

  /**
   * * Used to determine if the user has clicked outside of the context menu and if so to close it
   * @param event
   */
  private onDocumentClick(event: MouseEvent): void {
    const clickedTarget: HTMLElement = event.target as HTMLElement;

    if (!this.isVisible) return;

    if (clickedTarget.closest(`#editorContextMenu`)) {
      return;
    }
    this.removeExistingContextMenu();
  }
}
