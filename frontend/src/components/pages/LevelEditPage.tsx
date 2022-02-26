import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { LevelForm } from "src/components/LevelForm";
import { Loader } from "src/components/Loader";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";

interface LevelEditPageParams {
  levelId: string;
}

const LevelEditPage = () => {
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const { levelId } = (useParams() as unknown) as LevelEditPageParams;

  const result = useQuery<LevelDetails, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  const handleGoBack = useCallback(() => {
    navigate(`/levels/${levelId}`);
  }, [navigate, levelId]);

  useEffect(() => {
    setTitle(result?.data?.name || "");
  }, [setTitle, result]);

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

      <LevelForm onGoBack={handleGoBack} level={level} />
    </div>
  );
};

export { LevelEditPage };
