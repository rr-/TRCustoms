import { sortBy } from "lodash";
import { useEffect } from "react";
import { useState } from "react";
import { Checkbox } from "src/components/common/Checkbox";
import { FilterCheckboxesHeader } from "src/components/common/FilterCheckboxesHeader";
import { Link } from "src/components/common/Link";
import { TextInput } from "src/components/common/TextInput";
import { KEY_RETURN } from "src/constants";

interface EntitiesCheckboxesProps<TEntity> {
  header: string;
  footer?: React.ReactNode;
  entitiesPool: TEntity[];
  maxVisibleEntities?: number;
  maxFilteredEntities?: number;
  value: number[];
  onChange: (value: number[]) => any;
  getEntityId: (entity: TEntity) => number;
  getEntityName: (entity: TEntity) => string;
  getEntitySortPosition?: (entity: TEntity) => any;
}

const EntitiesCheckboxes = <TEntity extends {}>({
  header,
  footer,
  entitiesPool,
  maxVisibleEntities,
  maxFilteredEntities,
  value,
  onChange,
  getEntityId,
  getEntityName,
  getEntitySortPosition,
}: EntitiesCheckboxesProps<TEntity>) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [filteredEntities, setFilteredEntities] = useState<TEntity[]>([]);
  const [visibleEntities, setVisibleEntities] = useState<TEntity[]>([]);
  const useFiltering = !!maxFilteredEntities;
  const useCollapsing = !!maxVisibleEntities;

  useEffect(() => {
    setFilteredEntities(
      sortBy(entitiesPool, (entity) =>
        (getEntitySortPosition || getEntityName)(entity)
      ).filter(
        (entity, i) =>
          getEntityName(entity)
            .toLowerCase()
            .includes(searchFilter.toLowerCase()) ||
          value.includes(getEntityId(entity))
      )
    );
  }, [
    entitiesPool,
    getEntityId,
    getEntitySortPosition,
    getEntityName,
    searchFilter,
    setFilteredEntities,
    value,
  ]);

  useEffect(() => {
    setVisibleEntities(
      filteredEntities.filter(
        (entity, i) =>
          isExpanded ||
          !useCollapsing ||
          i < maxVisibleEntities ||
          value.includes(getEntityId(entity))
      )
    );
  }, [
    isExpanded,
    getEntityId,
    setVisibleEntities,
    filteredEntities,
    value,
    maxVisibleEntities,
    useCollapsing,
  ]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchFilter(event.target.value);
  };

  const handleSearchInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
    }
  };

  const handleEntityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    entity: TEntity
  ) => {
    onChange(
      event.target.checked
        ? !useFiltering || value.length < maxFilteredEntities
          ? [...value, getEntityId(entity)]
          : value
        : value.filter((entityId) => entityId !== getEntityId(entity))
    );
  };

  const handleClear = () => {
    onChange([]);
  };

  const handleExpandButtonClick = () => {
    setIsExpanded((value) => !value);
  };

  return (
    <div className="EntitiesCheckboxes">
      <FilterCheckboxesHeader onClear={handleClear}>
        {header}:
      </FilterCheckboxesHeader>

      {useFiltering && (
        <TextInput
          onKeyDown={handleSearchInputKeyDown}
          onChange={handleSearchInputChange}
          placeholder="Search…"
        />
      )}

      {visibleEntities.map((entity) => (
        <Checkbox
          key={getEntityId(entity)}
          label={getEntityName(entity)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleEntityChange(event, entity)
          }
          checked={value.includes(getEntityId(entity))}
        />
      ))}
      {useFiltering ? (
        <>
          {value.length === maxFilteredEntities && (
            <p>Cannot filter by any more items.</p>
          )}
          {useCollapsing && filteredEntities.length > maxVisibleEntities && (
            <p>
              ({filteredEntities.length - maxVisibleEntities} item(s) hidden)
            </p>
          )}
          {footer}
        </>
      ) : (
        useCollapsing && (
          <div>
            <Link onClick={handleExpandButtonClick}>
              {isExpanded ? "Show less" : "Show all"}
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export { EntitiesCheckboxes };
