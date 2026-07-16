import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { Link } from "src/components/common/Link";
import type { TagListing } from "src/services/TagService";
import { useConfig } from "src/stores/config";

interface TagsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const TagsCheckboxes = ({ value, onChange }: TagsCheckboxesProps) => {
  const { config } = useConfig();

  return (
    <EntitiesCheckboxes
      footer={
        <div>
          <Link to={`/tags`}>Browse all</Link>
        </div>
      }
      entitiesPool={config.tags}
      maxVisibleEntities={12}
      maxFilteredEntities={10}
      value={value}
      onChange={onChange}
      getEntityId={(entity: TagListing) => entity.id}
      getEntityName={(entity: TagListing) => entity.name}
      getEntitySortPosition={(entity: TagListing) =>
        -new Date(entity.created ?? 0)
      }
    />
  );
};

export { TagsCheckboxes };
