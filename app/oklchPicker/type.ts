export interface LchValue {
    a: number;
    c: number;
    h: number;
    l: number;
  }
  
  export type OutputFormats =
    | 'figmaP3'
    | 'hex'
    | 'hex/rgba'
    | 'hsl'
    | 'lab'
    | 'lch'
    | 'lrgb'
    | 'numbers'
    | 'oklab'
    | 'p3'
    | 'rgb'
    ;
  
  export interface SupportValue {
    p3: boolean
    rec2020: boolean
  }