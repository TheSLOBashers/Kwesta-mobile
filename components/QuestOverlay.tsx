import { useAuth } from '@/components/auth-context';
import joinQuest from "@/scripts/joinQuest";
import unjoinQuest from "@/scripts/unjoinQuest";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import overlayStyle from "../styles/overlayStyle";

interface Props {
    open: boolean;
    close: () => void;
    quests: any;
    setQuests: (comments: any) => void;
    onPointsChanged: () => void;
    onSelectQuest: (comment: any) => void
}

const styles = overlayStyle.styles;
const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;

export default function QuestOverlay({ close, quests, setQuests, onPointsChanged, onSelectQuest, open }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const [active, setActive] = useState(0);
    const { token } = useAuth();

    useEffect(() => {
        if (!onSelectQuest) return;
        onSelectQuest(quests[active] ?? null);
    }, [active, quests]);

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
                    snapToInterval={CARD_WIDTH + CARD_MARGIN}
                    snapToAlignment="center"
                    decelerationRate="fast"

                    onScroll={(e) => {
                        const x = e.nativeEvent.contentOffset.x;

                        const index = Math.round(x / (CARD_WIDTH + CARD_MARGIN));
                        setActive(index);
                    }}
                    scrollEventThrottle={16}
                >
                    {quests.map((q: any, i: any) => (
                            <View key={`${q.id}-${i}`} style={[styles.Card, { transform: [{ scale: i === active ? 1 : 0.92 }] }]}>
                                <Text style={styles.author}>{q.author}</Text>
                                <Text>{q.description}</Text>
                                {q.joined ? (
                                    <Pressable onPress={() => handleUnjoin(q.id)}>
                                        <Text>Unjoin Quest</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable onPress={() => handleJoin(q.id)}>
                                        <Text>Join Quest</Text>
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