import styles from "./index.module.css";
import { useContext } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/common/Button";
import { TextInput } from "src/components/common/TextInput";
import { KEY_RETURN } from "src/constants";
import { UserContext } from "src/contexts/UserContext";
import { LevelNested } from "src/services/LevelService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { showAlertOnError } from "src/utils/misc";

interface WalkthroughsBarProps {
  level: LevelNested;
}

const WalkthroughsBar = ({ level }: WalkthroughsBarProps) => {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");

  const { user } = useContext(UserContext);
  const ownWalkthroughResult = useQuery<WalkthroughDetails | null, Error>(
    ["walkthrough", WalkthroughService.getWalkthroughById, level.id, user?.id],
    async () => {
      const walkthroughs = await WalkthroughService.searchWalkthroughs({
        authors: [user?.id],
        levels: [level.id],
        walkthroughType: WalkthroughType.Text,
      });
      if (walkthroughs.results.length) {
        return await WalkthroughService.getWalkthroughById(
          walkthroughs.results[0].id,
        );
      }
      return null;
    },
  );

  const handleVideoButtonClick = () => {
    showAlertOnError(async () => {
      const walkthrough = await WalkthroughService.create({
        levelId: level.id,
        walkthroughType: WalkthroughType.Link,
        text: textInput,
      });
      navigate(`/walkthroughs/${walkthrough.id}`);
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === KEY_RETURN) {
      event.preventDefault();
      handleVideoButtonClick();
    }
  };

  return (
    <div className={styles.footer}>
      <Button
        to={
          ownWalkthroughResult?.data
            ? `/walkthroughs/${ownWalkthroughResult.data.id}/edit`
            : `/levels/${level.id}/walkthrough`
        }
      >
        Write a text guide
      </Button>
      OR
      <div className={styles.input}>
        <TextInput
          type="url"
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          value={textInput}
          placeholder="Youtube video/playlist link"
        />
      </div>
      <Button disableTimeout={true} onClick={handleVideoButtonClick}>
        Add a video guide
      </Button>
    </div>
  );
};

export { WalkthroughsBar };
