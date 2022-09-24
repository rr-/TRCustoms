import { sortBy } from "lodash";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Checkbox } from "src/components/Checkbox";
import { FilterCheckboxesHeader } from "src/components/FilterCheckboxesHeader";
import { PushButton } from "src/components/PushButton";
import { TextInput } from "src/components/TextInput";
import { KEY_RETURN } from "src/constants";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { TagNested } from "src/services/TagService";

const MAX_VISIBLE_TAGS = 12;
const MAX_TAGS_FILTER = 10;

interface TagsCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const TagsCheckboxes = ({ value, onChange }: TagsCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const [searchFilter, setSearchFilter] = useState("");
  const [filteredTags, setFilteredTags] = useState<TagNested[]>([]);
  const [visibleTags, setVisibleTags] = useState<TagNested[]>([]);

  useEffect(() => {
    setFilteredTags(
      sortBy(config.tags, (tag) => tag.name).filter(
        (tag, i) =>
          tag.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          value.includes(tag.id)
      )
    );
  }, [searchFilter, setFilteredTags, config, value]);

  useEffect(() => {
    setVisibleTags(
      filteredTags.filter(
        (tag, i) => i < MAX_VISIBLE_TAGS || value.includes(tag.id)
      )
    );
  }, [setVisibleTags, filteredTags, value]);

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

  const handleTagChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag: TagNested
  ) => {
    onChange(
      event.target.checked
        ? value.length < MAX_TAGS_FILTER
          ? [...value, tag.id]
          : value
        : value.filter((tagId) => tagId !== tag.id)
    );
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="TagsCheckboxes">
      <FilterCheckboxesHeader onClear={handleClear}>
        Tags:
      </FilterCheckboxesHeader>
      <TextInput
        onKeyDown={handleSearchInputKeyDown}
        onChange={handleSearchInputChange}
        placeholder="Search tags…"
      />
      {visibleTags.map((tag) => (
        <Checkbox
          key={tag.id}
          label={tag.name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleTagChange(event, tag)
          }
          checked={value.includes(tag.id)}
        />
      ))}
      {value.length === MAX_TAGS_FILTER && <p>Maximum tag filter reached.</p>}
      {filteredTags.length > MAX_VISIBLE_TAGS && (
        <p>({filteredTags.length - MAX_VISIBLE_TAGS} tag(s) hidden)</p>
      )}
      <div>
        <PushButton isPlain={true} disableTimeout={true} to={`/tags`}>
          Browse all
        </PushButton>
      </div>
    </div>
  );
};

export { TagsCheckboxes };
