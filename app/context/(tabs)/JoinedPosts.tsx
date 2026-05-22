import PostFeed from "@/components/PostFeed";
import { useAuth } from "@/components/auth-context";
import unjoinEvent from "@/scripts/unjoinEvent";
import unjoinQuest from "@/scripts/unjoinQuest";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { useEventStore } from "@/stores/eventStore";
import { useQuestStore } from "@/stores/questStore";


export default function JoinedPosts() {
    const { token } = useAuth();
    const events = useEventStore((s) => s.events);
    const quests = useQuestStore((s) => s.quests);
    const posts = [
        ...events.filter(e => e.joined).map(e => ({ ...e, type: "event" })),
        ...quests.filter(q => q.joined).map(q => ({ ...q, type: "quest" })),
    ];

    const updateEvent = useEventStore((s) => s.updateEvent);
    const updateQuest = useQuestStore((s) => s.updateQuest);


    // const fetch = async () => {
    //     const data = await getJoinedPostsCall(token);
    //     setPosts(data);
    // };

    // useEffect(() => {
    //     if (token) fetch();
    // }, [token]);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         if (token) fetch();
    //     }, [token])
    // );

    const handleUnjoin = (item: any) => {
        Alert.alert(
            "Unjoin?",
            "Are you sure you want to leave this?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unjoin",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (item.type === "event") {
                                await unjoinEvent(item.id, token);
                                updateEvent(item.id, { joined: false });
                            } else if (item.type === "quest") {
                                await unjoinQuest(item.id, token);
                                updateQuest(item.id, { joined: false });
                            }
                        } catch (e) {
                            console.log("Unjoin failed:", e);
                        }
                    }
                }
            ]
        );
    };

    if (posts.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                    You haven’t joined anything yet
                </Text>
                <Text style={styles.emptySubtitle}>
                    Explore events and quests to get started
                </Text>
            </View>
        );
    }
    const header = (
        <View style={styles.headerSummary}>
            <Text style={styles.summaryTitle}>You’re participating in</Text>
            <Text style={styles.summaryStats}>
            {posts.filter(p => p.type === "event").length} events •{" "}
            {posts.filter(p => p.type === "quest").length} quests
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <PostFeed data={posts} onEdit={() => {}} mode="joined" onUnjoin={handleUnjoin} ListHeader={header} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSummary: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ffffff",
    },
    summaryTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    summaryStats: {
        color: "#999",
        fontSize: 13,
        marginTop: 4,
    },
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    emptySubtitle: {
        color: "#888",
        fontSize: 13,
        marginTop: 8,
        textAlign: "center",
    },
});