import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import styles from "src/components/common/LevelSearchSidebar/index.module.css";
import { Link } from "src/components/common/Link";
import { SidebarBoxHeader } from "src/components/common/SidebarBox";
import { SidebarBox } from "src/components/common/SidebarBox";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons";
import type { GenreSearchQuery } from "src/services/GenreService";

const convertSearchQueryToFormikValues = (searchQuery: GenreSearchQuery) => {
  return { search: searchQuery.search || "" };
};

interface GenreSearchProps {
  defaultSearchQuery: GenreSearchQuery;
  searchQuery: GenreSearchQuery;
  onSearchQueryChange: (searchQuery: GenreSearchQuery) => void;
}

const GenreSearchSidebar = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: GenreSearchProps) => {
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery),
  );

  const handleSubmit = useCallback(
    async (values: any) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        search: values.search || null,
      });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleClear = useCallback(
    () => onSearchQueryChange(defaultSearchQuery),
    [onSearchQueryChange, defaultSearchQuery],
  );

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery],
  );

  return (
    <SidebarBox>
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={handleSubmit}
      >
        {({ submitForm, resetForm }) => (
          <Form className={`${styles.wrapper} ChildMarginClear`}>
            <SidebarBoxHeader alignToTabSwitch={true}>
              <span className={styles.header}>
                Search filter
                <Link className={styles.resetButton} onClick={handleClear}>
                  (reset)
                </Link>
              </span>
            </SidebarBoxHeader>

            <div className={`${styles.section} ${styles.searchBar}`}>
              <TextFormField label="Genre name" name="search" />
              <div className="FormField">
                <SubmitButton
                  onClick={() => submitForm()}
                  icon={<IconSearch />}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </SidebarBox>
  );
};

export { GenreSearchSidebar };
