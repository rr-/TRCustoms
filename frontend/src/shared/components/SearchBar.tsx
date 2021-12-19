import "./SearchBar.css";

const SearchBar = ({ id, children }: { id?: string; children: any }) => {
  return (
    <div id={id} className="SearchBar">
      {children}
    </div>
  );
};

export { SearchBar };
