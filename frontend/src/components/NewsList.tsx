import "./NewsList.css";
import { useState } from "react";
import { DataList } from "src/components/DataList";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { UserPicture } from "src/components/UserPicture";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { NewsListing } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import type { NewsSearchQuery } from "src/services/NewsService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

const getNewsSearchQuery = (): NewsSearchQuery => ({
  page: null,
  sort: "-created",
  search: "",
});

interface NewsViewProps {
  news: NewsListing;
}

const NewsView = ({ news }: NewsViewProps) => {
  const classNames = ["News"];

  return (
    <div className={classNames.join(" ")}>
      {news.subject && (
        <header className="News--header">
          <h3>
            <Markdown>{news.subject}</Markdown>
          </h3>
        </header>
      )}

      <div className="News--content">
        <Markdown>{news.text || "No news text is available."}</Markdown>
      </div>

      <footer className="News--footer">
        <div className="News--footerInfo">
          {news.authors.map((author) => (
            <UserLink key={author.id} className="News--userLink" user={author}>
              <>
                <UserPicture className="News--userPic" user={author} />
                {author.username}
              </>
            </UserLink>
          ))}

          <span>Posted on: {formatDate(news.created)}</span>
        </div>

        <div className="News--footerButtons">
          <PermissionGuard require={UserPermission.editNews}>
            <PushButton to={`/news/${news.id}/edit`}>Edit news</PushButton>
          </PermissionGuard>
        </div>
      </footer>
    </div>
  );
};

const NewsList = () => {
  const [searchQuery, setSearchQuery] = useState<NewsSearchQuery>(
    getNewsSearchQuery()
  );

  return (
    <DataList
      queryName="newsList"
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchFunc={NewsService.searchNews}
      itemKey={(news: NewsListing) => news.id.toString()}
      itemView={(news: NewsListing) => <NewsView news={news} />}
    />
  );
};

export { NewsList };
