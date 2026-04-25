import React, { useEffect, useMemo, useState } from "react";

/*
import Comments from "./Comments";
import Events from "./Events";
import Quests from "./Quests";
import AddButtonOverlay from "./AddButtonOverlay";
*/
import AddButtonOverlay from "@/components/AddButtonOverlay";
import CommentOverlay from "@/components/CommentOverlay";
import Comments from "@/components/Comments";
import EventOverlay from "@/components/EventOverlay";
import Events from "@/components/Events";
import MapSection from "@/components/MapSection";
import PointsOverlay from "@/components/PointsOverlay";
import QuestOverlay from "@/components/QuestOverlay";
import Quests from "@/components/Quests";

import addCommentCall from "@/scripts/addCommentCall";
import addEventCall from "@/scripts/addEventCall";
import addQuestCall from "@/scripts/addQuestCall";
import * as Location from "expo-location";

import getCommentsByAreaCall from "@/scripts/getCommentsByAreaCall";
import getEventsByAreaCall from "@/scripts/getEventsByAreaCall";
import getQuestsByAreaCall from "@/scripts/getQuestsByAreaCall";

import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function UserFeed() {
  const { user, username, token } = useAuth();
  const { refreshUserPoints, points } = usePoints();
  const [comments, setComments] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [quests, setQuests] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  // user location
  const [location, setLocation] = useState<any>(null);
  const [locationAllowed, setLocationAllowed] = useState(false);

  const [clickedLocation, setclickedLocation] = useState({ lat: 0, lng: 0 });
  const [showClickMarkers, setShowClickMarkers] = useState(false);
  // New
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [selectedQuestId, setselectedQuestId] = useState(null);
  const [selectedEventId, setsselectedEventId] = useState(null);
  // open
  const [activeOverlay, setActiveOverlay] = useState<
    "comments" | "events" | "quests" | null
  >(null);

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

  const fetchAll = async () => {
    if (!location) return;
    setLoading(true);

    const commentData = await getCommentsByAreaCall(
      token,
      location.latitude,
      location.longitude,
      1,
    );
    const eventData = await getEventsByAreaCall(
      token,
      location.latitude,
      location.longitude,
      10,
    );
    const questData = await getQuestsByAreaCall(
      token,
      location.latitude,
      location.longitude,
      10,
    );
    setComments(commentData);
    setEvents(eventData);
    setQuests(questData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [location]);

  // request location permissions
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
      comment: newComment.comment, // use backend response
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
    /*
    if (props.onPointsChanged) {
      await props.onPointsChanged();
    }
      */
  };
  const handleAddEvent = async (data: any) => {
    const newEvent = await addEventCall(data, token);
    if (!newEvent) {
      return;
    }

    const eventWithUsername = {
      ...newEvent,
      author: username,
    };
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
    /*
  if (props.onPointsChanged) {
    await props.onPointsChanged();
  }
    */
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

    const questWithUsername = {
      ...newQuest,
      author: username,
    };
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
    /*
  if (props.onPointsChanged) {
    await props.onPointsChanged();
  }
    */
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
  // Don't load map unless location permissions enabled
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
        onSelectEvent={(e) => setsselectedEventId(e?.id ?? null)}
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
        onSelectQuest={(q) => setselectedQuestId(q?.id ?? null)}
        open={true}
        close={() => setActiveOverlay(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapSection
        comments={comments}
        selectedComment={selectedComment}
        quests={quests}
        selectedQuest={selectedQuest}
        events={events}
        selectedEvent={selectedEvent}
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
        onSelectEvent={(event: any) => setsselectedEventId(event?.id ?? null)}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
      />
      <Quests
        quests={quests}
        setQuests={setQuests}
        onPointsChanged={refreshUserPoints}
        onSelectQuest={(event: any) => setselectedQuestId(event?.id ?? null)}
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
      <PointsOverlay points={points} />
      <TouchableOpacity style={styles.refreshButton} onPress={fetchAll}>
        <Text style={styles.refreshText}>
          {loading ? "…" : "↻"}
        </Text>
      </TouchableOpacity>
      {overlay}
    </View>
  );
}

/*
      <View style={styles.content}>
        <Comments
          comments={comments}
          setComments={setComments}
          onPointsChanged={refreshUserPoints}
          onSelectComment={(comment: any) => setSelectedCommentId(comment?.id ?? null)}
        />
        <Events 
          events={events} 
          setEvents={setEvents}
          onPointsChanged={refreshUserPoints}
          onSelectEvent={(event) => setsselectedEventId(event?.id ?? null)}
        />
        <Quests
          quests={quests}
          setQuests={setQuests}
          onPointsChanged={refreshUserPoints}
          onSelectQuest={(quest) => setselectedQuestId(quest?.id ?? null)}
        />
      </View>

      <AddButtonOverlay
        username={user}
        onAddComment={handleAddComment}
        onAddEvent={handleAddEvent}
        onAddQuest={handleAddQuest}
        clickedLocation={clickedLocation}
        setShowClickMarkers={setShowClickMarkers}
      />
      */

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
