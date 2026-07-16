import { useEffect } from "react";
import { create } from "zustand";

interface PageMetadata {
  ready: boolean;
  title: string | null | undefined;
  description?: string | null | undefined;
  image?: string | null | undefined;
}

interface PageMetadataStore {
  metadata: PageMetadata;
  update: (metadata: PageMetadata) => void;
}

const usePageMetadataStore = create<PageMetadataStore>((set, get) => ({
  metadata: {
    ready: false,
    title: "",
  },

  update: (metadata: PageMetadata): void => {
    set((state) => {
      // Pages call this from an effect that runs every render (they read query
      // data that loads asynchronously). Skip the state change when nothing
      // actually changed, so subscribers only re-render on real updates.
      const prev = state.metadata;
      if (
        prev.ready === metadata.ready &&
        prev.title === metadata.title &&
        prev.description === metadata.description &&
        prev.image === metadata.image
      ) {
        return state;
      }
      return { ...state, metadata };
    });
  },
}));

const usePageMetadata = (
  callback: () => PageMetadata,
  deps: React.DependencyList,
) => {
  const update = usePageMetadataStore((state) => state.update);
  /* eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => update(callback()), [callback, update, ...deps]);
  /* eslint-enable react-hooks/exhaustive-deps*/
};

export type { PageMetadata };
export { usePageMetadata, usePageMetadataStore };
