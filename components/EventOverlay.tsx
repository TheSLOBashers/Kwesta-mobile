import { useAuth } from "@/components/auth-context";
import joinEvent from "@/scripts/joinEvent";
import unjoinEvent from "@/scripts/unjoinEvent";
import React, { useEffect, useRef, useState } from "react";
import {
  Appearance,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import overlayStyle from "../styles/overlayStyle";

interface Props {
  open: boolean;
  close: () => void;
  events: any;
  setEvents: (comments: any) => void;
  onPointsChanged: () => void;
  onSelectEvent: (comment: any) => void;
  selectedEvent: any;
}

const styles = overlayStyle.styles;
const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;
const textColor = Appearance.getColorScheme() === "light" ? "black" : "white";
const midTextColor = "grey";
const imageStyle = StyleSheet.create({
  image: {
    height: 20,
    width: 20,
    resizeMode: "stretch",
    marginRight: 10,
  },
  inline: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
});

export default function EventOverlay({
  close,
  events,
  setEvents,
  onPointsChanged,
  onSelectEvent,
  selectedEvent,
  open,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    if (!selectedEvent || !scrollRef.current) return;

    const index = events.findIndex((e: any) => e.id === selectedEvent.id);

    if (index !== -1 && index !== active) {
      scrollRef.current.scrollTo({
        x: index * (CARD_WIDTH + CARD_MARGIN) - CARD_MARGIN * 2,
        animated: true,
      });
    }
  }, [selectedEvent]);

  function handleJoin(eventId: any) {
    joinEvent(eventId, token)
      .then(async () => {
        // Update the local state to reflect the change
        setEvents((prevEvents: any) =>
          prevEvents.map((e: any) =>
            e.id === eventId ? { ...e, joined: true } : e,
          ),
        );
        if (onPointsChanged) {
          await onPointsChanged();
        }
        alert("Successfully joined event!");
      })
      .catch((error) => {
        alert("Error joining event: " + error.message);
      });
  }

  function handleUnjoin(eventId: any) {
    unjoinEvent(eventId, token)
      .then(() => {
        setEvents((prevEvents: any) =>
          prevEvents.map((e: any) =>
            e.id === eventId ? { ...e, joined: false } : e,
          ),
        );
        alert("Successfully unjoined event!");
      })
      .catch((error) => {
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
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const index = Math.round(x / (CARD_WIDTH + CARD_MARGIN));

                setActive(index);
                onSelectEvent(events[index]);
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
                return (
                  <View
                    key={`${e.id}-${i}`}
                    style={[
                      styles.Card,
                      { transform: [{ scale: i === active ? 1 : 0.92 }] },
                    ]}
                  >
                    <Text style={styles.author}>{e.authorName}</Text>
                    <Text style={{ color: midTextColor, marginBottom: 7 }}>
                      {formattedDate}
                    </Text>
                    <Text
                      style={{
                        color: textColor,
                        fontSize: 17,
                        marginBottom: 30,
                      }}
                    >
                      {e.description}
                    </Text>
                    {e.joined ? (
                      <Pressable
                        onPress={() => handleUnjoin(e.id)}
                        testID="unjoinEventButton"
                      >
                        <View style={imageStyle.inline}>
                          <Image
                            style={imageStyle.image}
                            source={require("../assets/images/exit_sign.png")}
                          />
                          <Text style={{ color: textColor }}>Unjoin event</Text>
                        </View>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => handleJoin(e.id)}
                        testID="joinEventButton"
                      >
                        <View style={imageStyle.inline}>
                          <Image
                            style={imageStyle.image}
                            source={require("../assets/images/enter_sign.png")}
                          />
                          <Text style={{ color: textColor }}>Join event</Text>
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
