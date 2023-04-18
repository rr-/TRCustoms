import { useEffect } from "react";

const BASE_TITLE = "TRCustoms";

interface PageMetadata {
  ready: boolean;
  title: string | null | undefined;
}

const usePageMetadata = (callback: () => PageMetadata, deps: any[]) => {
  /* eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => {
    const { ready, title } = callback();
    if (title) {
      document.title = `${BASE_TITLE} - ${title}`;
    } else {
      document.title = BASE_TITLE;
    }
    window.setTimeout(() => {
      (window as any).prerenderReady = ready;
    }, 100);
  }, [callback, ...deps]);
  /* eslint-enable react-hooks/exhaustive-deps*/
};

export type { PageMetadata };
export { usePageMetadata };
