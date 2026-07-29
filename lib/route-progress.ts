import { createPendingStore } from "./pending-store";

// Whole-page navigations, surfaced as the top bar + spinner pill.
export const routeProgress = createPendingStore();
