import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewsForm } from "src/components/NewsForm";
import { TitleContext } from "src/contexts/TitleContext";

const NewsCreatePage = () => {
  const { setTitle } = useContext(TitleContext);
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(`/`);
  }, [navigate]);

  useEffect(() => setTitle("News"), [setTitle]);

  return (
    <div id="NewsCreatePage">
      <h1>Creating news</h1>

      <NewsForm onGoBack={handleGoBack} news={null} />
    </div>
  );
};

export { NewsCreatePage };
