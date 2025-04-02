import { ArrangementOptions } from "../constants/arrangement.constant";

export type ArrangementType = (typeof ArrangementOptions)[keyof typeof ArrangementOptions];
