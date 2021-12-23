import { isEqual } from "lodash";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { GenericQuery } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";

const deserializeGenericQuery = (search: string): GenericQuery => {
  const currentURL = new URL(search);
  const qp = Object.fromEntries(currentURL.searchParams);
  return {
    page: +qp.page || null,
    sort: qp.sort || null,
    search: qp.search || null,
  };
};

const serializeGenericQuery = (query: GenericQuery) => {
  const qp = filterFalsyObjectValues({
    page: query.page,
    sort: query.sort,
    search: query.search,
  }) as any;
  return "?" + new URLSearchParams(qp).toString();
};

interface QueryPersisterProps {
  serializeQuery;
  deserializeQuery;
  query;
  setQuery;
}

const QueryPersister = ({
  serializeQuery,
  deserializeQuery,
  query,
  setQuery,
}: QueryPersisterProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // synchronize query changes to URL
    if (!isEqual(deserializeQuery(window.location.href), query)) {
      navigate(serializeQuery(query));
    }
  }, [query, navigate, serializeQuery, deserializeQuery]);

  useEffect(() => {
    // synchronize URL changes to query
    if (!isEqual(deserializeQuery(window.location.href), query)) {
      setQuery(deserializeQuery(window.location.href));
    }
  }, [location, query, deserializeQuery, setQuery]);

  return null;
};

export { QueryPersister, deserializeGenericQuery, serializeGenericQuery };
