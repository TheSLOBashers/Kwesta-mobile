import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Alert, TouchableWithoutFeedback } from "react-native";
import joinEvent from "@/scripts/joinEvent";
import unjoinEvent from "@/scripts/unjoinEvent";
import { useAuth } from '@/components/auth-context';
import { useSnappedCard } from "@/hooks/use-snapped-card";
import overlayStyle from "../styles/overlayStyle"

interface Props {
    open: boolean;
    close: () => void;
    events: any;
    setEvents: (comments: any) => void;
    onPointsChanged: () => void;
    onSelectEvent: (comment: any) => void
}

const styles = overlayStyle.styles;
const CARD_WIDTH = overlayStyle.CARD_WIDTH;
const CARD_MARGIN = overlayStyle.CARD_MARGIN;

export default function EventOverlay({ close, events, setEvents, onPointsChanged, onSelectEvent, open }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const { active, snapToCard } = useSnappedCard(0);
    const { token } = useAuth();

    useEffect(() => {
        if (!onSelectEvent) return;
        onSelectEvent(events[active] ?? null);
    }, [active, events]);

    const handleMomentumEnd = (e: any) => {
        const snapped = snapToCard(e.nativeEvent.contentOffset.x, CARD_WIDTH, CARD_MARGIN, events.length);
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
        joinEvent(eventId, token)
            .then(async () => {
                // Update the local state to reflect the change
                setEvents((prevEvents : any) =>
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
        unjoinEvent(eventId, token)
        .then(() => {
            setEvents((prevEvents: any) =>
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
                <Pressable style={styles.backdrop} onPress={close} />
            )}
            <View style={styles.overlay}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.Slider}
                    onMomentumScrollEnd={handleMomentumEnd}
                >
                    {events.map((e: any, i: any) => (
                        <TouchableWithoutFeedback key={`${e.id}-${i}`} onPress={() => { }}>
                            <View style={[styles.Card, { transform: [{ scale: i === active ? 1 : 0.92 }] }]}>
                                <Text style={styles.author}>{e.author}</Text>
                                <Text>{e.description}</Text>
                                {e.joined ? (
                                    <Pressable onPress={() => handleJoin(e.id)}>
                                        <Text>Join Event</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable onPress={() => handleUnjoin(e.id)}>
                                        <Text>Unjoin Event</Text>
                                    </Pressable>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
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