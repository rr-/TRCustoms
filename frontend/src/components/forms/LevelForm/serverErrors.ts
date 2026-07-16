import type { UseFormReturn } from "react-hook-form";
import type { LevelFormValues } from "src/components/forms/LevelForm/schema";
import { extractNestedErrorText } from "src/utils/misc";
import { makeSentence } from "src/utils/string";

// The backend names some fields differently from the form (genre_ids ->
// genres, external_links come back nested), so LevelForm maps server errors
// itself rather than using the generic field-name match.
const applyLevelServerErrors = (
  form: UseFormReturn<LevelFormValues>,
  data: Record<string, unknown>,
): boolean => {
  const externalLinkErrors = extractNestedErrorText(data.external_links);
  const fieldErrors: { [K in keyof LevelFormValues]?: unknown } = {
    name: data.name,
    description: data.description,
    genres: data.genre_ids,
    external_links: externalLinkErrors.length ? externalLinkErrors : null,
    authors: data.author_ids,
    tags: data.tag_ids,
    engine_id: data.engine_id,
    difficulty_id: data.difficulty_id,
    duration_id: data.duration_id,
    cover_id: data.cover_id,
    screenshot_ids: data.screenshot_ids,
    file_id: data.file_id,
  };
  let applied = false;
  for (const [field, value] of Object.entries(fieldErrors)) {
    const message = Array.isArray(value) ? value[0] : value;
    if (message) {
      form.setError(field as keyof LevelFormValues, {
        type: "server",
        message: makeSentence(String(message)),
      });
      applied = true;
    }
  }
  return applied;
};

export { applyLevelServerErrors };
