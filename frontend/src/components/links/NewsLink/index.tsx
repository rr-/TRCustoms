import { Link } from "react-router-dom";
import { ConditionalWrapper } from "src/components/common/ConditionalWrapper";
import { Markdown } from "src/components/markdown/Markdown";
import type { NewsListing } from "src/services/NewsService";
import { formatDate } from "src/utils/string";

interface NewsLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  news: NewsListing;
  children?: React.ReactNode | undefined;
}

const NewsLink = ({ news, children, ...props }: NewsLinkProps) => {
  const { id, created, subject } = news;

  return (
    <ConditionalWrapper
      condition={!!id}
      wrapper={(children) => (
        <Link to={`/news/${id}`} {...props}>
          {children}
        </Link>
      )}
    >
      {children ? (
        children
      ) : (
        <>
          {formatDate(created)}: <Markdown>{subject || ""}</Markdown>
        </>
      )}
    </ConditionalWrapper>
  );
};

export { NewsLink };
