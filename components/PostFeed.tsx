import { FlatList, StyleSheet } from "react-native";
import PostCard from "./PostCard";

export default function PostFeed({ data }: { data: any[] }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard item={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 30, paddingBottom: 8 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#999" },
});