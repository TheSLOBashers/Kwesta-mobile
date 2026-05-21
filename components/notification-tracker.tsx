import { useAuth } from "@/components/auth-context";
import getCommentsByAreaCall from "@/scripts/getCommentsByAreaCall";
import getEventsCall from "@/scripts/getEventsCall";
import getQuestsByAreaCall from "@/scripts/getQuestsByAreaCall";
import getUserProfileCall from "@/scripts/getUserProfileCall";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

type Coordinates = {
  latitude: number;
  longitude: number;
};

const COMMENT_RADIUS = 1;
const QUEST_RADIUS = 10;
const POLL_INTERVAL_MS = 60_000;
const LOCATION_DISTANCE_INTERVAL_METERS = 25;
const NOTIFICATION_CHANNEL_ID = "kwesta-alerts";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    //newer NotificationBehavior includes banner/list flags
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const emptySet = () => new Set<string>();

const toKeySet = (items: { id?: string | number }[]) => {
  return new Set(
    items.map((item) => String(item.id ?? "")).filter((id) => id.length > 0),
  );
};

function NotificationTracker() {
  const { token, user } = useAuth();
  const locationRef = useRef<Coordinates | null>(null);
  const previousNearbyCommentsRef = useRef<Set<string>>(emptySet());
  const previousNearbyQuestsRef = useRef<Set<string>>(emptySet());
  const previousFollowedEventsRef = useRef<Set<string>>(emptySet());
  const hasPrimedRef = useRef(false);
  const pollingRef = useRef(false);
  const notificationsEnabledRef = useRef(false);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const resetState = () => {
      locationRef.current = null;
      previousNearbyCommentsRef.current = emptySet();
      previousNearbyQuestsRef.current = emptySet();
      previousFollowedEventsRef.current = emptySet();
      hasPrimedRef.current = false;
      pollingRef.current = false;
      notificationsEnabledRef.current = false;
    };

    const configureAndroidChannel = async () => {
      if (Platform.OS !== "android") {
        return;
      }

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: "Kwesta alerts",
        importance: Notifications.AndroidImportance.HIGH,
      });
    };

    const ensureNotificationPermission = async () => {
      await configureAndroidChannel();

      if (Platform.OS === "web") {
        notificationsEnabledRef.current = false;
        return;
      }

      const current = await Notifications.getPermissionsAsync();
      if (current.status === "granted") {
        notificationsEnabledRef.current = true;
        return;
      }

      const requested = await Notifications.requestPermissionsAsync();
      notificationsEnabledRef.current = requested.status === "granted";
    };

    const notify = async (title: string, body: string) => {
      if (!notificationsEnabledRef.current || Platform.OS === "web") {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    };

    const refreshNotifications = async () => {
      if (pollingRef.current || !token || !locationRef.current) {
        return;
      }

      pollingRef.current = true;

      try {
        const coords = locationRef.current;
        if (!coords) {
          return;
        }

        const [profile, nearbyComments, allEvents, nearbyQuests] =
          await Promise.all([
            getUserProfileCall(token),
            getCommentsByAreaCall(
              token,
              coords.latitude,
              coords.longitude,
              COMMENT_RADIUS,
            ),
            getEventsCall(token),
            getQuestsByAreaCall(
              token,
              coords.latitude,
              coords.longitude,
              QUEST_RADIUS,
            ),
          ]);

        const followingIds = new Set(
          profile?.following.map((followedUser) => followedUser.id) ?? [],
        );
        const currentUserId = String(user ?? "");

        const currentNearbyComments = toKeySet(nearbyComments);
        const currentNearbyQuests = toKeySet(nearbyQuests);
        const currentFollowedEvents = new Set<string>(
          (allEvents as { id?: string | number; authorId?: string | number }[])
            .filter(
              (event: { id?: string | number; authorId?: string | number }) => {
                const authorId = String(event.authorId ?? "");
                return (
                  authorId.length > 0 &&
                  authorId !== currentUserId &&
                  followingIds.has(authorId)
                );
              },
            )
            .map((event: { id?: string | number }) => String(event.id ?? ""))
            .filter((id: string) => id.length > 0),
        );

        if (!hasPrimedRef.current) {
          previousNearbyCommentsRef.current = currentNearbyComments;
          previousNearbyQuestsRef.current = currentNearbyQuests;
          previousFollowedEventsRef.current = currentFollowedEvents;
          hasPrimedRef.current = true;
          return;
        }

        for (const comment of nearbyComments) {
          const commentId = String(comment.id ?? "");
          if (
            commentId.length > 0 &&
            !previousNearbyCommentsRef.current.has(commentId)
          ) {
            const author = comment.authorName || "Someone";
            await notify(
              "Nearby comment detected",
              `${author} left a comment near you.`,
            );
          }
        }

        for (const event of allEvents) {
          const eventId = String(event.id ?? "");
          const authorId = String(event.authorId ?? "");

          if (
            eventId.length > 0 &&
            authorId.length > 0 &&
            authorId !== currentUserId &&
            followingIds.has(authorId) &&
            !previousFollowedEventsRef.current.has(eventId)
          ) {
            const author = event.authorName || "Someone you follow";
            await notify(
              "Followed user posted an event",
              `${author} shared a new event.`,
            );
          }
        }

        for (const quest of nearbyQuests) {
          const questId = String(quest.id ?? "");
          if (
            questId.length > 0 &&
            !previousNearbyQuestsRef.current.has(questId)
          ) {
            const author = quest.authorName || "Someone";
            await notify(
              "Nearby quest available",
              `${author} added a quest close to you.`,
            );
          }
        }

        previousNearbyCommentsRef.current = currentNearbyComments;
        previousNearbyQuestsRef.current = currentNearbyQuests;
        previousFollowedEventsRef.current = currentFollowedEvents;
      } catch (error) {
        console.error("Error refreshing notification tracker:", error);
      } finally {
        pollingRef.current = false;
      }
    };

    const startTracking = async () => {
      if (!token || cancelled) {
        resetState();
        return;
      }

      await ensureNotificationPermission();

      const permission = await Location.requestForegroundPermissionsAsync();
      if (cancelled || permission.status !== "granted") {
        resetState();
        return;
      }

      const initialLocation = await Location.getCurrentPositionAsync({});
      if (cancelled) {
        return;
      }
      locationRef.current = initialLocation.coords;

      await refreshNotifications();
      if (cancelled) {
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: POLL_INTERVAL_MS,
          distanceInterval: LOCATION_DISTANCE_INTERVAL_METERS,
        },
        (position) => {
          locationRef.current = position.coords;
          void refreshNotifications();
        },
      );

      intervalId = setInterval(() => {
        void refreshNotifications();
      }, POLL_INTERVAL_MS);
    };

    void startTracking();

    return () => {
      cancelled = true;
      intervalId && clearInterval(intervalId);
      locationSubscription?.remove();
      resetState();
    };
  }, [token, user]);

  return null;
}

export default NotificationTracker;
