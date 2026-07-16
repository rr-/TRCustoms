import { getPlaylistSearchQuery } from "../services/playlistSearchQuery";
import { hashKey } from "@tanstack/react-query";
import assert from "node:assert/strict";
import { test } from "vitest";

// The playlist table is rendered by DataTable, which registers its React Query
// entry under the key [queryName, searchFunc, searchQuery] (see
// components/common/DataTable/index.tsx). React Query hashes that key to decide
// cache identity. A closure (searchFunc) serialises to null in the hash, and
// queryName is the constant "playlists", so the ONLY thing that can make two
// users' tables distinct is the searchQuery. If the userId is not part of the
// searchQuery, every user's table collides on one cache entry and a
// previously-viewed user's playlist (or an empty result) leaks across.
//
// This reproduces the exact key DataTable builds and asserts it is per-user.
const buildPlaylistCacheKey = (userId: number): string => {
  const searchFunc = (query: unknown) => query; // stand-in for the real closure
  return hashKey(["playlists", searchFunc, getPlaylistSearchQuery(userId)]);
};

test("playlist cache key is distinct per user", () => {
  const keyForUser1 = buildPlaylistCacheKey(1);
  const keyForUser2 = buildPlaylistCacheKey(2);
  assert.notEqual(
    keyForUser1,
    keyForUser2,
    "playlist tables for different users must not share a cache entry",
  );
});

test("playlist search query carries the userId", () => {
  assert.equal(getPlaylistSearchQuery(42).userId, 42);
});
