import { FlatList, StyleSheet } from "react-native";
import PostCard from "./PostCard";

export default function PostFeed({ data, onEdit }: { data: any[], onEdit: (item: any) => void }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => `${item.type}-${item.id ?? index}`}
      renderItem={({ item }) => <PostCard item={item} onEdit={onEdit} />}
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