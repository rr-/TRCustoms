import { useCallback } from "react";
import { useState } from "react";
import { AutoComplete } from "src/components/common/AutoComplete";
import type { LevelNested } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import type { UserNested } from "src/services/UserService";

interface PlaylistAddFormProps {
  user: UserNested;
  onAdd?: () => void;
}

const PlaylistAddForm = ({ user, onAdd }: PlaylistAddFormProps) => {
  const [suggestions, setSuggestions] = useState<LevelNested[]>([]);

  const handleSearchTrigger = useCallback(async (userInput: string) => {
    if (!userInput) {
      setSuggestions([]);
      return;
    }
    const searchQuery = {
      search: userInput,
    };
    try {
      const response = await LevelService.searchLevels(searchQuery);
      if (response.results) {
        setSuggestions(response.results);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleResultApply = useCallback(
    async (level: LevelNested) => {
      try {
        await PlaylistService.create(user.id, {
          levelId: level.id,
          status: PlaylistItemStatus.NotYetPlayed,
        });
        onAdd?.();
      } catch (error) {
        console.error(error);
        if ((error as any).response?.data.code === "duplicate_level") {
          alert("This level was already added to the playlist.");
        } else {
          alert("Failed to add the level to the playlist.");
        }
      }
    },
    [user, onAdd]
  );

  return (
    <AutoComplete
      suggestions={suggestions}
      getResultText={(level) => level.name}
      getResultKey={(level) => level.id}
      onSearchTrigger={handleSearchTrigger}
      onResultApply={handleResultApply}
      placeholder="Search for a level to add it…"
    />
  );
};

export { PlaylistAddForm };
