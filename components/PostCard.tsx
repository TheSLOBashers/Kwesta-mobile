import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: any;
  onEdit: (item: any) => void;
  mode: "mine" | "joined";
  onUnjoin?: (item: any) => void;
  onDelete?: (item: any) => void;
};

export default function PostCard({ item, onEdit, mode, onUnjoin, onDelete }: Props) {
    const text = item.comment || item.description || item.text;
    const formattedDate = new Date(item.date).toLocaleDateString();
    const formattedTime = new Date(item.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const author = item.authorName;

    const label =
      item.type === "event"
        ? "EVENT"
        : item.type === "quest"
        ? "QUEST"
        : "COMMENT";

    const borderColor =
      item.type === "event"
        ? "#4da6ff"
        : item.type === "quest"
        ? "#ff9f0a"
        : "#34c759";

    return (
        <View style={[styles.card, { borderLeftColor: borderColor }]}>
          {/* Header */}
          <View style={styles.headerTop}>
            <Text style={styles.author}>{author}</Text>

            <View style={styles.rightHeader}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{label}</Text>
              </View>

              {mode !== "joined" ? (
                <Pressable onPress={() => onEdit?.(item)} style={styles.editButton}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => onUnjoin?.(item)} style={styles.unjoinButton}>
                  <Text style={styles.unjoinText}>Unjoin</Text>
                </Pressable>
              )}
              {mode === "mine" && (
                <Pressable
                  onPress={() => onDelete?.(item)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              )}
              
            </View>
          </View>
          <Text style={styles.meta}>{formattedDate} • {formattedTime}</Text>

          {/* Content */}
          <Text style={styles.text}>{text}</Text>

          {/* Footer (optional extra info) */}
          <View style={styles.footer}>
              {item.likes !== undefined && (
                <Text style={styles.small}>❤️ {item.likes}</Text>
              )}

              {item.flag !== undefined && (
                <Text style={styles.small}>🚩 {item.flag}</Text>
              )}
          </View>
        </View>
    );
    }

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c1c1e",
    padding: 14,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 14,
    position: "relative",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  header: {
    marginBottom: 8,
  },
  author: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  text: {
    color: "#e5e5e5",
    fontSize: 15,
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  small: {
    color: "#888",
    fontSize: 12,
  },
  editButton: {
    backgroundColor: "#4da6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  unjoinButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unjoinText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: "#aaa",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});