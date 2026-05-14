import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";
import getUserBadgesCall from "@/scripts/getUserBadges";
import { useCallback, useEffect, useState } from "react";

interface Props {
  user: {
    name?: string | null;
  };
  points: number;
}

export default function UserProfile({ user }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { username, token } = useAuth();
  const { points, refreshUserPoints } = usePoints();

  const [badges, setBadges] = useState<string[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

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

  useEffect(() => {
    refreshUserPoints();
    loadBadges();
  }, [refreshUserPoints, loadBadges]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.container}></View>

      <View style={[styles.row]}>
        <Image
          source={require("@/assets/images/profile-placeholder.png")}
          style={styles.image}
        ></Image>
        <Text style={[styles.title, { color: colors.text }]}>
          {username ?? "Unknown User"}
        </Text>
      </View>

      <Text style={[styles.text, { color: colors.text }]}>
        Points: {points ?? 0}
      </Text>

      <View style={styles.badgesSection}>
        <Text style={[styles.subtitle, { color: colors.text }]}>Badges</Text>

        {loadingBadges ? (
          <Text style={[styles.text, { color: colors.text }]}>
            Loading badges...
          </Text>
        ) : badges.length > 0 ? (
          badges.map((badge) => (
            <Text key={badge} style={[styles.text, { color: colors.text }]}>
              {badge}
            </Text>
          ))
        ) : (
          <Text style={[styles.text, { color: colors.text }]}>
            No badges yet.
          </Text>
        )}
      </View>
    </View>
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
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  subtitle: {
    fontFamily: "Cocogoose",
    fontSize: 18,
    marginBottom: 8,
  },
  badgesSection: {
    marginTop: 20,
  },
});
