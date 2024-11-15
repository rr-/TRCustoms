import { Link } from "src/components/common/Link";

interface LevelLinkProps {
  className?: string | undefined;
  level: { id: number; name: string };
  subPage?: "ratings" | "reviews" | "walkthroughs";
  children?: React.ReactNode | undefined;
}

const LevelLink = ({ level, subPage, children, ...props }: LevelLinkProps) => {
  const { id, name } = level;

  if (id) {
    const to = subPage ? `/levels/${id}/${subPage}` : `/levels/${id}`;
    return (
      <Link to={to} {...props}>
        {children || name}
      </Link>
    );
  }

  return <>{children || name}</>;
};

export { LevelLink };
