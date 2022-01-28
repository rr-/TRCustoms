import { sortBy } from "lodash";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import type { LevelSearchQuery } from "src/services/level.service";
import type { TagNested } from "src/services/tag.service";
import { Checkbox } from "src/shared/components/Checkbox";
import { TextInput } from "src/shared/components/TextInput";
import { KEY_RETURN } from "src/shared/constants";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

const MAX_VISIBLE_TAGS = 15;

interface TagsCheckboxesProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => any;
}

const TagsCheckboxes = ({
  searchQuery,
  onSearchQueryChange,
}: TagsCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const [searchFilter, setSearchFilter] = useState("");
  const [filteredTags, setFilteredTags] = useState<TagNested[]>([]);
  const [visibleTags, setVisibleTags] = useState<TagNested[]>([]);

  useEffect(() => {
    setFilteredTags(
      sortBy(config.tags, (tag) => tag.name).filter((tag, i) =>
        tag.name.toLowerCase().includes(searchFilter.toLowerCase())
      )
    );
  }, [searchFilter, setFilteredTags, config]);

  useEffect(() => {
    setVisibleTags(filteredTags.filter((tag, i) => i < MAX_VISIBLE_TAGS));
  }, [setVisibleTags, filteredTags]);

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const onSearchInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
    }
  };

  const onTagChange = (
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
      <br />
      <TextInput
        onKeyDown={onSearchInputKeyDown}
        onChange={onSearchInputChange}
        placeholder="Search tags…"
      />
      {visibleTags.map((tag) => (
        <div>
          <Checkbox
            label={tag.name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onTagChange(event, tag)
            }
            checked={searchQuery.tags.includes(tag.id)}
          />
        </div>
      ))}
      {filteredTags.length > MAX_VISIBLE_TAGS &&
        `(${filteredTags.length - MAX_VISIBLE_TAGS} tag(s) hidden)`}
    </div>
  );
};

export { TagsCheckboxes };
