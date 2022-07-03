import "./Modal.css";
import "./WalkthroughsModal.css";
import { useContext } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { PushButton } from "src/components/PushButton";
import { TextInput } from "src/components/TextInput";
import { WalkthroughsTable } from "src/components/WalkthroughsTable";
import { BaseModal } from "src/components/modals/BaseModal";
import { KEY_RETURN } from "src/constants";
import { UserContext } from "src/contexts/UserContext";
import { LevelNested } from "src/services/LevelService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { showAlertOnError } from "src/utils/misc";

interface WalkthroughsModalProps {
  level: LevelNested;
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
}

const getWalkthroughSearchQuery = (
  levelId: number
): WalkthroughSearchQuery => ({
  levels: [levelId],
  page: null,
  sort: "-created",
  search: "",
  isApproved: true,
});

interface WalkthroughsModalFooterProps {
  level: LevelNested;
}

const WalkthroughsModalFooter = ({ level }: WalkthroughsModalFooterProps) => {
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
          walkthroughs.results[0].id
        );
      }
      return null;
    }
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
    <div className="WalkthroughsModalFooter">
      <PushButton
        to={
          ownWalkthroughResult?.data
            ? `/walkthroughs/${ownWalkthroughResult.data.id}/edit`
            : `/levels/${level.id}/walkthrough`
        }
      >
        Write a text guide
      </PushButton>
      OR
      <TextInput
        type="url"
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        value={textInput}
        placeholder="Youtube video/playlist link"
      />
      <PushButton disableTimeout={true} onClick={handleVideoButtonClick}>
        Add a video guide
      </PushButton>
    </div>
  );
};

const WalkthroughsModal = ({
  level,
  isActive,
  onIsActiveChange,
}: WalkthroughsModalProps) => {
  const [walkthroughSearchQuery, setWalkthroughSearchQuery] = useState<
    WalkthroughSearchQuery
  >(getWalkthroughSearchQuery(level.id));

  return (
    <BaseModal
      title="Walkthroughs"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
      buttons={<WalkthroughsModalFooter level={level} />}
    >
      <WalkthroughsTable
        showLevelNames={false}
        showAuthors={true}
        showWalkthroughType={false}
        showStatus={false}
        searchQuery={walkthroughSearchQuery}
        onSearchQueryChange={setWalkthroughSearchQuery}
      />
    </BaseModal>
  );
};

export { WalkthroughsModal };
