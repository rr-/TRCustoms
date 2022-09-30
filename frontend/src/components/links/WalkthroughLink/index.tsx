import { Link } from "react-router-dom";
import { SmartWrap } from "src/components/common/SmartWrap";

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
        {children || <SmartWrap text={`Walkthrough for ${levelName}`} />}
      </Link>
    );
  }
  return <>{children || levelName}</>;
};

export { WalkthroughLink };
