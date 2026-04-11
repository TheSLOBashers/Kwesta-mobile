import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: any;
  onEdit: (item: any) => void;
};

export default function PostCard({ item, onEdit }: Props) {
    const text = item.comment || item.description || item.text;
    const formattedDate = new Date(item.date).toLocaleDateString();
    const formattedTime = new Date(item.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const author = item.authorName;

    return (
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
              <Text style={styles.author}>{author}</Text>
              <Text style={styles.meta}>{formattedDate} • {formattedTime}</Text>
          </View>
          <Pressable onPress={() => onEdit(item)} style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>

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
    position: "absolute",
    top: 10,
    right: 10,
  },
  editText: {
    color: "#4da6ff",
    fontSize: 13,
  },
});