import { SongLoopOptions } from "../constants/loop-mode.constant";

export type SongLoopType = (typeof SongLoopOptions)[keyof typeof SongLoopOptions];
