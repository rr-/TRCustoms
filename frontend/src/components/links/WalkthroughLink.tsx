import { Link } from "react-router-dom";

interface WalkthroughLinkProps {
  walkthrough: {
    id: number;
    levelName: string;
  };
  children?: React.ReactNode | undefined;
}

const WalkthroughLink = ({ walkthrough, children }: WalkthroughLinkProps) => {
  const { id, levelName } = walkthrough;
  if (id) {
    return (
      <Link to={`/walkthroughs/${id}`}>
        {children || `Walkthrough for ${levelName}`}
      </Link>
    );
  }
  return <>{children || levelName}</>;
};

export { WalkthroughLink };
