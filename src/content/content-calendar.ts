import { type ContentPost } from "./content-types";
import { CONTENT_30_DAYS } from "./social-30-days";
import { EVENING_POSTS } from "./evening-30-days";

// Morning = existing 30 educative posts (with slot/time added)
export const MORNING_POSTS: ContentPost[] = CONTENT_30_DAYS.map((p) => ({
  ...p,
  slot: "morning" as const,
  time: "09:00",
}));

// Evening = 30 emotional/conversion posts
export { EVENING_POSTS };

// All 60 posts combined, sorted by day then slot
export const ALL_POSTS: ContentPost[] = [
  ...MORNING_POSTS,
  ...EVENING_POSTS,
].sort((a, b) => a.day - b.day || (a.slot === "morning" ? -1 : 1));

export const TOTAL_POSTS = ALL_POSTS.length;
export const POSTS_PER_DAY = 2;
