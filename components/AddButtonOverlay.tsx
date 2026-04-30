import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
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
            top: "50%",
            left: "50%",
            borderRadius: "100%",
            width: "10%",
            height: "5%",
            padding: "2%",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center",
            opacity: open ? 1 : 0,
        },
        commentButton: {
            backgroundColor: "#6A6A6A",
            transform: open
                ? "translate(250%, 400%) scale(1.0)"
                : "translate(0, 0) scale(0)",
        },
        eventButton: {
            backgroundColor: "#6A6A6A",
            transform: open
                ? "translate(0%, 500%) scale(1.0)"
                : "translate(0, 0) scale(0)",
        },
        questButton: {
            backgroundColor: "#f3c221",
        },
        imageContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
        },
        svg: {
            width: 25,
            height: 25,
            resizeMode: 'stretch',
        }
    });

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
            <AddButton onClick={() => setOpen(!open)} />
            <Pressable
                aria-label="add comment"
                style={[
                    styles.menuButton,
                    styles.commentButton
                ]}
                onPress={() => {
                    setFormType("comment");
                    setOpen(false);
                }}
                pointerEvents={open ? "auto" : "none"}
            >
                <View style={styles.imageContainer}>
                    <Image
                    style = {styles.svg}
                    source = {require('../assets/images/speech2.png')}
                    />
                </View>
            </Pressable>
            <Pressable
                aria-label="add event"
                style={[
                    styles.menuButton,
                    styles.eventButton
                ]}
                onPress={() => {
                    setFormType("event");
                    setOpen(false);
                }}
                pointerEvents={open ? "auto" : "none"}
            >
                <View style={styles.imageContainer}>
                    <Image
                    style = {styles.svg}
                    source = {require('../assets/images/event2.png')}
                    />
                </View>
            </Pressable>

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