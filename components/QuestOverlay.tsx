import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Alert, TouchableWithoutFeedback } from "react-native";
import joinEvent from "@/scripts/joinEvent";
import joinQuest from "@/scripts/joinQuest";
import unjoinQuest from "@/scripts/unjoinQuest";
import unjoinEvent from "@/scripts/unjoinEvent";
import { useAuth } from '@/components/auth-context';
import { useSnappedCard } from "@/hooks/use-snapped-card";
import overlayStyle from "../styles/overlayStyle"

interface Props {
    open: boolean;
    close: () => void;
    quests: any;
    setQuests: (comments: any) => void;
    onPointsChanged: () => void;
    onSelectQuest: (comment: any) => void
}

const styles = overlayStyle.styles;
const CARD_WIDTH = overlayStyle.CARD_WIDTH;
const CARD_MARGIN = overlayStyle.CARD_MARGIN;

export default function QuestOverlay({ close, quests, setQuests, onPointsChanged, onSelectQuest, open }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const { active, snapToCard } = useSnappedCard(0);
    const { token } = useAuth();

    useEffect(() => {
        if (!onSelectQuest) return;
        onSelectQuest(quests[active] ?? null);
    }, [active, quests]);

    const handleMomentumEnd = (e: any) => {
        const snapped = snapToCard(e.nativeEvent.contentOffset.x, CARD_WIDTH, CARD_MARGIN, quests.length);
        scrollRef.current?.scrollTo({ x: snapped * (CARD_WIDTH + CARD_MARGIN), animated: true });
    };

    /*
    function handleJoin(CId: any) {
        flagComment(CId, token)
            .then(() => {
                // Update the local state to reflect the change
                setEvents((prevComments: any) =>
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

    function handleUnjoin(CId: any) {
        unflagComment(CId, token)
            .then(() => {
                setEvents((prevComments: any) =>
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
            */

    function handleJoin(eventId: any) {
        joinQuest(eventId, token)
            .then(async () => {
                // Update the local state to reflect the change
                setQuests((prevEvents : any) =>
                prevEvents.map((e: any) =>
                    e.id === eventId ? { ...e, joined: true } : e
                )
                );
                if (onPointsChanged) {
                await onPointsChanged();
                }
                alert("Successfully joined event!");
            })
            .catch(error => {
                alert("Error joining event: " + error.message);
            });
    }

    function handleUnjoin(eventId : any) {
        unjoinQuest(eventId, token)
        .then(() => {
            setQuests((prevEvents: any) =>
            prevEvents.map((e: any) =>
                e.id === eventId ? { ...e, joined: false } : e
            )
            );
            alert("Successfully unjoined event!");
        })
        .catch(error => {
            alert("Error joining event: " + error.message);
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
                    {quests.map((q: any, i: any) => (
                            <View key={`${q.id}-${i}`} style={[styles.Card, { transform: [{ scale: i === active ? 1 : 0.92 }] }]}>
                                <Text style={styles.author}>{q.author}</Text>
                                <Text>{q.description}</Text>
                                {q.joined ? (
                                    <Pressable onPress={() => handleJoin(q.id)}>
                                        <Text>Join Quest</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable onPress={() => handleUnjoin(q.id)}>
                                        <Text>Unjoin Quest</Text>
                                    </Pressable>
                                )}
                            </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

/*
{e.flaggedByUser ? (
                                    <Pressable onPress={() => handleUnflag(e.id)}>
                                        <Text>Unflag comment</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable onPress={() => handleJoin(e.id)}>
                                        <Text>Flag comment</Text>
                                    </Pressable>
                                )}
*/