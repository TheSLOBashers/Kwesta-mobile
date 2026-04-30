import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Devices from "@/components/Devices";
import LogOutButton from "@/components/LogOutButton";
import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import blockDeviceCall from "@/scripts/blockDeviceCall";
import getDevicesCall from "@/scripts/getDevicesCall";
import getPointRedemptionHistory, {
  PointRedemptionHistoryEntry,
} from "@/scripts/getPointRedemptionHistory";

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

  const loadRedemptionHistory = useCallback(async () => {
    const result = await getPointRedemptionHistory(token);
    setHistory(result.entries);
    setUsingMockData(result.usingMockData);
    setHistoryError(result.error);
  }, [token]);

  const loadDevices = useCallback(async () => {
    try {
      const result = await getDevicesCall(setLoadingDevices, setDevicesError, token);
      setDevices(Array.isArray(result) ? result : []);
      setDevicesError(null);
    } catch {
      setDevices([]);
    }
  }, [token]);

  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      await Promise.all([loadRedemptionHistory(), refreshUserPoints(), loadDevices()]);
      setLoadingHistory(false);
    };

    load();
  }, [loadDevices, loadRedemptionHistory, refreshUserPoints]);

  const handleRefreshHistory = useCallback(async () => {
    await Promise.all([loadRedemptionHistory(), refreshUserPoints()]);
  }, [loadRedemptionHistory, refreshUserPoints]);

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

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Account</Text>
      <Text style={[styles.text, { color: colors.text }]}>Username: {username}</Text>
      <Text style={[styles.pointsText, { color: colors.text }]}>
        Current Points: {points ?? 0}
      </Text>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Redemption History</Text>
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
          <Text style={[styles.refreshButtonText, { color: colors.text }]}>Refresh</Text>
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
          <Text style={[styles.metaText, { color: colors.text }]}>Loading history...</Text>
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
                <Text style={[styles.rewardName, { color: colors.text }]}>{item.rewardName}</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Devices</Text>
          {loadingDevices && <ActivityIndicator size="small" color={colors.tint} />}
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

        {!devicesError ? <Devices devices={devices} handleBlock={handleBlock} /> : null}
      </View>

      <LogOutButton
        setUsernameAs={setUsernameAs}
        setTokenAs={setTokenAs}
        setMod={setMod}
        setUserAs={setUserAs}
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
    gap: 12,
  },
  title: {
    fontFamily: "Cocogoose",
    fontSize: 28,
    marginTop: 20,
    marginBottom: 12,
    color: "#ccc",
  },
  text: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 4,
  },
  pointsText: {
    fontFamily: "Acephimere",
    fontSize: 16,
    marginBottom: 4,
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
