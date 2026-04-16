import LogOutButton from "@/components/LogOutButton";
import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import getPointRedemptionHistory, {
  PointRedemptionHistoryEntry,
} from "@/scripts/getPointRedemptionHistory";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Account() {
  const { username, token, setUsernameAs, setTokenAs, setMod, setUserAs } =
    useAuth();
  const { points, refreshUserPoints } = usePoints();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PointRedemptionHistoryEntry[]>([]);

  const loadRedemptionHistory = useCallback(async () => {
    const result = await getPointRedemptionHistory(token);
    setHistory(result.entries);
    setUsingMockData(result.usingMockData);
    setError(result.error);
  }, [token]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadRedemptionHistory(), refreshUserPoints()]);
      setLoading(false);
    };

    load();
  }, [loadRedemptionHistory, refreshUserPoints]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadRedemptionHistory(), refreshUserPoints()]);
    setRefreshing(false);
  }, [loadRedemptionHistory, refreshUserPoints]);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Account</Text>
      <Text style={[styles.text, { color: colors.text }]}>
        Username: {username}
      </Text>
      <Text style={[styles.pointsText, { color: colors.text }]}>
        Current Points: {points ?? 0}
      </Text>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Redemption History
        </Text>
        <Pressable
          onPress={handleRefresh}
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

      {error && (
        <Text
          style={[
            styles.metaText,
            { color: colorScheme === "dark" ? "#fca5a5" : "#b91c1c" },
          ]}
        >
          {error}
        </Text>
      )}

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.metaText, { color: colors.text }]}>
            Loading history...
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
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
          )}
          ListEmptyComponent={
            <Text
              style={[
                styles.metaText,
                { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
              ]}
            >
              You have no redemptions yet.
            </Text>
          }
        />
      )}

      <LogOutButton
        setUsernameAs={setUsernameAs}
        setTokenAs={setTokenAs}
        setMod={setMod}
        setUserAs={setUserAs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 48,
  },
  title: {
    fontFamily: "Cocogoose",
    fontSize: 28,
    marginBottom: 10,
  },
  text: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 4,
  },
  pointsText: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 16,
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
    paddingBottom: 12,
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
