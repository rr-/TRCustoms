import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useContext } from "react";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { SearchBar } from "src/components/SearchBar";
import { TagsTable } from "src/components/TagsTable";
import { TextFormField } from "src/components/formfields/TextFormField";
import { TitleContext } from "src/contexts/TitleContext";
import type { TagSearchQuery } from "src/services/TagService";
import { getCurrentSearchParams } from "src/utils";

const defaultSearchQuery: TagSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const convertSearchQueryToFormikValues = (searchQuery: TagSearchQuery) => {
  return { search: searchQuery.search || "" };
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): TagSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: TagSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const TagListPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<TagSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(() => {
    setTitle("Tags");
  }, [setTitle]);

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setSearchQuery({
        ...searchQuery,
        page: null,
        search: values.search || null,
      });
    },
    [searchQuery, setSearchQuery]
  );

  const handleReset = useCallback(
    async (resetForm) => {
      setSearchQuery(defaultSearchQuery);
      resetForm();
    },
    [setSearchQuery]
  );

  return (
    <div id="TagListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={handleSubmit}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="TagListPage--container">
            <SearchBar id="TagListPage--search">
              <TextFormField label="Search" name="search" />

              <div className="FormField">
                <button type="submit">Search</button>
              </div>

              <div className="FormField">
                <button
                  onClick={handleReset.bind(null, resetForm)}
                  type="reset"
                >
                  Reset
                </button>
              </div>
            </SearchBar>

            <div id="TagListPage--results">
              <TagsTable
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { TagListPage };
