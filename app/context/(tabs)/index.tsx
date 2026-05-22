import React, { useEffect, useMemo, useRef, useState } from "react";

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

import { useCommentStore } from "@/stores/commentStore";
import { useEventStore } from "@/stores/eventStore";
import { useQuestStore } from "@/stores/questStore";

import getCommentsByAreaSnapshot from "@/scripts/getCommentsByAreaSnapshot";
import getCommentsByAreaUpdates from "@/scripts/getCommentsByAreaUpdates";
import { CommentItem } from "@/types/comment";

function UserFeed() {
  type MapItem = {
    id: string;
    createdAt: string;
  };

  const { user, username, token } = useAuth();
  const { refreshUserPoints, points } = usePoints();

  const comments = useCommentStore((s) => s.comments);
  const setComments = useCommentStore((s) => s.setComments);
  const addComment = useCommentStore((s) => s.addComment);
  const mergeComments = useCommentStore((s) => s.mergeComments);
  const updateComment = useCommentStore((s) => s.updateComment);

  const events = useEventStore((s) => s.events);
  const setEvents = useEventStore((s) => s.setEvents);
  const addEvent = useEventStore((s) => s.addEvent);
  const mergeEvents = useEventStore((s) => s.mergeEvents);
  const updateEvent = useEventStore((s) => s.updateEvent);
  
  const quests = useQuestStore((s) => s.quests);
  const setQuests = useQuestStore((s) => s.setQuests);
  const addQuest = useQuestStore((s) => s.addQuest);
  const mergeQuests = useQuestStore((s) => s.mergeQuests);
  const updateQuest = useQuestStore((s) => s.updateQuest);

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

  const tokenRef = useRef(token);
  const lastSyncRef = useRef(lastSync);

  const [commentLastSync, setCommentLastSync] = useState<string | null>(null);
  const commentLastSyncRef = useRef(commentLastSync);

  const lastSnapshotLocRef = useRef<any>(null);

  const commentDistance = 0.005;
  const refreshDistance = 5;

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    lastSyncRef.current = lastSync;
  }, [lastSync]);
  useEffect(() => {
    commentLastSyncRef.current = commentLastSync;
  }, [commentLastSync]);

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
      getCommentsByAreaCall(token, location.latitude, location.longitude, commentDistance),
      getEventsByAreaCall(token, location.latitude, location.longitude, 10),
      getQuestsByAreaCall(token, location.latitude, location.longitude, 10),
    ]);


    setComments(
      commentData.map((c: any) => ({
        id: c.id,
        createdAt: c.createdAt ?? c.date,
        authorId: c.author,
        authorName: c.authorName ?? "Unknown",

        comment: c.comment,

        location: c.location,

        likes: c.likes ?? 0,
        likedByUser: c.likedByUser ?? false,
        flaggedByUser: c.flaggedByUser ?? false,

        date: c.date,
      }))
    );
    setEvents(
      eventData.map((e: any) => ({
        id: e.id,
        createdAt: e.createdAt ?? e.date,

        description: e.description,
        location: e.location,

        joined: e.joined ?? false,

        authorId: e.author,
        authorName: e.authorName ?? "Unknown",

        date: e.date,
        time: e.time,
        image: e.image,
        flag: e.flag,
      }))
    );
    setQuests(
      questData.map((q: any) => ({
        id: q.id,
        createdAt: q.createdAt ?? q.date,

        description: q.description,
        location: q.location,

        joined: q.joined ?? false,

        authorId: q.author,
        authorName: q.authorName ?? "Unknown",

        date: q.date,
        time: q.time,
        image: q.image,
        flag: q.flag,
      }))
    );

    const all = [...commentData, ...eventData, ...questData];

    if (all.length > 0) {
      const newest = all.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )[all.length - 1];

      setLastSync(newest.createdAt);
      setCommentLastSync(newest.createdAt);
    }

    setLoading(false);
  };

  const fetchCommentSnapshot = async (loc: any) => {
    if (!loc) return;

    const commentData = await getCommentsByAreaSnapshot(
      token,
      loc.latitude,
      loc.longitude,
      commentDistance
    );

    if (!loc) return;

    setComments(
      commentData.map((c: any) => ({
        id: c.id,
        createdAt: c.createdAt ?? c.date,
        authorId: c.author,
        authorName: c.authorName ?? "Unknown",

        comment: c.comment,

        location: c.location,

        likes: c.likes ?? 0,
        likedByUser: c.likedByUser ?? false,
        flaggedByUser: c.flaggedByUser ?? false,

        date: c.date,
      }))
    );

    // initialize lastSync for comments only
    if (commentData.length > 0) {
      const newest = commentData.reduce((max: CommentItem, c: CommentItem) =>
        new Date(c.createdAt) > new Date(max.createdAt) ? c : max
      );

      setCommentLastSync(newest.createdAt);
    }
  };
  
  const commentSyncLock = useRef(false);

  const fetchCommentUpdates = async () => {
    if (commentSyncLock.current) return;
    commentSyncLock.current = true;

    try {
      const loc = location;
      if (!loc) return;

      const since = commentLastSyncRef.current;

      const commentData = await getCommentsByAreaUpdates(
        tokenRef.current,
        loc.latitude,
        loc.longitude,
        commentDistance,
        since
      );

      mergeComments(
        commentData.map((c: any) => ({
          id: c.id,
          createdAt: c.createdAt ?? c.date,
          authorId: c.author,
          authorName: c.authorName ?? "Unknown",

          comment: c.comment,

          location: c.location,

          likes: c.likes ?? 0,
          likedByUser: c.likedByUser ?? false,
          flaggedByUser: c.flaggedByUser ?? false,

          date: c.date,
        }))
      );

      if (commentData.length > 0) {
        const newest = commentData.reduce((max: CommentItem, c: CommentItem) =>
          new Date(c.createdAt) > new Date(max.createdAt) ? c : max
        );

        setCommentLastSync(newest.createdAt);
      }
    } finally {
      commentSyncLock.current = false;
    }
  };



  //quest and event interval
  useEffect(() => {
    const loc = location;
    if (!loc) return;

    const interval = setInterval(async () => {
      const since = lastSyncRef.current;
      const [eventData, questData] = await Promise.all([
        getEventsByAreaCall(
          tokenRef.current,
          loc.latitude,
          loc.longitude,
          10,
          since,
        ),
        getQuestsByAreaCall(
          tokenRef.current,
          loc.latitude,
          loc.longitude,
          10,
          since,
        ),
      ]);

      mergeEvents(eventData);
      mergeQuests(questData);

      const allNew = [...eventData, ...questData];

      if (allNew.length > 0) {
        const newest = allNew.reduce((max, c) =>
          new Date(c.createdAt) > new Date(max.createdAt) ? c : max
      );

        setLastSync(newest.createdAt);
      }
    }, 15000); // 15s

    return () => clearInterval(interval);
  }, [location]);

  //comment interval
  useEffect(() => {
    if (!location) return;

    const interval = setInterval(() => {
      fetchCommentUpdates();
    }, 15000);

    return () => clearInterval(interval);
  }, [location]);




  const didInit = useRef(false);

  useEffect(() => {
    if (!location || didInit.current) return;
    didInit.current = true;
    fetchInitial();
  }, [location]);

  useEffect(() => {
    if (!location) return;

    const last = lastSnapshotLocRef.current;

    if (last) {
      const dx = location.latitude - last.latitude;
      const dy = location.longitude - last.longitude;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.01) return; // ignore tiny movement
    }

    lastSnapshotLocRef.current = location;

    fetchCommentSnapshot(location);
  }, [location]);

  //updates location when moving certain distance
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationAllowed(false);
        return;
      }

      setLocationAllowed(true);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: refreshDistance,
        },
        (loc) => {
          setLocation(loc.coords);
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleAddComment = async (data: any) => {
    const newComment = await addCommentCall(data, token);
    if (!newComment) {
      return;
    }

    addComment({
      id: newComment._id,
      createdAt: newComment.createdAt ?? newComment.date,

      authorId: newComment.author,
      authorName: username ?? "Unknown",

      comment: newComment.comment,

      likes: newComment.likes || 0,
      likedByUser: newComment.likedByUser ?? false,
      flaggedByUser: newComment.flaggedByUser ?? false,

      location: newComment.location || { lat: 0, lng: 0 },

      date: newComment.date,
    });
  };

  const handleAddEvent = async (data: any) => {
    const newEvent = await addEventCall(data, token);
    if (!newEvent) {
      return;
    }

    addEvent({
      id: newEvent._id,
      authorId: newEvent.author,
      authorName: username ?? "Unknown",
      date: newEvent.date,
      time: newEvent.time,
      description: newEvent.description,
      location: newEvent.location,
      joined: false,
      image: newEvent.image,
      flag: newEvent.flag,
      createdAt: newEvent.createdAt ?? new Date().toISOString(),
    });
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

    addQuest({
      id: newQuest._id,
      createdAt: newQuest.createdAt ?? newQuest.date,

      authorId: newQuest.author,
      authorName: username ?? "Unknown",

      date: newQuest.date,
      time: newQuest.time,

      description: newQuest.description,
      location: newQuest.location,

      joined: false,

      image: newQuest.image,
      flag: newQuest.flag,
    });
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
