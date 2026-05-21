import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface location {
  lat: number;
  lng: number;
}

interface Props {
  comments: any;
  selectedCommentId: any;
  quests: any;
  selectedQuestId: any;
  events: any;
  selectedEventId: any;

  setSelectedCommentId: (id: any) => void;
  setSelectedQuestId: (id: any) => void;
  setSelectedEventId: (id: any) => void;

  setActiveOverlay: (val: any) => void;

  setclickedLocation: (ll: location) => void;
  showClickMarkers: boolean;
  clickedLocation: location;
  location: any;
}

function MapSection({
  comments,
  selectedCommentId,
  quests,
  selectedQuestId,
  events,
  selectedEventId,
  setSelectedCommentId,
  setSelectedQuestId,
  setSelectedEventId,
  setActiveOverlay,
  setclickedLocation,
  showClickMarkers,
  clickedLocation,
  location,
}: Props) {
  const mapRef = useRef<MapView | null>(null);
  const mapInteractionLock = useRef(false);

  const [currentRegion, setCurrentRegion] = useState({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // tap on map
  const handlePress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setclickedLocation({ lat: latitude, lng: longitude });
  };

  const recenter = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: currentRegion.latitudeDelta,
        longitudeDelta: currentRegion.longitudeDelta,
      },
      1000,
    );
  };

  const selectedComment = comments.find((c: any) => c.id === selectedCommentId);
  const selectedEvent = events.find((e: any) => e.id === selectedEventId);
  const selectedQuest = quests.find((q: any) => q.id === selectedQuestId);

  const selectComment = (id: string) => {
    if (mapInteractionLock.current) return;
    setSelectedCommentId(id);
    setSelectedQuestId(null);
    setSelectedEventId(null);
    setActiveOverlay("comments");

    mapInteractionLock.current = true;
    setTimeout(() => {
      mapInteractionLock.current = false;
    }, 150);
  };
  const selectEvent = (id: string) => {
    if (mapInteractionLock.current) return;
    setSelectedCommentId(null);
    setSelectedQuestId(null);
    setSelectedEventId(id);
    setActiveOverlay("events");

    mapInteractionLock.current = true;
    setTimeout(() => {
      mapInteractionLock.current = false;
    }, 150);
  };
  const selectQuest = (id: string) => {
    if (mapInteractionLock.current) return;
    setSelectedCommentId(null);
    setSelectedQuestId(id);
    setSelectedEventId(null);
    setActiveOverlay("quests");

    mapInteractionLock.current = true;
    setTimeout(() => {
      mapInteractionLock.current = false;
    }, 150);
  };

  useEffect(() => {
    let lat = null;
    let lng = null;

    if (selectedCommentId) {
      const c = comments.find((c: any) => c.id === selectedCommentId);
      lat = c?.location?.lat;
      lng = c?.location?.lng;
    } else if (selectedQuestId) {
      const q = quests.find((q: any) => q.id === selectedQuestId);
      lat = q?.location?.lat;
      lng = q?.location?.lng;
    } else if (selectedEventId) {
      const e = events.find((e: any) => e.id === selectedEventId);
      lat = e?.location?.lat;
      lng = e?.location?.lng;
    }

    if (lat != null && lng != null) {
      recenter(lat, lng);
    }
  }, [selectedCommentId, selectedQuestId, selectedEventId]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        ref={mapRef}
        initialRegion={currentRegion}
        onRegionChangeComplete={(r) => setCurrentRegion(r)}
        onPress={handlePress}
      >
        {/* COMMENTS */}
        {comments.map((c: any) => {
          const lat = c.location?.lat;
          const lng = c.location?.lng;
          if (lat == null || lng == null) return null;

          return (
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              key={c.id ?? `${lat}-${lng}-${c.comment}`}
              onSelect={() => selectComment(c.id)}
              onCalloutPress={() => selectComment(c.id)}
              tracksViewChanges={false}
              pinColor={selectedCommentId === c.id ? "blue" : "red"}
            />
          );
        })}

        {/* QUESTS */}
        {quests.map((q: any) => {
          const lat = q.location?.lat;
          const lng = q.location?.lng;
          if (lat == null || lng == null) return null;

          return (
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              key={q.id ?? `${lat}-${lng}-${q.description}`}
              onSelect={() => selectQuest(q.id)}
              onCalloutPress={() => selectQuest(q.id)}
              tracksViewChanges={false}
              pinColor={selectedQuestId === q.id ? "blue" : "red"}
            />
          );
        })}

        {/* EVENTS */}
        {events.map((e: any) => {
          const lat = e.location?.lat;
          const lng = e.location?.lng;
          if (lat == null || lng == null) return null;

          return (
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              key={e.id ?? `${lat}-${lng}-${e.description}`}
              onSelect={() => selectEvent(e.id)}
              onCalloutPress={() => selectEvent(e.id)}
              tracksViewChanges={false}
              pinColor={selectedEventId === e.id ? "blue" : "red"}
            />
          );
        })}

        {/* CLICK MARKER */}
        {showClickMarkers && (
          <Marker
            coordinate={{
              latitude: clickedLocation.lat,
              longitude: clickedLocation.lng,
            }}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapSection;
