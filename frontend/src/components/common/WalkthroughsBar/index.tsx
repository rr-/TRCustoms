import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { TextInput } from "src/components/common/TextInput";
import { KEY_RETURN } from "src/constants";
import { LevelNested } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { useUser } from "src/stores/user";
import { showAlertOnError } from "src/utils/misc";

interface WalkthroughsBarProps {
  level: LevelNested;
}

const WalkthroughsBar = ({ level }: WalkthroughsBarProps) => {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");

  const { user } = useUser();
  const ownWalkthroughResult = useQuery<WalkthroughDetails | null, Error>({
    queryKey: [
      "walkthrough",
      WalkthroughService.getWalkthroughById,
      level.id,
      user?.id,
    ],
    queryFn: async () => {
      if (!user) {
        return null;
      }
      const walkthroughs = await WalkthroughService.searchWalkthroughs({
        authors: [user.id],
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
  });

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
    <PermissionGuard require={UserPermission.postWalkthroughs}>
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
    </PermissionGuard>
  );
};

export { WalkthroughsBar };
