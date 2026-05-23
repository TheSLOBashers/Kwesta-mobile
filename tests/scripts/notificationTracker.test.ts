import {
  buildEmptyNotificationSnapshot,
  calculateNotificationDelta,
} from "../../scripts/notificationTracker";

describe("notificationTracker", () => {
  it("detects new nearby comments, followed events, and quests", () => {
    const previousSnapshot = buildEmptyNotificationSnapshot();
    const followingIds = new Set(["followed-user"]);

    const delta = calculateNotificationDelta({
      nearbyComments: [{ id: "comment-1", authorName: "Alice" }],
      allEvents: [
        { id: "event-1", authorId: "followed-user", authorName: "Bob" },
        { id: "event-2", authorId: "current-user", authorName: "Me" },
        { id: "event-3", authorId: "someone-else", authorName: "Cam" },
      ],
      nearbyQuests: [{ id: "quest-1", authorName: "Dana" }],
      followingIds,
      currentUserId: "current-user",
      previousSnapshot,
    });

    expect(delta.newNearbyComments).toEqual([
      { id: "comment-1", authorName: "Alice" },
    ]);
    expect(delta.newFollowedEvents).toEqual([
      { id: "event-1", authorId: "followed-user", authorName: "Bob" },
    ]);
    expect(delta.newNearbyQuests).toEqual([
      { id: "quest-1", authorName: "Dana" },
    ]);
    expect(delta.nextSnapshot.nearbyCommentIds.has("comment-1")).toBe(true);
    expect(delta.nextSnapshot.followedEventIds.has("event-1")).toBe(true);
    expect(delta.nextSnapshot.nearbyQuestIds.has("quest-1")).toBe(true);
  });

  it("suppresses repeat notifications for already-seen items", () => {
    const previousSnapshot = {
      nearbyCommentIds: new Set(["comment-1"]),
      nearbyQuestIds: new Set(["quest-1"]),
      followedEventIds: new Set(["event-1"]),
    };

    const delta = calculateNotificationDelta({
      nearbyComments: [{ id: "comment-1", authorName: "Alice" }],
      allEvents: [
        { id: "event-1", authorId: "followed-user", authorName: "Bob" },
      ],
      nearbyQuests: [{ id: "quest-1", authorName: "Dana" }],
      followingIds: new Set(["followed-user"]),
      currentUserId: "current-user",
      previousSnapshot,
    });

    expect(delta.newNearbyComments).toEqual([]);
    expect(delta.newFollowedEvents).toEqual([]);
    expect(delta.newNearbyQuests).toEqual([]);
  });

  it("ignores events from users the current user does not follow", () => {
    const delta = calculateNotificationDelta({
      nearbyComments: [],
      allEvents: [
        { id: "event-1", authorId: "unfollowed-user", authorName: "Eve" },
      ],
      nearbyQuests: [],
      followingIds: new Set(),
      currentUserId: "current-user",
      previousSnapshot: buildEmptyNotificationSnapshot(),
    });

    expect(delta.newFollowedEvents).toEqual([]);
  });
});
