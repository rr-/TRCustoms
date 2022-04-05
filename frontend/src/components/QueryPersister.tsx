import { isEqual } from "lodash";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { GenericSearchQuery } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

const deserializeGenericSearchQuery = (
  qp: { [key: string]: string },
  defaults?: GenericSearchQuery | undefined
): GenericSearchQuery => {
  return {
    page: +qp.page || defaults?.page || undefined,
    sort: qp.sort || defaults?.sort || undefined,
    search: qp.search || defaults?.search || undefined,
  };
};

const serializeGenericSearchQuery = (
  searchQuery: GenericSearchQuery,
  defaults?: GenericSearchQuery
): { [key: string]: any } => {
  return filterFalsyObjectValues({
    page: searchQuery.page === defaults?.page ? undefined : searchQuery.page,
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

  useEffect(() => {
    // synchronize searchQuery changes to URL
    if (
      !isEqual(deserializeSearchQuery(getCurrentSearchParams()), searchQuery)
    ) {
      const location =
        "?" + new URLSearchParams(serializeSearchQuery(searchQuery)).toString();
      navigate(location);
    }
  }, [searchQuery, navigate, serializeSearchQuery, deserializeSearchQuery]);

  useEffect(() => {
    // synchronize URL changes to searchQuery
    if (
      !isEqual(deserializeSearchQuery(getCurrentSearchParams()), searchQuery)
    ) {
      setSearchQuery(deserializeSearchQuery(getCurrentSearchParams()));
    }
  }, [location, searchQuery, deserializeSearchQuery, setSearchQuery]);

  return null;
};

export {
  QueryPersister,
  deserializeGenericSearchQuery,
  serializeGenericSearchQuery,
};
