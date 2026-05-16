import UserProfile from "@/app/context/(tabs)/UserProfile";
import { useAuth } from "@/components/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import flagComment from "@/scripts/flagComment";
import likeComment from "@/scripts/likeComment";
import unflagComment from "@/scripts/unflagComment";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import overlayStyle from "../styles/overlayStyle";

interface Props {
  open: boolean;
  close: () => void;
  comments: any;
  setComments: (comments: any) => void;
  onPointsChanged: () => void;
  onSelectComment: (comment: any) => void;
}

const styles = overlayStyle.styles;
const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;
const midTextColor = "grey";
const imageStyle = StyleSheet.create({
    image: {
        height: 20,
        width: 20,
        resizeMode: 'stretch',
        marginRight: 10
    },
    inline: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10
    }
});

export default function CommentOverlay({
  close,
  comments,
  setComments,
  onPointsChanged,
  onSelectComment,
  open,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const { token } = useAuth();

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? "#0F0F0F" : "white";
  const textColor = colorScheme === 'light' ? "black" : "white";

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
                  likedByUser: true,
                }
              : c,
          ),
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
            c.id === CId ? { ...c, flaggedByUser: true } : c,
          ),
        );
        alert("Successfully flagged comment!");
      })
      .catch((error) => {
        alert("Error flagging comment: " + error.message);
      });
  }

  function handleUnflag(CId: any) {
    unflagComment(CId, token)
      .then(() => {
        setComments((prevComments: any) =>
          prevComments.map((c: any) =>
            c.id === CId ? { ...c, flaggedByUser: false } : c,
          ),
        );
        alert("Successfully unflagged comment!");
      })
      .catch((error) => {
        alert("Error unflagging comment: " + error.message);
      });
  }

  return (
    <View style={styles.backdrop}>
      {open && (
        <>
          <Pressable style={styles.backdrop} onPress={close} />

          <View style={styles.overlay} pointerEvents="box-none">
            <ScrollView
              testID="comment-scroll"
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
                      { backgroundColor: bgColor },
                      { transform: [{ scale: i === active ? 1 : 0.92 }] },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        console.log("Passing user " + c.authorName);
                        setSelectedUser(c.authorName);
                        setShowProfile(true);
                      }}
                    >
                      <Text style={[styles.author, {color: textColor}]}>{c.authorName}</Text>
                    </Pressable>

                    <Text style={{color: midTextColor, marginBottom: 7}}>{formattedDate}</Text>
                    <Text style={{color: textColor, fontSize: 17, marginBottom: 30}}>{c.comment}</Text>

                    <Pressable
                      onPress={() => handleLike(c.id)}
                      disabled={c.likedByUser}
                    >
                      <View style={imageStyle.inline}>
                        <Image style={imageStyle.image}
                          source={c.likedByUser ? require("../assets/images/heart_filled.png") : (colorScheme === 'light' ? require("../assets/images/heart_empty_black.png") : require("../assets/images/heart_empty_white.png"))}/>
                        <Text style={{color: textColor}}>{c.likes || 0}</Text>
                      </View>
                    </Pressable>

                    {c.flaggedByUser ? (
                      <Pressable onPress={() => handleUnflag(c.id)}>
                        <View style={imageStyle.inline}>
                          <Image style={imageStyle.image} source={require("../assets/images/flag_filled.png")}/>
                          <Text style={{color: textColor}}>Unflag</Text>
                        </View>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => handleFlag(c.id)}>
                        <View style={imageStyle.inline}>
                          <Image style={imageStyle.image} source={colorScheme === 'light' ? require("../assets/images/flag_empty_black.png") : require("../assets/images/flag_empty_white.png")}/>
                          <Text style={{color: textColor}}>Flag</Text>
                        </View>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}

      <Modal
        visible={showProfile}
        animationType="fade"
        transparent
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popup}>
            <Pressable onPress={() => setShowProfile(false)}>
              <Text style={{color: textColor, marginBottom: 5}}>Close</Text>
            </Pressable>

            <UserProfile userName={selectedUser} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
