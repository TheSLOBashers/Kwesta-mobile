import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Alert, TouchableWithoutFeedback } from "react-native";
import flagComment from "@/scripts/flagComment";
import likeComment from "@/scripts/likeComment";
import unflagComment from "@/scripts/unflagComment";
import { useAuth } from '@/components/auth-context';
import { useSnappedCard } from "@/hooks/use-snapped-card";
import overlayStyle from "../styles/overlayStyle"

interface Props {
    open: boolean;
    close: () => void;
    comments: any;
    setComments: (comments: any) => void;
    onPointsChanged: () => void;
    onSelectComment: (comment: any) => void
}

const styles = overlayStyle.styles;
const CARD_WIDTH = overlayStyle.CARD_WIDTH;
const CARD_MARGIN = overlayStyle.CARD_MARGIN;

export default function CommentOverlay({ close, comments, setComments, onPointsChanged, onSelectComment, open }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const { active, snapToCard } = useSnappedCard(0);
    const { token } = useAuth();

    useEffect(() => {
        if (!onSelectComment) return;
        onSelectComment(comments[active] ?? null);
    }, [active, comments]);

    const handleMomentumEnd = (e: any) => {
        const snapped = snapToCard(e.nativeEvent.contentOffset.x, CARD_WIDTH, CARD_MARGIN, comments.length);
        scrollRef.current?.scrollTo({ x: snapped * (CARD_WIDTH + CARD_MARGIN), animated: true });
    };

    function handleLike(commentId: any) {
        likeComment(commentId, token)
            .then(async () => {
                setComments((prevComments: any) =>
                    prevComments.map((c: any) =>
                        c.id === commentId
                            ? {
                                ...c,
                                likes: (c.likes || 0) + 1,
                                likedByUser: true
                            }
                            : c
                    )
                );
                if (onPointsChanged) {
                    await onPointsChanged();
                }
            })
            .catch((error: any) => {
                alert("Error liking comment: " + error.message);
            });
    }

    function handleFlag(CId: any) {
        flagComment(CId, token)
            .then(() => {
                // Update the local state to reflect the change
                setComments((prevComments: any) =>
                    prevComments.map((c: any) =>
                        c.id === CId ? { ...c, flaggedByUser: true } : c
                    )
                );
                alert("Successfully flagged comment!");
            })
            .catch(error => {
                alert("Error flagging comment: " + error.message);
            });
    }

    function handleUnflag(CId: any) {
        unflagComment(CId, token)
            .then(() => {
                setComments((prevComments: any) =>
                    prevComments.map((c: any) =>
                        c.id === CId ? { ...c, flaggedByUser: false } : c
                    )
                );
                alert("Successfully unflagged comment!");
            })
            .catch(error => {
                alert("Error unflagging comment: " + error.message);
            });
    }

    return (
        <View style={styles.backdrop}>
            {open && (
                <Pressable style={StyleSheet.absoluteFill} onPress={close} />
            )}
            <View style={styles.overlay} pointerEvents="box-none">
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.Slider}
                    onMomentumScrollEnd={handleMomentumEnd}
                >
                    {comments.map((c: any, i: any) => (
                            <View key={`${c.id}-${i}`} style={[styles.Card, { transform: [{ scale: i === active ? 1 : 0.92 }] }]}>
                                <Text style={styles.author}>{c.author}</Text>
                                <Text>{c.comment}</Text>
                                <Text>Likes: {c.likes || 0}</Text>
                                <Pressable onPress={() => handleLike(c.id)} disabled={c.likedByUser}>
                                    <Text>{c.likedByUser ? "Liked" : "Like Comment"}</Text>
                                </Pressable>
                                {c.flaggedByUser ? (
                                    <Pressable onPress={() => handleUnflag(c.id)}>
                                        <Text>Unflag comment</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable onPress={() => handleFlag(c.id)}>
                                        <Text>Flag comment</Text>
                                    </Pressable>
                                )}
                            </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

