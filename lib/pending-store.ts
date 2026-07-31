export const createPendingStore = () => {
  let pending = 0;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    start() {
      pending += 1;
      emit();
    },
    stop() {
      pending = Math.max(0, pending - 1);
      emit();
    },
    reset() {
      if (pending === 0) return;
      pending = 0;
      emit();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isPending: () => pending > 0,
    serverSnapshot: () => false,
  };
};
