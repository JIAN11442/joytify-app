enum ArrangementOptions {
  GRID = "grid",
  LIST = "list",
  COMPACT = "compact",
}

export type ArrangementType =
  (typeof ArrangementOptions)[keyof typeof ArrangementOptions];

export default ArrangementOptions;
