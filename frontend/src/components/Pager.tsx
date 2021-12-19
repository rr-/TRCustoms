import "./Pager.css";
import { LinkWithQuery } from "src/shared/components/LinkWithQuery";
import { IPagedResponse } from "src/shared/types";

const PAGES_AROUND = 1;

interface IPager<TCollection> {
  pagedResponse: IPagedResponse<TCollection>;
  className?: string | null;
}

function getPagesShown(
  firstPage: number,
  currentPage: number,
  lastPage: number
): number[] {
  let pages: Set<number> = new Set();
  for (let i = -PAGES_AROUND; i <= PAGES_AROUND; i++) {
    pages.add(firstPage + i);
    pages.add(currentPage + i);
    pages.add(lastPage + i);
  }

  return Array.from(pages)
    .sort((a, b) => a - b)
    .filter((page) => page >= 1 && page <= lastPage);
}

function addEllipsisMarkers(pages: number[]): (number | null)[] {
  // insert nulls between non-consecutive pages to render the ellipsis
  return pages.reduce(
    (acc: any, item: number) =>
      acc.at(-1) + 1 < item ? [...acc, null, item] : [...acc, item],
    []
  );
}

const Pager = <TCollection extends {}>(props: IPager<TCollection>) => {
  const firstPage = 1;
  const currentPage = props.pagedResponse.current_page;
  const lastPage = props.pagedResponse.last_page;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const pagesShown = addEllipsisMarkers(
    getPagesShown(firstPage, currentPage, lastPage)
  );

  const activeLinkElem = (page, label) => (
    <LinkWithQuery to={`?page=${page}`}>{label}</LinkWithQuery>
  );
  const inactiveLinkElem = (page, label) => <span>{label}</span>;
  const linkElem = (page, label) =>
    (page >= firstPage && page <= lastPage ? activeLinkElem : inactiveLinkElem)(
      page,
      label
    );

  return (
    <div className={`Pager ${props.className}`}>
      <ul>
        <li>{linkElem(firstPage, <>&laquo;</>)}</li>
        <li>{linkElem(prevPage, <>&lsaquo;</>)}</li>

        {pagesShown.map((page, idx) =>
          page === null ? (
            <li key={idx} className="Pager--ellipsis">
              …
            </li>
          ) : (
            <li key={idx} className={page === currentPage ? "active" : ""}>
              {linkElem(page, <>{page}</>)}
            </li>
          )
        )}

        <li>{linkElem(nextPage, <>&rsaquo;</>)}</li>
        <li>{linkElem(lastPage, <>&raquo;</>)}</li>
      </ul>
    </div>
  );
};

export default Pager;
