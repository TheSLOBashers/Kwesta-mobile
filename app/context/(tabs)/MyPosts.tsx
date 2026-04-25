import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";

import { useAuth } from '@/components/auth-context';
import { Alert, StyleSheet, Text, View } from 'react-native';

import CommentForm from "@/components/CommentForm";
import EventForm from "@/components/EventForm";
import PostFeed from "@/components/PostFeed";
import updateCommentCall from "@/scripts/updateCommentCall";
import updateEventCall from "@/scripts/updateEventCall";
import updateQuestCall from "@/scripts/updateQuestCall";

import deleteCommentCall from "@/scripts/deleteCommentCall";
import deleteEventCall from "@/scripts/deleteEventCall";
import deleteQuestCall from "@/scripts/deleteQuestCall";
import getMyPostsCall from "@/scripts/getMyPostsCall";

function MyPosts() {
    const { user, username, token, loading: authLoading, moderator } = useAuth();
    const [loading, setLoading] = useState(true);

    const [myPosts, setMyPosts] = useState<any[]>([]);

    const [editingPost, setEditingPost] = useState<any>(null);

    const [activeTab, setActiveTab] = useState<"comment" | "event" | "quest">("comment");

    const isMod = (moderator==="True")

    const fetchAll = async () => {
        setLoading(true);

        try {
            const data = await getMyPostsCall(token);

            setMyPosts(data);
        } catch (e) {
            console.log("ERROR:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!token) return;

        fetchAll();
    }, [user, token, authLoading]);

    useFocusEffect(
        React.useCallback(() => {
            fetchAll();
        }, [])
    );

    async function handleEditSubmit(data: any) {
        if (!editingPost) return;

        let updated;

        if (editingPost.type === "comment") {
            updated = await updateCommentCall(editingPost.id, data, token);
        } 
        else if (editingPost.type === "event") {
            updated = await updateEventCall(editingPost.id, data, token);
        } 
        else if (editingPost.type === "quest") {
            updated = await updateQuestCall(editingPost.id, data, token);
        }

        if (!updated) return;

        setMyPosts((prev) =>
            prev.map((p) =>
                p.id === editingPost.id
                    ? { ...p, ...updated }
                    : p
            )
        );

        setEditingPost(null);
    }

    const handleDelete = (item: any) => {
        Alert.alert(
            "Delete?",
            "This action cannot be undone.",
            [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    if (!token) {
                        console.log("No token, cannot delete");
                        return;
                    }

                    try {
                        if (item.type === "comment") {
                            await deleteCommentCall(item.id, token);
                        } else if (item.type === "event") {
                            await deleteEventCall(item.id, token);
                        } else if (item.type === "quest") {
                            await deleteQuestCall(item.id, token);
                        }

                        setMyPosts(prev =>
                            prev.filter(p => p.id !== item.id)
                        );
                    } catch (e) {
                        console.log("Delete failed:", e);
                    }
                },
            },
            ]
        );
    };

    const filteredPosts = myPosts.filter(p => p.type === activeTab);

    if (myPosts.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                    You haven’t posted anything yet
                </Text>
                <Text style={styles.emptySubtitle}>
                    Start by creating your first event or quest
                </Text>
            </View>
        );
    }

    const header = (
        <View style={styles.headerSummary}>
            <Text style={styles.summaryTitle}>You’ve created</Text>
                <Text style={styles.summaryStats}>
                    {myPosts.filter(p => p.type === "comment").length} comments •{" "}
                    {myPosts.filter(p => p.type === "event").length} events •{" "}
                    {myPosts.filter(p => p.type === "quest").length} quests
                </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading session...</Text>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <View style={styles.tabs}>
                    <Text
                        style={[styles.tab, activeTab === "comment" && styles.activeTab]}
                        onPress={() => setActiveTab("comment")}
                    >
                        Comments
                    </Text>
                    <Text
                        style={[styles.tab, activeTab === "event" && styles.activeTab]}
                        onPress={() => setActiveTab("event")}
                    >
                        Events
                    </Text>

                    {isMod && (
                        <Text
                            style={[styles.tab, activeTab === "quest" && styles.activeTab]}
                            onPress={() => setActiveTab("quest")}
                        >
                            Quests
                        </Text>
                    )}
                </View>

                <PostFeed data={filteredPosts} onEdit={setEditingPost} mode="mine" onDelete={handleDelete} ListHeader={header} />

                {editingPost?.type === "comment" && (
                    <CommentForm
                        onSubmit={handleEditSubmit}
                        onClose={() => setEditingPost(null)}
                        username={username}
                        location={editingPost.location}
                        initialText={editingPost.comment}
                    />
                )}

                {editingPost?.type === "event" && (
                    <EventForm
                        onSubmit={handleEditSubmit}
                        onClose={() => setEditingPost(null)}
                        username={username}
                        location={editingPost.location}
                        initialText={editingPost.description}
                        initialDate={editingPost.date}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { height: "100%", width: "100%" },
    loadingText: { position: "absolute", top: "50%" },
    loadingIcon: { position: "absolute", top: "25%", right: "50%" },
    content: { height: "10%", width: "100%" },
    text: { color: "#ccc", textAlign: "center" },
    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: "15%",
        backgroundColor: "#111",
    },
    tab: {
        color: "#888",
        fontSize: 16,
    },
    activeTab: {
        color: "#fff",
        fontWeight: "700",
        borderBottomWidth: 2,
        borderBottomColor: "#4da6ff",
        paddingBottom: 4,
    },
    headerSummary: {
        paddingHorizontal: 16,
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

export default MyPosts;