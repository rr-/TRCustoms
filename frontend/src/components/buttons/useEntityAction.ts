import { useQueryClient } from "@tanstack/react-query";
import { resetQueries } from "src/utils/misc";

// The shared body of every entity action button (approve/reject/delete/...):
// run the service call, then invalidate the affected query caches. Returns a
// handler with the same arguments as `action` so it drops straight into a
// ConfirmButton (no args) or PromptButton (the prompt result).
const useEntityAction = <A extends unknown[]>(
  action: (...args: A) => Promise<void>,
  queryKeyPrefixes: string[],
) => {
  const queryClient = useQueryClient();
  return async (...args: A): Promise<void> => {
    await action(...args);
    await resetQueries(queryClient, queryKeyPrefixes);
  };
};

export { useEntityAction };
