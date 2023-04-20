import { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  const baseUrl = process.env.REACT_APP_HOST_SITE;
  const imageUrl = baseUrl ? new URL(image || BASE_IMAGE, baseUrl).href : null;

  return (
    <Helmet>
      <title>{title ? `${BASE_TITLE} - ${title}` : BASE_TITLE}</title>
      <meta name="description" content={description || BASE_DESCRIPTION} />
      {!!imageUrl && <meta name="og:image" content={imageUrl} />}
    </Helmet>
  );
};

export { PageMetadata };
