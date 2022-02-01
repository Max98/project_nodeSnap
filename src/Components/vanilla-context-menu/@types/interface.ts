// ? core options are like default options, but they are not ment to be over written
export interface Options {
  transformOrigin: [string, string]; // ? ex top left
  transitionDuration: number;
  theme: "black" | "white";
  scope: HTMLElement;
  menuItems: MenuItem[];
  customClass?: string;
  customThemeClass?: string;
  preventCloseOnClick?: boolean; // ? default will be false - global value for all menu items
}

export interface MenuOption {
  label: string;
  callback?: (event: any) => any;
  preventCloseOnClick?: boolean; // ? default will be false - individual value for each item (it will over write the global value if any)
}

export type MenuItem = MenuOption | "hr";
