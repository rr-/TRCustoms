import { useQuery } from "react-query";
import { ILevelTagList } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const LevelTagsCheckboxes: React.FunctionComponent = () => {
  const levelTagsQuery = useQuery<ILevelTagList, Error>(
    "levelTags",
    LevelService.getLevelTags
  );

  if (levelTagsQuery.isLoading || !levelTagsQuery.data) {
    return <Loader />;
  }

  if (levelTagsQuery.error) {
    return <p>{levelTagsQuery.error.message}</p>;
  }

  return (
    <CheckboxArrayFormField
      label="Tags"
      name="tags"
      source={levelTagsQuery.data.map((tag) => ({
        value: tag.id,
        label: tag.name,
      }))}
    />
  );
};

export default LevelTagsCheckboxes;
