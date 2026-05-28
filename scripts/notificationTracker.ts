export type NotifiableItem = {
  id?: string | number;
  authorId?: string | number;
  authorName?: string;
};

export type NotificationSnapshot = {
  nearbyCommentIds: Set<string>;
  nearbyQuestIds: Set<string>;
  followedEventIds: Set<string>;
};

export type NotificationDelta = {
  nextSnapshot: NotificationSnapshot;
  newNearbyComments: NotifiableItem[];
  newFollowedEvents: NotifiableItem[];
  newNearbyQuests: NotifiableItem[];
};

export type NotificationInputs = {
  nearbyComments: NotifiableItem[];
  allEvents: NotifiableItem[];
  nearbyQuests: NotifiableItem[];
  followingIds: Set<string>;
  currentUserId: string;
  previousSnapshot: NotificationSnapshot;
};

const toId = (value: string | number | undefined) => String(value ?? "");

const toNotificationSet = (items: NotifiableItem[]) =>
  new Set(items.map((item) => toId(item.id)).filter((id) => id.length > 0));

export const buildEmptyNotificationSnapshot = (): NotificationSnapshot => ({
  nearbyCommentIds: new Set(),
  nearbyQuestIds: new Set(),
  followedEventIds: new Set(),
});

export const calculateNotificationDelta = ({
  nearbyComments,
  allEvents,
  nearbyQuests,
  followingIds,
  currentUserId,
  previousSnapshot,
}: NotificationInputs): NotificationDelta => {
  const currentNearbyCommentIds = toNotificationSet(nearbyComments);
  const currentNearbyQuestIds = toNotificationSet(nearbyQuests);
  const currentFollowedEvents = allEvents.filter((event) => {
    const authorId = toId(event.authorId);
    return (
      authorId.length > 0 &&
      authorId !== currentUserId &&
      followingIds.has(authorId)
    );
  });
  const currentFollowedEventIds = toNotificationSet(currentFollowedEvents);

  return {
    nextSnapshot: {
      nearbyCommentIds: currentNearbyCommentIds,
      nearbyQuestIds: currentNearbyQuestIds,
      followedEventIds: currentFollowedEventIds,
    },
    newNearbyComments: nearbyComments.filter((comment) => {
      const commentId = toId(comment.id);
      return (
        commentId.length > 0 &&
        !previousSnapshot.nearbyCommentIds.has(commentId)
      );
    }),
    newFollowedEvents: currentFollowedEvents.filter((event) => {
      const eventId = toId(event.id);
      return (
        eventId.length > 0 && !previousSnapshot.followedEventIds.has(eventId)
      );
    }),
    newNearbyQuests: nearbyQuests.filter((quest) => {
      const questId = toId(quest.id);
      return (
        questId.length > 0 && !previousSnapshot.nearbyQuestIds.has(questId)
      );
    }),
  };
};
