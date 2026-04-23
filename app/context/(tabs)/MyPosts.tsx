import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";

import { useAuth } from '@/components/auth-context';
import { StyleSheet, Text, View } from 'react-native';

import CommentForm from "@/components/CommentForm";
import EventForm from "@/components/EventForm";
import PostFeed from "@/components/PostFeed";
import updateCommentCall from "@/scripts/updateCommentCall";
import updateEventCall from "@/scripts/updateEventCall";
import updateQuestCall from "@/scripts/updateQuestCall";

import getMyPostsCall from "@/scripts/getMyPostsCall";

function MyPosts() {
    const { user, username, token, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);

    const [myPosts, setMyPosts] = useState<any[]>([]);

    const [editingPost, setEditingPost] = useState<any>(null);

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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading session...</Text>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <PostFeed data={myPosts} onEdit={setEditingPost} />

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
    text: { color: "#ccc", textAlign: "center" }
});

export default MyPosts;