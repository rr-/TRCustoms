import { isEqual } from "lodash";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { GenericSearchQuery } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";

const deserializeGenericSearchQuery = (
  search: string,
  defaults: GenericSearchQuery | null
): GenericSearchQuery => {
  const currentURL = new URL(search);
  const qp = Object.fromEntries(currentURL.searchParams);
  return {
    page: +qp.page || defaults?.page || null,
    sort: qp.sort || defaults?.sort || null,
    search: qp.search || defaults?.search || null,
  };
};

const serializeGenericSearchQuery = (searchQuery: GenericSearchQuery) => {
  const qp = filterFalsyObjectValues({
    page: searchQuery.page,
    sort: searchQuery.sort,
    search: searchQuery.search,
  }) as any;
  return "?" + new URLSearchParams(qp).toString();
};

interface QueryPersisterProps {
  serializeSearchQuery;
  deserializeSearchQuery;
  searchQuery;
  setSearchQuery;
}

const QueryPersister = ({
  serializeSearchQuery,
  deserializeSearchQuery,
  searchQuery,
  setSearchQuery,
}: QueryPersisterProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // synchronize searchQuery changes to URL
    if (!isEqual(deserializeSearchQuery(window.location.href), searchQuery)) {
      navigate(serializeSearchQuery(searchQuery));
    }
  }, [searchQuery, navigate, serializeSearchQuery, deserializeSearchQuery]);

  useEffect(() => {
    // synchronize URL changes to searchQuery
    if (!isEqual(deserializeSearchQuery(window.location.href), searchQuery)) {
      setSearchQuery(deserializeSearchQuery(window.location.href));
    }
  }, [location, searchQuery, deserializeSearchQuery, setSearchQuery]);

  return null;
};

export {
  QueryPersister,
  deserializeGenericSearchQuery,
  serializeGenericSearchQuery,
};
