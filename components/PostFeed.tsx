import { FlatList, StyleSheet } from "react-native";
import PostCard from "./PostCard";

export default function PostFeed({ data, onEdit, mode, onUnjoin, onDelete, ListHeader }: 
  { data: any[], onEdit: (item: any) => void, mode: "mine" | "joined", onUnjoin?: (item: any) => void, onDelete?: (item: any) => void, ListHeader?: React.ReactElement }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      renderItem={({ item }) => <PostCard item={item} onEdit={onEdit} mode={mode} onUnjoin={onUnjoin} onDelete={onDelete}/>}
      ListHeaderComponent={ListHeader}
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