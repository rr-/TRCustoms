import type { PlaylistSearchQuery } from "./PlaylistService";

// The userId is carried in the search query itself (not just the request path)
// so that the React Query cache key for a playlist table is distinct per user.
// Without it, every user's table would share one cache entry and a
// previously-viewed user's playlist (or an empty result) would leak across.
//
// This lives in its own module (with only a type-only import) so it can be
// exercised by the test runner, which cannot resolve the runtime "src/*"
// aliases that the full PlaylistService pulls in.
const getPlaylistSearchQuery = (userId: number): PlaylistSearchQuery => ({
  userId: userId,
  page: null,
  pageSize: 100,
  sort: "-status,-last_updated",
});

export { getPlaylistSearchQuery };
