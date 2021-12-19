import "./Pager.css";
import { LinkWithQuery } from "src/shared/components/LinkWithQuery";
import { IPagedResponse } from "src/shared/types";

const PAGES_AROUND = 1;

interface IPager<TCollection> {
  pagedResponse: IPagedResponse<TCollection>;
  linkElem?: (
    pageNumber: number,
    element: React.ReactElement
  ) => React.ReactElement;
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
  const prevPageLabel = <>&lsaquo;</>;
  const firstPageLabel = <>&laquo;</>;
  const lastPageLabel = <>&raquo;</>;
  const nextPageLabel = <>&rsaquo;</>;

  const linkElem =
    props.linkElem ||
    ((page, label) => (
      <LinkWithQuery to={`?page=${page}`}>{label}</LinkWithQuery>
    ));

  return (
    <div className="Pager">
      <ul>
        {firstPage < currentPage ? (
          <li>{linkElem(firstPage, firstPageLabel)}</li>
        ) : (
          <li>
            <span>{firstPageLabel}</span>
          </li>
        )}

        {prevPage < firstPage ? (
          <li>
            <span>{prevPageLabel}</span>
          </li>
        ) : (
          <li>{linkElem(prevPage, prevPageLabel)}</li>
        )}

        {pagesShown.map((page, idx) =>
          page === null ? (
            <li key={idx} className="ellipsis">
              ...
            </li>
          ) : (
            <li key={idx} className={page === currentPage ? "active" : ""}>
              {linkElem(page, <>{page}</>)}
            </li>
          )
        )}

        {nextPage > lastPage ? (
          <li>
            <span>{nextPageLabel}</span>
          </li>
        ) : (
          <li>{linkElem(nextPage, nextPageLabel)}</li>
        )}

        {lastPage > currentPage ? (
          <li>{linkElem(lastPage, lastPageLabel)}</li>
        ) : (
          <li>
            <span>{lastPageLabel}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pager;
