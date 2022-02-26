import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { LevelForm } from "src/components/LevelForm";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelDetails } from "src/services/LevelService";

const LevelUploadPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (level: LevelDetails) => {
      setIsComplete(true);
    },
    [setIsComplete]
  );

  useEffect(() => {
    setTitle("Upload a level");
  }, [setTitle]);

  return (
    <div className="LevelUploadForm">
      <h1>Upload new level</h1>

      {isComplete ? (
        <>
          Your level was uploaded and it now needs to be approved by the staff.
          Please have patience :) In the meantime, why don't you take a look at{" "}
          <Link to={"/"}>some levels</Link>?
        </>
      ) : (
        <LevelForm onSubmit={handleSubmit} />
      )}
    </div>
  );
};

export { LevelUploadPage };
