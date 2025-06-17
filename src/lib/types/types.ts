// types.ts - Type definitions for the CSS editor

export interface CssRule {
  id: string;
  selector: string;
  declarations: CssDeclaration[];
}

export interface CssDeclaration {
  property: string;
  value: string;
}

export interface CssData {
  customCss: string;
}