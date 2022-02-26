import { UserLink } from "src/components/links/UserLink";
import type { UserNested } from "src/services/UserService";

interface LevelAuthorsLinkProps {
  authors: UserNested[];
}

const LevelAuthorsLink = ({ authors }: LevelAuthorsLinkProps) => {
  if (authors.length > 1) {
    return (
      <span title={authors.map((author) => author.username).join(", ")}>
        Multiple authors
      </span>
    );
  }

  if (authors.length === 1) {
    return <UserLink user={authors[0]} />;
  }

  return <>Unknown</>;
};

export { LevelAuthorsLink };
