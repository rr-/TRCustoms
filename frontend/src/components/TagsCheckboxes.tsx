import { sortBy } from "lodash";
import { useContext } from "react";
import type { LevelSearchQuery } from "src/services/level.service";
import type { TagNested } from "src/services/tag.service";
import { Checkbox } from "src/shared/components/Checkbox";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

interface TagsCheckboxesProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => any;
}

const TagsCheckboxes = ({
  searchQuery,
  onSearchQueryChange,
}: TagsCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const visibleTags = sortBy(config.tags, (tag) => tag.name);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag: TagNested
  ) => {
    onSearchQueryChange({
      ...searchQuery,
      tags: event.target.checked
        ? [...searchQuery.tags, tag.id]
        : searchQuery.tags.filter((tagId) => tagId !== tag.id),
    });
  };

  return (
    <div className="TagsCheckboxes">
      Tags:
      {visibleTags.map((tag) => (
        <div>
          <Checkbox
            label={tag.name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange(event, tag)
            }
            checked={searchQuery.tags.includes(tag.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { TagsCheckboxes };
