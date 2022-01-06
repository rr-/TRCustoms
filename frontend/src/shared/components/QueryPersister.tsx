import { isEqual } from "lodash";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { GenericSearchQuery } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getCurrentSearchParams } from "src/shared/utils";

const deserializeGenericSearchQuery = (
  qp: { [key: string]: string },
  defaults?: GenericSearchQuery | null
): GenericSearchQuery => {
  return {
    page: +qp.page || defaults?.page || null,
    sort: qp.sort || defaults?.sort || null,
    search: qp.search || defaults?.search || null,
  };
};

const serializeGenericSearchQuery = (
  searchQuery: GenericSearchQuery,
  defaults?: GenericSearchQuery
): { [key: string]: any } => {
  return filterFalsyObjectValues({
    page: searchQuery.page === defaults?.page ? null : searchQuery.page,
    sort: searchQuery.sort === defaults?.sort ? null : searchQuery.sort,
    search: searchQuery.search === defaults?.search ? null : searchQuery.search,
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
