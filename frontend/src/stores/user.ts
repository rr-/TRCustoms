import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { create } from "zustand";

interface UserState {
  user: UserDetails | null;
  setUser: (user: UserDetails | null) => void;
  fetchUser: () => Promise<void>;
}

const useUser = create<UserState>((set) => ({
  user: null,

  setUser: (user: UserDetails | null): void => set({ user }),

  fetchUser: async (): Promise<void> => {
    try {
      set({ user: await UserService.getCurrentUser() });
    } catch {
      // A transient failure isn't a logout: leave the current user as-is
      // rather than forcing a signed-out state.
    }
  },
}));

export type { UserState };
export { useUser };
