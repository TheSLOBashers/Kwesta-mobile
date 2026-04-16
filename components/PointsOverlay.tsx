import { Pressable, StyleSheet, Text } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Props {
  points: number | null;
  onPress: () => void;
}

export default function PointsOverlay({ points, onPress }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Pressable
      style={[
        styles.overlay,
        {
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(10, 13, 18, 0.92)"
              : "rgba(255, 255, 255, 0.94)",
          borderColor:
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(10, 126, 164, 0.16)",
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.label,
          { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
        ]}
      >
        Points
      </Text>
      <Text style={[styles.points, { color: colors.text }]}>{points ?? 0}</Text>
      <Text style={[styles.hint, { color: colors.tint }]}>
        Tap for leaderboard
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: "6%",
    left: "6%",
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    zIndex: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  points: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
});
