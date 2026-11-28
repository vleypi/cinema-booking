export interface IMote {
  path: number;
  angleShare: number;
  speed: number;
  phase: number;
  isBig: boolean;
  pushX: number;
  pushY: number;
}

export interface IBeam {
  apexX: number;
  apexY: number;
  length: number;
  cell: number;
  width: number;
  height: number;
}

export interface IPointer {
  x: number;
  y: number;
  isInside: boolean;
}
