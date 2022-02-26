interface LoaderProps {
  inline?: boolean | undefined;
}

const Loader = ({ inline }: LoaderProps) => {
  return inline ? <span>Loading…</span> : <p>Loading…</p>;
};

export { Loader };
