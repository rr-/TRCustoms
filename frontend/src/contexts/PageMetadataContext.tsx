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
    set((state) => ({ ...state, metadata }));
  },
}));

const usePageMetadata = (callback: () => PageMetadata, deps: any[]) => {
  const update = usePageMetadataStore((state) => state.update);
  /* eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => update(callback()), [callback, update, ...deps]);
  /* eslint-enable react-hooks/exhaustive-deps*/
};

export type { PageMetadata };
export { usePageMetadata, usePageMetadataStore };
