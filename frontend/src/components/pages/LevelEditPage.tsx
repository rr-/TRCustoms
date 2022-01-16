import { useCallback } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { LevelFull } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { LevelForm } from "src/shared/components/LevelForm";
import { Loader } from "src/shared/components/Loader";

interface LevelEditPageParams {
  levelId: string;
}

const LevelEditPage = () => {
  const navigate = useNavigate();
  const { levelId } = (useParams() as unknown) as LevelEditPageParams;

  const result = useQuery<LevelFull, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const goBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;

  return (
    <div id="LevelEditPage">
      <h1>Editing {level.name}</h1>

      <LevelForm onGoBack={goBack} level={level} />
    </div>
  );
};

export { LevelEditPage };
