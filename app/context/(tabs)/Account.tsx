import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import Devices from "@/components/Devices";
import LogOutButton from "@/components/LogOutButton";
import SafeImage from "@/components/Safe-Image";
import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";
import backend from "@/constants/backend";
import { Colors } from "@/constants/theme";
import blockDeviceCall from "@/scripts/blockDeviceCall";
import followUserCall from "@/scripts/followUserCall";
import getDevicesCall from "@/scripts/getDevicesCall";
import getJoinedPostsCall from "@/scripts/getJoinedPostsCall";
import getMyPostsCall from "@/scripts/getMyPostsCall";
import getPointRedemptionHistory, {
  PointRedemptionHistoryEntry,
} from "@/scripts/getPointRedemptionHistory";
import getUserBadgesCall from "@/scripts/getUserBadges";
import getUserProfileCall, {
  SocialUser,
  UserProfile,
} from "@/scripts/getUserProfileCall";
import unfollowUserCall from "@/scripts/unfollowUserCall";
import { useColorScheme } from "react-native";

type AccountItem = {
  id: string;
  type: string;
  date?: string;
  location?: unknown;
  description?: string;
  comment?: string;
};

const toCount = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatRelativeDate = (isoDate?: string) => {
  if (!isoDate) {
    return "Recently";
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatLocation = (location: unknown) => {
  if (typeof location === "string") {
    return location;
  }

  if (!location || typeof location !== "object") {
    return "Location unavailable";
  }

  const maybeLocation = location as { lat?: unknown; lng?: unknown };

  if (
    typeof maybeLocation.lat === "number" &&
    typeof maybeLocation.lng === "number"
  ) {
    return `Lat ${maybeLocation.lat.toFixed(3)}, Lng ${maybeLocation.lng.toFixed(3)}`;
  }

  return "Location unavailable";
};

export default function Account() {
  const { username, token, setUsernameAs, setTokenAs, setMod, setUserAs } =
    useAuth();
  const { points, refreshUserPoints } = usePoints();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [history, setHistory] = useState<PointRedemptionHistoryEntry[]>([]);

  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  const [badges, setBadges] = useState<string[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<AccountItem[]>([]);
  const [joinedPosts, setJoinedPosts] = useState<AccountItem[]>([]);
  const [loadingHighlights, setLoadingHighlights] = useState(true);
  const [socialActionUserId, setSocialActionUserId] = useState<string | null>(
    null,
  );

  const loadRedemptionHistory = useCallback(async () => {
    const result = await getPointRedemptionHistory(token);
    setHistory(result.entries);
    setUsingMockData(result.usingMockData);
    setHistoryError(result.error);
  }, [token]);

  const loadDevices = useCallback(async () => {
    try {
      const result = await getDevicesCall(
        setLoadingDevices,
        setDevicesError,
        token,
      );
      setDevices(Array.isArray(result) ? result : []);
      setDevicesError(null);
    } catch {
      setDevices([]);
    }
  }, [token]);

  const loadBadges = useCallback(async () => {
    setLoadingBadges(true);
    try {
      const result = await getUserBadgesCall(token);
      setBadges(Array.isArray(result) ? result : []);
    } catch {
      setBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  }, [token]);

  const loadHighlights = useCallback(async () => {
    setLoadingHighlights(true);

    try {
      if (!token) {
        setProfileData(null);
        setMyPosts([]);
        setJoinedPosts([]);
        return;
      }

      const [profileResult, postsResult, joinedResult] = await Promise.all([
        getUserProfileCall(token),
        getMyPostsCall(token),
        getJoinedPostsCall(token),
      ]);

      setProfileData(profileResult);
      setMyPosts(Array.isArray(postsResult) ? postsResult : []);
      setJoinedPosts(Array.isArray(joinedResult) ? joinedResult : []);
    } catch {
      setProfileData(null);
      setMyPosts([]);
      setJoinedPosts([]);
    } finally {
      setLoadingHighlights(false);
    }
  }, [token]);

  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      await Promise.all([
        loadRedemptionHistory(),
        refreshUserPoints(),
        loadDevices(),
        loadBadges(),
        loadHighlights(),
      ]);
      setLoadingHistory(false);
    };

    load();
  }, [
    loadBadges,
    loadDevices,
    loadHighlights,
    loadRedemptionHistory,
    refreshUserPoints,
  ]);

  const handleRefreshHistory = useCallback(async () => {
    await Promise.all([loadRedemptionHistory(), refreshUserPoints()]);
  }, [loadRedemptionHistory, refreshUserPoints]);

  const handleFollowBack = useCallback(
    async (userId: string) => {
      setSocialActionUserId(userId);
      const didFollow = await followUserCall(token, userId);

      if (didFollow) {
        await loadHighlights();
      }

      setSocialActionUserId(null);
    },
    [loadHighlights, token],
  );

  const handleUnfollow = useCallback(
    async (userId: string) => {
      setSocialActionUserId(userId);
      const didUnfollow = await unfollowUserCall(token, userId);

      if (didUnfollow) {
        await loadHighlights();
      }

      setSocialActionUserId(null);
    },
    [loadHighlights, token],
  );

  async function handleBlock(device: any) {
    blockDeviceCall(token, device)
      .then(() => {
        setDevices((prevDevices: any[]) =>
          prevDevices.map((entry: any) =>
            entry.device === device ? { ...entry, allowed: false } : entry,
          ),
        );
      })
      .catch((error: any) => {
        alert("Blocking device failed." + error.message);
      });
  }

  const formatDate = (isoDate: string) => {
    const parsed = new Date(isoDate);

    if (Number.isNaN(parsed.getTime())) {
      return "Unknown date";
    }

    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const followerCount = toCount(
    profileData?.followersCount ?? profileData?.followers,
  );
  const followingCount = toCount(
    profileData?.followingCount ?? profileData?.following,
  );
  const hasFollowerCount =
    profileData !== null &&
    ("followersCount" in profileData || "followers" in profileData);
  const hasFollowingCount =
    profileData !== null &&
    ("followingCount" in profileData || "following" in profileData);
  const commentCount = myPosts.filter((post) => post.type === "comment").length;
  const eventRsvps = joinedPosts.filter((post) => post.type === "event");
  const questJoins = joinedPosts.filter((post) => post.type === "quest");
  const recentComments = myPosts
    .filter((post) => post.type === "comment")
    .slice(0, 3);
  const followingUsers = profileData?.following ?? [];
  const followerUsers = profileData?.followers ?? [];
  const followingIds = new Set(followingUsers.map((user) => user.id));
  const renderSocialUser = (
    user: SocialUser,
    action: "follow" | "unfollow",
  ) => {
    const isLoading = socialActionUserId === user.id;
    const label =
      action === "follow"
        ? followingIds.has(user.id)
          ? "Following"
          : "Follow"
        : "Unfollow";
    const isDisabled =
      isLoading || (action === "follow" && followingIds.has(user.id));

    return (
      <View
        key={user.id}
        style={[
          styles.socialRow,
          {
            borderColor:
              colorScheme === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(10, 126, 164, 0.15)",
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)"
          },
        ]}
      >
        <View style={styles.socialUserText}>
          <Text style={[styles.socialUsername, { color: colors.text }]}>
            {user.username}
          </Text>
          <Text
            style={[
              styles.socialMeta,
              { color: colorScheme === "dark" ? "#b3c0cf" : "#5f6b7a" },
            ]}
          >
            {user.points} points
          </Text>
        </View>
        <Pressable
          disabled={isDisabled}
          onPress={() =>
            action === "follow"
              ? handleFollowBack(user.id)
              : handleUnfollow(user.id)
          }
          style={[
            styles.socialButton,
            {
              opacity: isDisabled ? 0.55 : 1,
              borderColor: colors.tint,
              backgroundColor:
                action === "unfollow" ? "transparent" : "#5f6b7a",
            },
          ]}
        >
          <Text
            style={[
              styles.socialButtonText,
              { color: action === "unfollow" ? colors.tint : "#ffffff" },
            ]}
          >
            {isLoading ? "..." : label}
          </Text>
        </Pressable>
      </View>
    );
  };

  const ProfileContainerCard = ({ count, label }: { count: number | null; label: string }) => {
    return (
      <View style={[styles.heroMetaItem, {
        backgroundColor:
          colorScheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f7fcfe",
      }]}>
        <Text style={[styles.heroMetaValue, { color: colors.text }]}>
          {count ?? 0}
        </Text>
        <Text
          style={[
            styles.heroMetaLabel,
            { color: colorScheme === "dark" ? "#b3c0cf" : "#5f6b7a" },
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 30, fontSize: 32 }]}>Account</Text>
      <View
        style={[
          styles.heroCard,
          {
            shadowOpacity: 0,
            shadowColor: "transparent",
            borderColor:
              colorScheme === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(10, 126, 164, 0.15)",
            backgroundColor:
              colorScheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f7fcfe",
          },
          {
            marginTop: 15,
            marginBottom: 10,
          }
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.tint }]}>
              Your profile
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {username ?? "Account"}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colorScheme === "dark" ? "#b3c0cf" : "#5f6b7a" },
              ]}
            >
              Keep track of your badges, RSVPs, and community activity in one
              place.
            </Text>
          </View>

          <Pressable
            onPress={loadHighlights}
            style={[styles.followButton, { borderColor: colors.tint }]}
          >
            <Text style={[styles.followButtonText, { color: colors.tint }]}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <View style={[styles.heroMetaRow]}>
          <ProfileContainerCard count={points} label="Points" />
          <ProfileContainerCard count={badges.length} label="Badges" />
          <ProfileContainerCard count={eventRsvps.length} label="RSVPS" />
        </View>
      </View>

      <View style={[styles.listContent, styles.activityCard,
      {
        borderColor:
          colorScheme === "dark"
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(10, 126, 164, 0.15)",
        backgroundColor:
          colorScheme === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.9)",
      },]}>
        <Text style={[styles.sectionTitle, { color: colors.text },]}>
          Badges
        </Text>
        {loadingBadges ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={[styles.metaText, { color: colors.text }]}>
              Loading badges...
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
            {badges.map((badge: string) => (
              <SafeImage uri={`${backend}badges/${badge}`} key={badge} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionGap}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Followers
          </Text>
          <Text style={[styles.sectionCount, { color: colors.tint }]}>
            {followerUsers.length}
          </Text>
        </View>

        {followerUsers.length > 0 ? (
          <View style={styles.socialList}>
            {followerUsers
              .slice(0, 4)
              .map((user) => renderSocialUser(user, "follow"))}
          </View>
        ) : (
          <Text
            style={[
              styles.metaText,
              { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
            ]}
          >
            No followers yet.
          </Text>
        )}
      </View>

      <View style={styles.sectionGap}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Following
          </Text>
          <Text style={[styles.sectionCount, { color: colors.tint }]}>
            {followingUsers.length}
          </Text>
        </View>

        {followingUsers.length > 0 ? (
          <View style={styles.socialList}>
            {followingUsers
              .slice(0, 4)
              .map((user) => renderSocialUser(user, "unfollow"))}
          </View>
        ) : (
          <Text
            style={[
              styles.metaText,
              { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
            ]}
          >
            You are not following anyone yet.
          </Text>
        )}
      </View>

      <View style={styles.sectionGap}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Event RSVPs
          </Text>
          <Text style={[styles.sectionCount, { color: colors.tint }]}>
            {eventRsvps.length}
          </Text>
        </View>

        {eventRsvps.length > 0 ? (
          <View style={styles.listContent}>
            {eventRsvps.filter((item, index) => index < 3).map((item) => (
              <View
                key={item.id}
                style={[
                  styles.activityCard,
                  {
                    borderColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(10, 126, 164, 0.15)",
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.9)",
                  },
                ]}
              >
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {item.description ?? "Event RSVP"}
                </Text>
                <Text
                  style={[
                    styles.activityMeta,
                    { color: colorScheme === "dark" ? "#b3c0cf" : "#5f6b7a" },
                  ]}
                >
                  {formatRelativeDate(item.date)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={[
              styles.metaText,
              { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
            ]}
          >
            No event RSVPs yet.
          </Text>
        )}
      </View>

      <View style={styles.sectionGap}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Joined quests
          </Text>
          <Text style={[styles.sectionCount, { color: colors.tint }]}>
            {questJoins.length}
          </Text>
        </View>

        {questJoins.length > 0 ? (
          <View style={styles.listContent}>
            {questJoins.filter((item, index) => index < 3).map((item) => (
              <View
                key={item.id}
                style={[
                  styles.activityCard,
                  {
                    borderColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(10, 126, 164, 0.15)",
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.9)",
                  },
                ]}
              >
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {item.description ?? "Quest joined"}
                </Text>
                <Text
                  style={[
                    styles.activityMeta,
                    { color: colorScheme === "dark" ? "#b3c0cf" : "#5f6b7a" },
                  ]}
                >
                  {formatRelativeDate(item.date)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={[
              styles.metaText,
              { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
            ]}
          >
            No quests joined yet.
          </Text>
        )}
      </View>

      <View style={[styles.sectionGap, { marginBottom: 0 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comments
          </Text>
          <Text style={[styles.sectionCount, { color: colors.tint }]}>
            {commentCount}
          </Text>
        </View>
      </View>

      <View style={[styles.sectionGap, { marginTop: 0, marginLeft: 8 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent comments
          </Text>
        </View>

        {loadingHighlights ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={[styles.metaText, { color: colors.text }]}>
              Loading profile activity...
            </Text>
          </View>
        ) : recentComments.length > 0 ? (
          <View style={styles.listContent}>
            {recentComments.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.activityCard,
                  {
                    borderColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(10, 126, 164, 0.15)",
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.9)",
                  },
                ]}
              >
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {item.comment ?? "Comment"}
                </Text>
                <Text
                  style={[
                    styles.activityMeta,
                    { color: colorScheme === "dark" ? "#b3c0cf" : "#5f6b7a" },
                  ]}
                >
                  {formatRelativeDate(item.date)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={[
              styles.metaText,
              { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
            ]}
          >
            No comments yet.
          </Text>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Redemption History
        </Text>
        <Pressable
          onPress={handleRefreshHistory}
          style={[
            styles.refreshButton,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(10, 126, 164, 0.1)",
            },
          ]}
        >
          <Text style={[styles.refreshButtonText, { color: colors.text }]}>
            Refresh
          </Text>
        </Pressable>
      </View>

      {usingMockData && (
        <Text
          style={[
            styles.metaText,
            { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
          ]}
        >
          Backend history endpoint is unavailable. Showing temporary mock data.
        </Text>
      )}

      {historyError && (
        <Text
          style={[
            styles.metaText,
            { color: colorScheme === "dark" ? "#fca5a5" : "#b91c1c" },
          ]}
        >
          {historyError}
        </Text>
      )}

      {loadingHistory ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.metaText, { color: colors.text }]}>
            Loading history...
          </Text>
        </View>
      ) : history.length > 0 ? (
        <View style={styles.listContent}>
          {history.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  borderColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(10, 126, 164, 0.16)",
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(255, 255, 255, 0.9)",
                },
              ]}
            >
              <View style={styles.cardTopRow}>
                <Text style={[styles.rewardName, { color: colors.text }]}>
                  {item.rewardName}
                </Text>
                <Text style={[styles.pointsCost, { color: colors.tint }]}>
                  -{item.pointsRedeemed} pts
                </Text>
              </View>
              <Text
                style={[
                  styles.cardMeta,
                  { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
                ]}
              >
                {formatDate(item.redeemedAt)} • {item.status}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text
          style={[
            styles.metaText,
            { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
          ]}
        >
          You have no redemptions yet.
        </Text>
      )}

      <View style={styles.sectionGap}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Devices
          </Text>
          <Text style={[styles.sectionCount, { color: colors.tint }]}>
            {devices.length}
          </Text>
          {loadingDevices && (
            <ActivityIndicator size="small" color={colors.tint} />
          )}
        </View>

        {devicesError && (
          <Text
            style={[
              styles.metaText,
              { color: colorScheme === "dark" ? "#fca5a5" : "#b91c1c" },
            ]}
          >
            {devicesError}
          </Text>
        )}

        {!devicesError ? (
          <Devices devices={devices} handleBlock={handleBlock} colorScheme={colorScheme} />
        ) : null}
      </View>

      <LogOutButton
        setUsernameAs={setUsernameAs}
        setTokenAs={setTokenAs}
        setMod={setMod}
        setUserAs={setUserAs}
        colorScheme={colorScheme}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 48,
    gap: 16,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Cocogoose",
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: "Acephimere",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  followButtonText: {
    fontWeight: "800",
    fontSize: 14,
  },
  heroMetaRow: {
    flexDirection: "row",
    gap: 12,
  },
  heroMetaItem: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  heroMetaValue: {
    fontFamily: "Cocogoose",
    fontSize: 20,
  },
  heroMetaLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
  },
  statValue: {
    fontFamily: "Cocogoose",
    fontSize: 22,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryChip: {
    flexBasis: "31%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.12)",
  },
  summaryChipLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryChipValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badgePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  activityMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  socialList: {
    gap: 10,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  socialUserText: {
    flex: 1,
  },
  socialUsername: {
    fontSize: 15,
    fontWeight: "800",
  },
  socialMeta: {
    marginTop: 4,
    fontSize: 13,
  },
  socialButton: {
    minWidth: 88,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "800",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailValue: {
    marginTop: 6,
    fontFamily: "Cocogoose",
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Cocogoose",
    fontSize: 20,
  },
  sectionGap: {
    marginTop: 12,
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  refreshButtonText: {
    fontWeight: "700",
  },
  metaText: {
    fontSize: 13,
    marginBottom: 10,
  },
  loadingState: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
  },
  listContent: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  rewardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  pointsCost: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 13,
  },
});
