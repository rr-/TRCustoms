import "./Pager.css";
import type { PagedResponse } from "src/types";

const PAGES_AROUND = 2;

interface PagerProps<TCollection> {
  onPageChange: (page: number) => void;
  pagedResponse: PagedResponse<TCollection>;
  className?: string | undefined;
}

const getPagesShown = (
  firstPage: number,
  currentPage: number,
  lastPage: number
): number[] => {
  let pages: Set<number> = new Set();
  for (let i = -PAGES_AROUND; i <= PAGES_AROUND; i++) {
    pages.add(firstPage + i);
    pages.add(currentPage + i);
    pages.add(lastPage + i);
  }

  return Array.from(pages)
    .sort((a, b) => a - b)
    .reduce(
      (acc: number[], page: number) => [
        ...acc,
        ...((acc.at(-1) || 0) + 2 === page ? [page - 1] : []),
        page,
      ],
      []
    )
    .filter((page) => page >= 1 && page <= lastPage);
};

const addEllipsisMarkers = (pages: number[]): (number | null)[] => {
  // insert nulls between non-consecutive pages to render the ellipsis
  return pages.reduce(
    (acc: any, item: number) =>
      acc.at(-1) + 1 < item ? [...acc, null, item] : [...acc, item],
    []
  );
};

const PagerActiveLink = ({
  onPageChange,
  page,
  children,
}: {
  onPageChange: (page: number) => void;
  page: number;
  children: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      className="Pager--button link"
      onClick={() => onPageChange(page)}
    >
      {children}
    </button>
  );
};

const PagerInactiveLink = ({
  page,
  children,
}: {
  page: number;
  children: React.ReactNode;
}) => {
  return <span>{children}</span>;
};

const PagerLink = ({
  onPageChange,
  firstPage,
  lastPage,
  page,
  children,
}: {
  onPageChange: (page: number) => void;
  firstPage: number;
  lastPage: number;
  page: number;
  children: React.ReactNode;
}) => {
  if (page >= firstPage && page <= lastPage) {
    return (
      <PagerActiveLink onPageChange={onPageChange} page={page}>
        {children}
      </PagerActiveLink>
    );
  }
  return <PagerInactiveLink page={page}>{children}</PagerInactiveLink>;
};

const Pager = <TCollection extends {}>({
  onPageChange,
  pagedResponse,
  className,
}: PagerProps<TCollection>) => {
  const firstPage = 1;
  const currentPage = pagedResponse.current_page;
  const lastPage = pagedResponse.last_page;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const pagesShown = addEllipsisMarkers(
    getPagesShown(firstPage, currentPage, lastPage)
  );

  const pagerLinkProps = { onPageChange, firstPage, lastPage };

  return (
    <div className={`Pager ${className}`}>
      <ul>
        <li>
          <PagerLink {...pagerLinkProps} page={firstPage}>
            &laquo;
          </PagerLink>
        </li>
        <li>
          <PagerLink {...pagerLinkProps} page={prevPage}>
            &lsaquo;
          </PagerLink>
        </li>

        {pagesShown.map((page, idx) =>
          page === null ? (
            <li key={idx} className="Pager--ellipsis">
              …
            </li>
          ) : (
            <li key={idx} className={page === currentPage ? "active" : ""}>
              <PagerLink {...pagerLinkProps} page={page}>
                {page}
              </PagerLink>
            </li>
          )
        )}

        <li>
          <PagerLink {...pagerLinkProps} page={nextPage}>
            &rsaquo;
          </PagerLink>
        </li>
        <li>
          <PagerLink {...pagerLinkProps} page={lastPage}>
            &raquo;
          </PagerLink>
        </li>
      </ul>
    </div>
  );
};

export { Pager };
