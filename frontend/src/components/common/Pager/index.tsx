import styles from "./index.module.css";
import { last } from "lodash";
import { Link } from "src/components/common/Link";
import type { PagedResponse } from "src/types";

const PAGES_AROUND = 2;

interface PagerProps<TCollection> {
  onPageChange: (page: number) => void;
  pagedResponse: PagedResponse<TCollection>;
}

const getPagesShown = (
  firstPage: number,
  currentPage: number,
  lastPage: number,
): number[] => {
  const pages: Set<number> = new Set();
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
        ...((last(acc) || 0) + 2 === page ? [page - 1] : []),
        page,
      ],
      [],
    )
    .filter((page) => page >= 1 && page <= lastPage);
};

const addEllipsisMarkers = (pages: number[]): (number | null)[] => {
  // insert nulls between non-consecutive pages to render the ellipsis
  return pages.reduce(
    (acc: (number | null)[], item: number) =>
      (last(acc) || 0) + 1 < item ? [...acc, null, item] : [...acc, item],
    [],
  );
};

const PagerActiveLink = ({
  onPageChange,
  page,
  ariaLabel,
  isCurrent,
  children,
}: {
  onPageChange: (page: number) => void;
  page: number;
  ariaLabel?: string | undefined;
  isCurrent?: boolean | undefined;
  children: React.ReactNode;
}) => {
  return (
    <Link
      className={styles.button}
      onClick={() => onPageChange(page)}
      ariaLabel={ariaLabel}
      ariaCurrent={isCurrent ? "page" : undefined}
    >
      {children}
    </Link>
  );
};

const PagerInactiveLink = ({
  ariaLabel,
  children,
}: {
  ariaLabel?: string | undefined;
  children: React.ReactNode;
}) => {
  return <span aria-label={ariaLabel}>{children}</span>;
};

const PagerLink = ({
  onPageChange,
  firstPage,
  lastPage,
  page,
  ariaLabel,
  isCurrent,
  children,
}: {
  onPageChange: (page: number) => void;
  firstPage: number;
  lastPage: number;
  page: number;
  ariaLabel?: string | undefined;
  isCurrent?: boolean | undefined;
  children: React.ReactNode;
}) => {
  if (page >= firstPage && page <= lastPage) {
    return (
      <PagerActiveLink
        onPageChange={onPageChange}
        page={page}
        ariaLabel={ariaLabel}
        isCurrent={isCurrent}
      >
        {children}
      </PagerActiveLink>
    );
  }
  return (
    <PagerInactiveLink ariaLabel={ariaLabel}>{children}</PagerInactiveLink>
  );
};

const Pager = <TCollection extends {}>({
  onPageChange,
  pagedResponse,
}: PagerProps<TCollection>) => {
  const firstPage = 1;
  const currentPage = pagedResponse.current_page;
  const lastPage = pagedResponse.last_page;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const pagesShown = addEllipsisMarkers(
    getPagesShown(firstPage, currentPage, lastPage),
  );

  const pagerLinkProps = { onPageChange, firstPage, lastPage };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <PagerLink
            {...pagerLinkProps}
            page={firstPage}
            ariaLabel="First page"
          >
            &laquo;
          </PagerLink>
        </li>
        <li className={styles.listItem}>
          <PagerLink
            {...pagerLinkProps}
            page={prevPage}
            ariaLabel="Previous page"
          >
            &lsaquo;
          </PagerLink>
        </li>

        {pagesShown.map((page, idx) =>
          page === null ? (
            <li key={idx} className={`${styles.listItem} ${styles.ellipsis}`}>
              …
            </li>
          ) : (
            <li
              key={idx}
              className={`${styles.listItem} ${
                page === currentPage ? styles.active : ""
              }`}
            >
              <PagerLink
                {...pagerLinkProps}
                page={page}
                ariaLabel={`Page ${page}`}
                isCurrent={page === currentPage}
              >
                {page}
              </PagerLink>
            </li>
          ),
        )}

        <li className={styles.listItem}>
          <PagerLink {...pagerLinkProps} page={nextPage} ariaLabel="Next page">
            &rsaquo;
          </PagerLink>
        </li>
        <li className={styles.listItem}>
          <PagerLink {...pagerLinkProps} page={lastPage} ariaLabel="Last page">
            &raquo;
          </PagerLink>
        </li>
      </ul>
    </div>
  );
};

export { Pager };
