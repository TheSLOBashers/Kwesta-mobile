import { useAuth } from '@/components/auth-context';
import joinEvent from "@/scripts/joinEvent";
import unjoinEvent from "@/scripts/unjoinEvent";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import overlayStyle from "../styles/overlayStyle";

interface Props {
    open: boolean;
    close: () => void;
    events: any;
    setEvents: (comments: any) => void;
    onPointsChanged: () => void;
    onSelectEvent: (comment: any) => void
}

const styles = overlayStyle.styles;
const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;

export default function EventOverlay({ close, events, setEvents, onPointsChanged, onSelectEvent, open }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const [active, setActive] = useState(0);
    const { token } = useAuth();

    useEffect(() => {
        if (!onSelectEvent) return;
        onSelectEvent(events[active] ?? null);
    }, [active, events]);

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
                <>
                <Pressable style={styles.backdrop} onPress={close} />
            
                    <View style={styles.overlay} pointerEvents="box-none">
                        <ScrollView
                            testID="event-scroll"
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
                            {events.map((e: any, i: any) => {
                                const dateObj = new Date(e.date);
                                const formattedDate =
                                    dateObj.toLocaleDateString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }) +
                                    " • " +
                                    dateObj.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                return(
                                    <View key={`${e.id}-${i}`} style={[styles.Card, { transform: [{ scale: i === active ? 1 : 0.92 }] }]}>
                                        <Text style={styles.author}>{e.authorName}</Text>
                                        <Text>{formattedDate}</Text>
                                        <Text>{e.description}</Text>
                                        {e.joined ? (
                                            <Pressable onPress={() => handleUnjoin(e.id)}>
                                                <Text>Unjoin Event</Text>
                                            </Pressable>
                                        ) : (
                                            <Pressable onPress={() => handleJoin(e.id)}>
                                                <Text>Join Event</Text>
                                            </Pressable>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                </>
            )}
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