import { useQuery } from "react-query";
import { ILevelEngineList } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import Loader from "src/shared/components/Loader";

const LevelEnginesCheckboxes: React.FunctionComponent = () => {
  const levelEnginesQuery = useQuery<ILevelEngineList, Error>(
    "levelEngines",
    LevelService.getLevelEngines
  );

  if (levelEnginesQuery.isLoading) {
    return <Loader />;
  }

  if (levelEnginesQuery.error) {
    return <p>{levelEnginesQuery.error.message}</p>;
  }

  return (
    <CheckboxArrayFormField
      label="Engines"
      name="engines"
      source={levelEnginesQuery.data.map((engine) => ({
        value: engine.id,
        label: engine.name,
      }))}
    />
  );
};

export default LevelEnginesCheckboxes;
