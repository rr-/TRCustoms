// Central, serializable React Query keys — the single source of truth so a
// fetch key and the prefix used to invalidate it can never drift apart.
//
// Rules:
//  - never put a function reference in a key (it is not serializable and made
//    the old keys opaque);
//  - every entity's keys start with the same plural root, so invalidating
//    `X.all` refreshes that entity's lists and details together. (The old keys
//    mixed singular detail roots like ["level", ...] with plural invalidation
//    ["levels"], so edited detail pages went stale.)

type Key = readonly unknown[];

const entity = (root: string) => ({
  all: [root] as Key,
  // Base key for a list; DataList/DataTable append the search query.
  lists: [root, "list"] as Key,
  list: (query: unknown): Key => [root, "list", query],
  detail: (id: unknown): Key => [root, "detail", id],
});

const queryKeys = {
  levels: {
    ...entity("levels"),
    featured: (): Key => ["levels", "featured"],
    ratingStats: (id: unknown): Key => ["levels", "ratingStats", id],
  },
  reviews: {
    ...entity("reviews"),
    byAuthorAndLevel: (levelId: unknown, userId: unknown): Key => [
      "reviews",
      "byAuthorAndLevel",
      levelId,
      userId,
    ],
  },
  ratings: {
    ...entity("ratings"),
    byAuthorAndLevel: (levelId: unknown, userId: unknown): Key => [
      "ratings",
      "byAuthorAndLevel",
      levelId,
      userId,
    ],
  },
  walkthroughs: {
    ...entity("walkthroughs"),
    byLevelAndUser: (levelId: unknown, userId: unknown): Key => [
      "walkthroughs",
      "byLevelAndUser",
      levelId,
      userId,
    ],
  },
  users: entity("users"),
  news: entity("news"),
  events: entity("events"),
  tags: {
    ...entity("tags"),
    stats: (id: unknown): Key => ["tags", "stats", id],
  },
  genres: {
    ...entity("genres"),
    stats: (id: unknown): Key => ["genres", "stats", id],
  },
  auditLogs: entity("auditLogs"),
  playlists: {
    ...entity("playlists"),
    byLevel: (userId: unknown, levelId: unknown): Key => [
      "playlists",
      "byLevel",
      userId,
      levelId,
    ],
  },
  awardRecipients: {
    lists: (code: unknown, tier: unknown): Key => [
      "awardRecipients",
      "list",
      code,
      tier ?? "",
    ],
  },
};

export type { Key };
export { queryKeys };
