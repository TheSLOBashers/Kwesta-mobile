import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/components/auth-context";
import LeaderboardListItem from "@/components/LeaderboardListItem";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import getLeaderboardCall from "../scripts/getLeaderboardCall";

type Props = {
  open: boolean;
  close: () => void;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  undername: string;
  points: number;
};

export default function LeaderboardOverlay({ open, close }: Props) {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      const result = await getLeaderboardCall(token);

      if (!isActive) {
        return;
      }

      setUsers(result.users);
      setError(result.error);
      setLoading(false);
    };

    loadLeaderboard();

    return () => {
      isActive = false;
    };
  }, [open, token]);

  if (!open) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.backdrop,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(0, 0, 0, 0.55)"
                : "rgba(17, 24, 28, 0.22)",
          },
        ]}
        onPress={close}
      />

      <View
        style={[
          styles.panel,
          {
            backgroundColor: colors.background,
            borderColor:
              colorScheme === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(10, 126, 164, 0.14)",
          },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              Leaderboard
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
              ]}
            >
              Sorted by points
            </Text>
          </View>

          <Pressable
            onPress={close}
            style={[
              styles.closeButton,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(10, 126, 164, 0.1)",
              },
            ]}
          >
            <Text style={[styles.closeText, { color: colors.text }]}>
              Close
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading leaderboard...
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.errorState}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                  {error}
                </Text>
                <Text
                  style={[
                    styles.errorSubtext,
                    { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
                  ]}
                >
                  The backend is rejecting the leaderboard request, so there is
                  nothing to show yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <LeaderboardListItem
                    rank={index + 1}
                    name={item.name}
                    undername={item.undername}
                    points={item.points}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text
                      style={[
                        styles.emptyText,
                        {
                          color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a",
                        },
                      ]}
                    >
                      No leaderboard data yet.
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  panel: {
    position: "absolute",
    top: 90,
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: "#0a0d12",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#98a2b3",
    marginTop: 4,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  closeText: {
    fontWeight: "700",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {},
  listContent: {
    paddingBottom: 12,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {},
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
