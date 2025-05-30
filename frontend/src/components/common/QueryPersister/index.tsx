import { isEqual } from "lodash";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { GenericSearchQuery } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

const deserializeGenericSearchQuery = (
  qp: { [key: string]: string },
  defaults?: GenericSearchQuery | undefined,
): GenericSearchQuery => {
  return {
    page: +qp.page || defaults?.page || undefined,
    pageSize: +qp.page_size || defaults?.pageSize || undefined,
    sort: qp.sort || defaults?.sort || undefined,
    search: qp.search || defaults?.search || undefined,
  };
};

const serializeGenericSearchQuery = (
  searchQuery: GenericSearchQuery,
  defaults?: GenericSearchQuery,
): { [key: string]: any } => {
  return filterFalsyObjectValues({
    page: searchQuery.page === defaults?.page ? undefined : searchQuery.page,
    pageSize:
      searchQuery.pageSize === defaults?.pageSize
        ? undefined
        : searchQuery.pageSize,
    sort: searchQuery.sort === defaults?.sort ? undefined : searchQuery.sort,
    search:
      searchQuery.search === defaults?.search ? undefined : searchQuery.search,
  }) as any;
};

interface QueryPersisterProps<TQuery> {
  serializeSearchQuery: (query: TQuery) => { [key: string]: any };
  deserializeSearchQuery: (qp: { [key: string]: string }) => TQuery;
  searchQuery: TQuery;
  setSearchQuery: (query: TQuery) => void;
}

const QueryPersister = <TQuery extends GenericSearchQuery>({
  serializeSearchQuery,
  deserializeSearchQuery,
  searchQuery,
  setSearchQuery,
}: QueryPersisterProps<TQuery>) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Skip state->URL sync on initial mount (e.g. when switching tabs),
  // so we don't reapply stale query parameters from a previous tab.
  const initialMount = useRef(true);
  // Skip the very next state->URL sync after responding to a URL->state update,
  // preventing ping-pong redirects / double-sync after navigating.
  const skipNextSync = useRef(false);

  // Sync local searchQuery → URL on changes, but:
  // - Skip on initial mount to avoid reapplying stale params (e.g. when switching tabs)
  // - Skip one update after URL→state sync to prevent ping-pong redirects
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    if (
      !isEqual(deserializeSearchQuery(getCurrentSearchParams()), searchQuery)
    ) {
      const newLocation =
        "?" + new URLSearchParams(serializeSearchQuery(searchQuery)).toString();
      navigate(newLocation);
    }
  }, [searchQuery, navigate, serializeSearchQuery, deserializeSearchQuery]);

  useEffect(() => {
    // synchronize URL changes to searchQuery
    const current = getCurrentSearchParams();
    const nextQuery = deserializeSearchQuery(current);
    if (!isEqual(nextQuery, searchQuery)) {
      skipNextSync.current = true;
      setSearchQuery(nextQuery);
    }
  }, [location, searchQuery, deserializeSearchQuery, setSearchQuery]);

  return null;
};

export {
  QueryPersister,
  deserializeGenericSearchQuery,
  serializeGenericSearchQuery,
};
