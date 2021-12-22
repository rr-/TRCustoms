import "./SearchBar.css";

interface SearchBarProps {
  id?: string;
  children: React.ReactNode;
}

const SearchBar = ({ id, children }: SearchBarProps) => {
  return (
    <div id={id} className="SearchBar">
      {children}
    </div>
  );
};

export { SearchBar };
