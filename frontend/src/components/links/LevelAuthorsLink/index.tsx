import { Fragment } from "react";
import { UserLink } from "src/components/links/UserLink";
import type { UserNested } from "src/services/UserService";

const MAX_LISTED_AUTHORS = 3;

interface LevelAuthorsLinkProps {
  authors: UserNested[];
}

const LevelAuthorsLink = ({ authors }: LevelAuthorsLinkProps) => {
  if (authors.length > MAX_LISTED_AUTHORS) {
    return (
      <span title={authors.map((author) => author.username).join(", ")}>
        Multiple authors
      </span>
    );
  }

  if (authors.length) {
    return (
      <>
        {authors.map((author, i) => (
          <Fragment key={author.id}>
            {i > 0 && ", "}
            <UserLink user={author} />
          </Fragment>
        ))}
      </>
    );
  }

  return <>Unknown</>;
};

export { LevelAuthorsLink };
