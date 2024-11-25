import create from "zustand";

interface ScrollStore {
  shouldScroll: boolean;
  setShouldScroll: (shouldScroll: boolean) => void;
}

const useScrollStore = create<ScrollStore>((set) => ({
  shouldScroll: true,
  setShouldScroll: (value) => set({ shouldScroll: value }),
}));

export { useScrollStore };
