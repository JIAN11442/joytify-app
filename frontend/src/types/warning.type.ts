import { WarningOptions } from "../constants/warning.constant";

export type WarningType = (typeof WarningOptions)[keyof typeof WarningOptions];
