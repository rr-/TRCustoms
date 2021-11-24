import "./Pager.css";
import { IPagedResponse } from "src/shared/types";

const PAGES_AROUND = 1;

interface IPager<T> {
  pagedResponse: IPagedResponse<T>;
  linkElem: (
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

const Pager = <T extends {}>(props: IPager<T>) => {
  const firstPage = 1;
  const currentPage = props.pagedResponse.current_page;
  const lastPage = props.pagedResponse.last_page;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const pagesShown = addEllipsisMarkers(
    getPagesShown(firstPage, currentPage, lastPage)
  );
  const prevPageLabel = <>&laquo;</>;
  const nextPageLabel = <>&raquo;</>;

  return (
    <div className="Pager">
      <ul>
        {prevPage < firstPage ? (
          <li>
            <span>{prevPageLabel}</span>
          </li>
        ) : (
          <li>{props.linkElem(prevPage, prevPageLabel)}</li>
        )}

        {pagesShown.map((page) =>
          page === null ? (
            <li className="ellipsis">...</li>
          ) : (
            <li className={page === currentPage ? "active" : ""}>
              {props.linkElem(page, <>{page}</>)}
            </li>
          )
        )}

        {nextPage > lastPage ? (
          <li>
            <span>{nextPageLabel}</span>
          </li>
        ) : (
          <li>{props.linkElem(nextPage, nextPageLabel)}</li>
        )}
      </ul>
    </div>
  );
};

export default Pager;
