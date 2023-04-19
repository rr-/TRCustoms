import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { usePageMetadataStore } from "src/contexts/PageMetadataContext";

const BASE_TITLE = "TRCustoms";

const PageMetadata = () => {
  const { title, ready, description, image } = usePageMetadataStore(
    (state) => state.metadata
  );

  useEffect(() => {
    (window as any).prerenderReady = ready;
  }, [ready]);

  const baseUrl = process.env.REACT_APP_HOST_SITE;
  const imageUrl = image && baseUrl ? new URL(image, baseUrl).href : null;

  return (
    <Helmet>
      <title>{title ? `${BASE_TITLE} - ${title}` : BASE_TITLE}</title>
      {!!description && <meta name="description" content={description} />}
      {!!imageUrl && <meta name="og:image" content={imageUrl} />}
    </Helmet>
  );
};

export { PageMetadata };
