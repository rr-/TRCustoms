import { useContext } from "react";
import { EntitiesCheckboxes } from "src/components/common/EntitiesCheckboxes";
import { Link } from "src/components/common/Link";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { TagListing } from "src/services/TagService";

interface TagsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const TagsCheckboxes = ({ value, onChange }: TagsCheckboxesProps) => {
  const { config } = useContext(ConfigContext);

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
    />
  );
};

export { TagsCheckboxes };
