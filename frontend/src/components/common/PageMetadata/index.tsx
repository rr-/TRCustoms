import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { usePageMetadataStore } from "src/contexts/PageMetadataContext";

const BASE_TITLE = "TRCustoms";
const BASE_DESCRIPTION =
  "A website dedicated to custom levels for classic Tomb Raider games.";
const BASE_IMAGE = "/logo.png";

const PageMetadata = () => {
  const { title, ready, description, image } = usePageMetadataStore(
    (state) => state.metadata
  );

  useEffect(() => {
    (window as any).prerenderReady = ready;
  }, [ready]);

  const baseUrl = import.meta.env.VITE_HOST_SITE;
  const imageUrl = baseUrl ? new URL(image || BASE_IMAGE, baseUrl).href : null;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title ? `${BASE_TITLE} - ${title}` : BASE_TITLE}</title>
        <meta name="description" content={description || BASE_DESCRIPTION} />
        {!!imageUrl && <meta name="og:image" content={imageUrl} />}
      </Helmet>
    </HelmetProvider>
  );
};

export { PageMetadata };
