import { MutationKey, QueryKey } from "../constants/query-client-key.constant";

export type MutationKeyType = (typeof MutationKey)[keyof typeof MutationKey];
export type QueryKeyType = (typeof QueryKey)[keyof typeof QueryKey];
