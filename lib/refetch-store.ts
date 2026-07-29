import { createPendingStore } from "./pending-store";

// Same-page data refetches — search, sort and filter changes — surfaced as a
// skeleton in place of the result list. Separate from routeProgress so a filter
// change shows a skeleton without also flashing the full-page navigation bar.
export const refetchStore = createPendingStore();
