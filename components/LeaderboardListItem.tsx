import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  name: string;
  undername: string;
  points: number;
  rank: number;
};

export default function LeaderboardListItem({
  name,
  undername,
  points,
  rank,
}: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor:
            colorScheme === "dark" ? "#10131a" : "rgba(10, 126, 164, 0.08)",
          borderColor:
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(10, 126, 164, 0.14)",
        },
      ]}
    >
      <View style={styles.leftColumn}>
        <Text style={[styles.rank, { color: colors.tint }]}>{rank}.</Text>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          {undername ? (
            <Text
              style={[
                styles.undername,
                { color: colorScheme === "dark" ? "#98a2b3" : "#5f6b7a" },
              ]}
              numberOfLines={1}
            >
              {undername}
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={[styles.points, { color: colors.text }]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  leftColumn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  rank: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 10,
    minWidth: 30,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  undername: {
    fontSize: 12,
    marginTop: 2,
  },
  points: {
    fontSize: 16,
    fontWeight: "800",
    minWidth: 52,
    textAlign: "right",
  },
});
