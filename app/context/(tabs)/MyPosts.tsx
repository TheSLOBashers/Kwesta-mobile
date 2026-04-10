import getCommentsCall from "@/scripts/getCommentsCall";
import getEventsCall from "@/scripts/getEventsCall";
import getQuestsCall from "@/scripts/getQuestsCall";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";

import { useAuth } from '@/components/auth-context';
import { StyleSheet, Text, View } from 'react-native';

import PostFeed from "@/components/PostFeed";

function MyPosts() {
    const { user, username, token, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);

    const [myPosts, setMyPosts] = useState<any[]>([]);

    
    const fetchAll = async () => {
        setLoading(true);

        try {
            const [commentData, eventData, questData] = await Promise.all([
                getCommentsCall(token),
                getEventsCall(token),
                getQuestsCall(token),
            ]);

            const safeComments = Array.isArray(commentData) ? commentData : [];
            const safeEvents = Array.isArray(eventData) ? eventData : [];
            const safeQuests = Array.isArray(questData) ? questData : [];

            const all = [
                ...safeComments,
                ...safeQuests,
                ...safeEvents,
            ];

            const filtered = all.filter((post) => post.author === username);

            setMyPosts(filtered);
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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading session...</Text>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <PostFeed data={myPosts} />
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