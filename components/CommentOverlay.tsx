import { useAuth } from '@/components/auth-context';
import flagComment from "@/scripts/flagComment";
import likeComment from "@/scripts/likeComment";
import unflagComment from "@/scripts/unflagComment";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import overlayStyle from "../styles/overlayStyle";

interface Props {
    open: boolean;
    close: () => void;
    comments: any;
    setComments: (comments: any) => void;
    onPointsChanged: () => void;
    onSelectComment: (comment: any) => void
}

const styles = overlayStyle.styles;
const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;

export default function CommentOverlay({ close, comments, setComments, onPointsChanged, onSelectComment, open }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const [active, setActive] = useState(0);
    const { token } = useAuth();

    useEffect(() => {
        if (!onSelectComment) return;
        onSelectComment(comments[active] ?? null);
    }, [active, comments]);

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
                <>
                    <Pressable
                        style={styles.backdrop}
                        onPress={close}
                    />

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
                            {comments.map((c: any, i: any) => {
                                const dateObj = new Date(c.date);

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

                                return (
                                    <View
                                        key={`${c.id}-${i}`}
                                        style={[
                                            styles.Card,
                                            { transform: [{ scale: i === active ? 1 : 0.92 }] },
                                        ]}
                                        >
                                        <Text style={styles.author}>{c.authorName}</Text>
                                        <Text style={{marginBottom: '3%'}}>{formattedDate}</Text>
                                        <Text style={{marginBottom: '3%'}}>{c.comment}</Text>
                                        <Text style={{marginBottom: '5%'}}>Likes: {c.likes || 0}</Text>
                                            
                                        <Pressable
                                            style={{flexDirection: 'row', marginBottom: '3%'}}
                                            onPress={() => handleLike(c.id)}
                                            disabled={c.likedByUser}
                                        >
                                            <Image
                                                style = {imageStyles.image}
                                                source = {c.likedByUser ? require('../assets/images/thumbsup.png') : require('../assets/images/thumbsup_non.png')}
                                            />
                                            <Text>{c.likedByUser ? "Liked" : "Like Comment"}</Text>
                                        </Pressable>

                                        {c.flaggedByUser ? (
                                            <Pressable style={{flexDirection: 'row'}} onPress={() => handleUnflag(c.id)}>
                                                <Image
                                                    style = {imageStyles.image}
                                                    source = {require('../assets/images/flag.png')}
                                                />
                                                <Text>Unflag comment</Text>
                                            </Pressable>
                                        ) : (
                                            <Pressable style={{flexDirection: 'row'}} onPress={() => handleFlag(c.id)}>
                                                <Image
                                                    style = {imageStyles.image}
                                                    source = {require('../assets/images/flag_non.png')}
                                                />
                                                <Text>Flag comment</Text>
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

const imageStyles = StyleSheet.create({
  image: {
    width: 15,
    height: 20,
    resizeMode: 'stretch',
    marginRight: '2%',
  },
  pressableContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  }
});