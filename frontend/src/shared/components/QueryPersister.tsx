import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { IGenericQuery } from "src/services/level.service";
import { filterFalsyObjectValues } from "src/shared/utils";

const deserializeGenericQuery = (search: string): IGenericQuery => {
  const currentURL = new URL(search);
  const qp = Object.fromEntries(currentURL.searchParams);
  return {
    page: +qp.page || null,
    sort: qp.sort || null,
    search: qp.search || null,
  };
};

const serializeGenericQuery = (query: IGenericQuery) => {
  const qp = filterFalsyObjectValues({
    page: query.page,
    sort: query.sort,
    search: query.search,
  }) as any;
  return "?" + new URLSearchParams(qp).toString();
};

interface IQueryPersister {
  serializeQuery;
  deserializeQuery;
  query;
  setQuery;
}

const QueryPersister: React.FunctionComponent<IQueryPersister> = ({
  serializeQuery,
  deserializeQuery,
  query,
  setQuery,
}) => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // synchronize query changes to URL
    if (
      JSON.stringify(deserializeQuery(window.location.href)) !==
      JSON.stringify(query)
    ) {
      history.push(serializeQuery(query));
    }
  }, [query, history, serializeQuery, deserializeQuery]);

  useEffect(() => {
    // synchronize URL changes to query
    if (
      JSON.stringify(deserializeQuery(window.location.href)) !==
      JSON.stringify(query)
    ) {
      setQuery(deserializeQuery(window.location.href));
    }
  }, [location, query, deserializeQuery, setQuery]);

  return null;
};

export { QueryPersister, deserializeGenericQuery, serializeGenericQuery };
