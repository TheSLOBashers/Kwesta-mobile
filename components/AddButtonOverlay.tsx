import { useColorScheme } from "@/hooks/use-color-scheme.web";
import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { createAnimatedComponent, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import AddButton from "./AddButton";

import CommentForm from "./CommentForm";
import EventForm from "./EventForm";
//import EventForm from "./EventForm";
//import QuestForm from "./QuestForm";

interface location {
    lat: number;
    lng: number
}

interface Props {
    username: string | null;
    onAddComment: (data: any) => void;
    onAddEvent: (data: any) => void;
    onAddQuest: (data: any) => void;
    clickedLocation: location;
    location: any;
    setShowClickMarkers: (data: boolean) => void;
    activeOverlay: string | null;
    setActiveOverlay: (v: any) => void;
}

function AddButtonOverlay({ username = "Anonymous", onAddComment, onAddEvent, onAddQuest, clickedLocation, location, setShowClickMarkers, activeOverlay, setActiveOverlay }: Props) {

    const [open, setOpen] = useState(false);
    const [formType, setFormType] = useState<null | string>(null);
    const containerRef = useRef(null);
    const colorScheme = useColorScheme();

    const AnimatedPressable = createAnimatedComponent(Pressable);

    useEffect(() => {
        if(!(formType===null)) {
            setActiveOverlay(null);
        }

        if (formType === "event" || formType === "quest") {
            setShowClickMarkers(true);
        }
        else {
            setShowClickMarkers(false)
        }
    }, [formType]);

    useEffect(() => {
        setOpen(false);
    }, [activeOverlay]);

    const styles = StyleSheet.create({
        container: {
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000,
        },
        menuButton: {
            position: "absolute",
            bottom: "15%",
            left: "50%",
            borderRadius: "100%",
            width: "12%",
            height: "6%",
            padding: "2%",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center",
            opacity: open ? 1 : 0,
        },
        commentButton: {
            backgroundColor: "#2a69f1",
            left: "74%",
            transform: open
                ? "translate(250%, 400%) scale(1.0)"
                : "translate(0, 0) scale(0)",
        },
        eventButton: {
            backgroundColor: "#2a69f1",
            left: "74%",
            transform: open
                ? "translate(75%, 500%) scale(1.0)"
                : "translate(0, 0) scale(0)",
        },
        questButton: {
            backgroundColor: "#2a69f1",
        },
        buttonImage: {
            height: "70%",
            width: "70%",
            resizeMode: 'stretch',
        },
    });

    const [isOpen, setIsOpen] = useState(false);
    const animation = useSharedValue(0);

    const commentStyleAnim = useAnimatedStyle(() => {
        const translateYAnim = interpolate(
            animation.value,
            [0,1],
            [0,-60],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale: withSpring(animation.value) },
                { translateY: withSpring(translateYAnim) },
            ]
        }
    });

    const eventStyleAnim = useAnimatedStyle(() => {
        const translateYAnim = interpolate(
            animation.value,
            [0,1],
            [0,-120],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale: withSpring(animation.value) },
                { translateY: withSpring(translateYAnim) },
            ]
        }
    });

    const opacityStyleAnim = useAnimatedStyle(() => {
        const opacityAnim = interpolate(
            animation.value,
            [0, 0.5, 1],
            [0,0,1],
            Extrapolation.CLAMP
        );

        return { opacity: withSpring(opacityAnim) }
    });

    function buttonPress() {
        setIsOpen((current) => {
            animation.value  = current ? 0 : 1;
            return !current;
        })
    }

    return (
        <View
            ref={containerRef}
            style={styles.container}
            pointerEvents="box-none"
        >
            {open && (
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setOpen(false)}
                />
            )}
            <AddButton onClick={() => {
                setOpen(!open);
                buttonPress();
                }} />
            <AnimatedPressable
                aria-label="add comment"
                style={[
                    styles.menuButton,
                    styles.commentButton,
                    commentStyleAnim,
                    opacityStyleAnim
                ]}
                onPress={() => {
                    setFormType("comment");
                    setOpen(false);
                }}
                pointerEvents={open ? "auto" : "none"}
            >
                <Image style={styles.buttonImage}
                source={colorScheme === 'light' ? require('../assets/images/speech_white.png'): require('../assets/images/speech_black.png')}/>
            </AnimatedPressable>
            <AnimatedPressable
                aria-label="add event"
                style={[
                    styles.menuButton,
                    styles.eventButton,
                    eventStyleAnim,
                    opacityStyleAnim
                ]}
                onPress={() => {
                    setFormType("event");
                    setOpen(false);
                }}
                pointerEvents={open ? "auto" : "none"}
            >
                <Image style={styles.buttonImage}
                source={colorScheme === 'light' ? require('../assets/images/event_white.png'): require('../assets/images/event_black.png')}/>
            </AnimatedPressable>

            {formType === "comment" ? (
                <CommentForm
                    onSubmit={async (commentData: any) => {
                        await onAddComment(commentData);
                        setFormType(null);
                    }}
                    onClose={() => setFormType(null)}
                    username={username}
                    location={location}
                />
            ) : null}
            {formType === "event" ? (
                <EventForm
                    onSubmit={async (eventData: any) => {
                        await onAddEvent(eventData);
                        setFormType(null);
                    }}
                    onClose={() => setFormType(null)}
                    username={username}
                    location={clickedLocation}
                />
            ) : null}

        </View>
    );
}

/* 
{formType === "event" && (
                <EventForm
                    onSubmit={async (eventData) => {
                        await onAddEvent(eventData);
                        act(() => {
                            setFormType(null);
                        });
                    }}
                    onClose={() => setFormType(null)}
                    username={username}
                    clickedLocation={clickedLocation}
                />
            )}

            {formType === "quest" && (
                <QuestForm
                    onSubmit={async (questData) => {
                        await onAddQuest(questData);
                        act(() => {
                            setFormType(null);
                        });
                    }}
                    onClose={() => setFormType(null)}
                    username={username}
                    clickedLocation={clickedLocation}
                />
            )}
*/

/*
<button
                aria-label="add event"
                style={{
                    ...styles.menuButton,
                    ...styles.eventButton,
                    opacity: open ? 1 : 0,
                    transform: open
                        ? "translate(120%, -120%) scale(1.2)"
                        : "translate(0, 0) scale(0)",
                    pointerEvents: open ? "auto" : "none",
                }}
                onClick={() => {
                    setFormType("event");
                    setOpen(false);
                }}
            >
                E
            </button>
            {Boolean(localStorage.getItem("moderator")) && localStorage.getItem("moderator") ?
                <button
                    aria-label="add quest"
                    style={{
                        ...styles.menuButton,
                        ...styles.questButton,
                        opacity: open ? 1 : 0,
                        transform: open
                            ? "translate(0%, -210%) scale(1.2)"
                            : "translate(0, 0) scale(0)",
                        pointerEvents: open ? "auto" : "none",
                    }}
                    onClick={() => {
                        setFormType("quest");
                        setOpen(false);
                    }}
                >
                    Q
                </button>
                :
                null
            }
 */

export default AddButtonOverlay;