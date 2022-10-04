import { ConditionalWrapper } from "src/components/common/ConditionalWrapper";
import { Link } from "src/components/common/Link";
import { Markdown } from "src/components/markdown/Markdown";
import type { NewsListing } from "src/services/NewsService";

interface NewsLinkProps {
  news: NewsListing;
  children?: React.ReactNode | undefined;
}

const NewsLink = ({ news, children }: NewsLinkProps) => {
  const { id, subject } = news;

  return (
    <ConditionalWrapper
      condition={!!id}
      wrapper={(children) => <Link to={`/news/${id}`}>{children}</Link>}
    >
      {children || <Markdown>{subject || ""}</Markdown>}
    </ConditionalWrapper>
  );
};

export { NewsLink };
