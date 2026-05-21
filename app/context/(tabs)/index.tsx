import React, { useEffect, useMemo, useState } from "react";

import AddButtonOverlay from "@/components/AddButtonOverlay";
import CommentOverlay from "@/components/CommentOverlay";
import Comments from "@/components/Comments";
import EventOverlay from "@/components/EventOverlay";
import Events from "@/components/Events";
import LeaderboardOverlay from "@/components/LeaderboardOverlay";
import MapSection from "@/components/MapSection";
import PointsOverlay from "@/components/PointsOverlay";
import QuestOverlay from "@/components/QuestOverlay";
import Quests from "@/components/Quests";
import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";
import addCommentCall from "@/scripts/addCommentCall";
import addEventCall from "@/scripts/addEventCall";
import addQuestCall from "@/scripts/addQuestCall";
import getCommentsByAreaCall from "@/scripts/getCommentsByAreaCall";
import getEventsByAreaCall from "@/scripts/getEventsByAreaCall";
import getQuestsByAreaCall from "@/scripts/getQuestsByAreaCall";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function UserFeed() {
  type MapItem = {
    id: string;
    createdAt: string;
  };
  type CommentItem = MapItem & {
    authorId: string;
    authorName: string;
    comment: string;
    location: { lat: number; lng: number };
    likes: number;
    likedByUser: boolean;
    flaggedByUser: boolean;
  };
  type EventItem = MapItem & {
    description: string;
    location: any;
    joined: boolean;
  };
  type QuestItem = MapItem & {
    description: string;
    points: number;
    location: any;
    joined: boolean;
  };

  const { user, username, token } = useAuth();
  const { refreshUserPoints, points } = usePoints();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [clickedLocation, setclickedLocation] = useState({ lat: 0, lng: 0 });
  const [showClickMarkers, setShowClickMarkers] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState<
    "comments" | "events" | "quests" | "leaderboard" | null
  >(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const selectedComment = useMemo(
    () => comments.find((c: any) => c.id === selectedCommentId) || null,
    [comments, selectedCommentId],
  );

  const selectedQuest = useMemo(
    () => quests.find((q: any) => q.id === selectedQuestId) || null,
    [quests, selectedQuestId],
  );

  const selectedEvent = useMemo(
    () => events.find((e: any) => e.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const fetchInitial = async () => {
    if (!location) return;

    setLoading(true);

    const [commentData, eventData, questData] = await Promise.all([
      getCommentsByAreaCall(token, location.latitude, location.longitude, 1),
      getEventsByAreaCall(token, location.latitude, location.longitude, 10),
      getQuestsByAreaCall(token, location.latitude, location.longitude, 10),
    ]);

    setComments(commentData);
    setEvents(eventData);
    setQuests(questData);

    const all = [...commentData, ...eventData, ...questData];

    if (all.length > 0) {
      const newest = all.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )[all.length - 1];

      setLastSync(newest.createdAt);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!location || !lastSync) return;

    const interval = setInterval(async () => {
      const [commentData, eventData, questData] = await Promise.all([
        getCommentsByAreaCall(
          token,
          location.latitude,
          location.longitude,
          1,
          lastSync,
        ),
        getEventsByAreaCall(
          token,
          location.latitude,
          location.longitude,
          10,
          lastSync,
        ),
        getQuestsByAreaCall(
          token,
          location.latitude,
          location.longitude,
          10,
          lastSync,
        ),
      ]);

      if (commentData.length) {
        setComments((prev) => [...prev, ...commentData]);
      }

      if (eventData.length) {
        setEvents((prev) => [...prev, ...eventData]);
      }

      if (questData.length) {
        setQuests((prev) => [...prev, ...questData]);
      }

      const allNew = [...commentData, ...eventData, ...questData];

      if (allNew.length > 0) {
        const newest = allNew.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )[allNew.length - 1];

        setLastSync(newest.createdAt);
      }
    }, 15000); // 15s

    return () => clearInterval(interval);
  }, [location]);

  useEffect(() => {
    fetchInitial();
  }, [location]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationAllowed(false);
        return;
      }
      setLocationAllowed(true);

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const handleAddComment = async (data: any) => {
    const newComment = await addCommentCall(data, token);
    if (!newComment) {
      return;
    }

    const commentWithUsername = {
      comment: newComment.comment,
      id: newComment._id,
      authorId: newComment.author,
      authorName: username,
      likes: newComment.likes || 0,
      likedByUser: newComment.likedByUser ?? false,
      flaggedByUser: newComment.flaggedByUser ?? false,
      location: newComment.location || { lat: 0, lng: 0 },
      date: newComment.date,
    };

    setComments((prev: any) => [commentWithUsername, ...prev]);
  };

  const handleAddEvent = async (data: any) => {
    const newEvent = await addEventCall(data, token);
    if (!newEvent) {
      return;
    }

    setEvents((prev: any) => [
      {
        id: newEvent._id,
        authorId: newEvent.author,
        authorName: username,
        date: newEvent.date,
        time: newEvent.time,
        description: newEvent.description,
        location: newEvent.location,
        joined: false,
        image: newEvent.image,
        flag: newEvent.flag,
      },
      ...prev,
    ]);
  };

  const handleAddQuest = async (data: any) => {
    const newQuest = await addQuestCall(
      data.description,
      data.points,
      data.date,
      data.time,
      data.location,
      token,
    );
    if (!newQuest) {
      return;
    }

    setQuests((prev: any) => [
      {
        id: newQuest._id,
        authorId: newQuest.author,
        authorName: username,
        date: newQuest.date,
        time: newQuest.time,
        description: newQuest.description,
        location: newQuest.location,
        joined: false,
        image: newQuest.image,
        flag: newQuest.flag,
      },
      ...prev,
    ]);
  };

  if (loading)
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={[styles.text, styles.loadingText]}>Loading feed...</Text>
        <ActivityIndicator
          style={styles.loadingIcon}
          size="large"
          color="#FF6C00"
        />
      </View>
    );

  if (!location && !locationAllowed)
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={[styles.text, styles.loadingText]}>
          Kwesta needs your location to run!
        </Text>
        <ActivityIndicator
          style={styles.loadingIcon}
          size="large"
          color="#FF6C00"
        />
      </View>
    );

  if (!location && locationAllowed)
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={[styles.text, styles.loadingText]}>Loading map...</Text>
        <ActivityIndicator
          style={styles.loadingIcon}
          size="large"
          color="#FF6C00"
        />
      </View>
    );

  let overlay = null;
  if (activeOverlay === "comments") {
    overlay = (
      <CommentOverlay
        comments={comments}
        setComments={setComments}
        onPointsChanged={refreshUserPoints}
        onSelectComment={(c) => setSelectedCommentId(c?.id ?? null)}
        selectedComment={selectedComment}
        open={true}
        close={() => setActiveOverlay(null)}
      />
    );
  }

  if (activeOverlay === "events") {
    overlay = (
      <EventOverlay
        events={events}
        setEvents={setEvents}
        onPointsChanged={refreshUserPoints}
        onSelectEvent={(e) => setSelectedEventId(e?.id ?? null)}
        selectedEvent={selectedEvent}
        open={true}
        close={() => setActiveOverlay(null)}
      />
    );
  }

  if (activeOverlay === "quests") {
    overlay = (
      <QuestOverlay
        quests={quests}
        setQuests={setQuests}
        onPointsChanged={refreshUserPoints}
        onSelectQuest={(q) => setSelectedQuestId(q?.id ?? null)}
        selectedQuest={selectedQuest}
        open={true}
        close={() => setActiveOverlay(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapSection
        comments={comments}
        selectedCommentId={selectedCommentId}
        quests={quests}
        selectedQuestId={selectedQuestId}
        events={events}
        selectedEventId={selectedEventId}
        setSelectedCommentId={setSelectedCommentId}
        setSelectedEventId={setSelectedEventId}
        setSelectedQuestId={setSelectedQuestId}
        setActiveOverlay={setActiveOverlay}
        setclickedLocation={setclickedLocation}
        showClickMarkers={showClickMarkers}
        clickedLocation={clickedLocation}
        location={location}
      />
      <Comments
        comments={comments}
        setComments={setComments}
        onPointsChanged={refreshUserPoints}
        onSelectComment={(comment: any) =>
          setSelectedCommentId(comment?.id ?? null)
        }
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
      />
      <Events
        events={events}
        setEvents={setEvents}
        onPointsChanged={refreshUserPoints}
        onSelectEvent={(event: any) => setSelectedEventId(event?.id ?? null)}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
      />
      <Quests
        quests={quests}
        setQuests={setQuests}
        onPointsChanged={refreshUserPoints}
        onSelectQuest={(event: any) => setSelectedQuestId(event?.id ?? null)}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
      />
      <AddButtonOverlay
        username={username}
        onAddComment={handleAddComment}
        onAddEvent={handleAddEvent}
        onAddQuest={handleAddQuest}
        clickedLocation={clickedLocation}
        setShowClickMarkers={setShowClickMarkers}
        location={location}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
      />
      {activeOverlay !== "comments" &&
        activeOverlay !== "events" &&
        activeOverlay !== "quests" && (
          <PointsOverlay
            points={points}
            onPress={() => setActiveOverlay("leaderboard")}
          />
        )}
      <LeaderboardOverlay
        open={activeOverlay === "leaderboard"}
        close={() => setActiveOverlay(null)}
      />
      <TouchableOpacity style={styles.refreshButton} onPress={fetchInitial}>
        <Text style={styles.refreshText}>{loading ? "…" : "↻"}</Text>
      </TouchableOpacity>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { height: "100%", width: "100%" },
  loadingText: { position: "absolute", top: "50%" },
  loadingIcon: { position: "absolute", top: "25%", right: "50%" },
  content: { height: "10%", width: "100%" },
  text: { color: "#ccc", textAlign: "center" },
  refreshButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    backgroundColor: "#FF6C00",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  refreshText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
});

export default UserFeed;
