export type FireCell = {
  row: number;
  col: number;
  bounds: {
    top_left: [number, number];
    top_right: [number, number];
    bottom_left: [number, number];
    bottom_right: [number, number];
  };
};
