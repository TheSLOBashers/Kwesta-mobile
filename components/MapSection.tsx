import { useEffect, useRef } from "react";

import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface location {
    lat: number;
    lng: number
}

interface Props {
    comments: any;
    selectedComment: any;
    quests: any;
    selectedQuest: any;
    events: any;
    selectedEvent: any;
    setclickedLocation: (ll: location) => void;
    showClickMarkers: boolean;
    clickedLocation: location;
    location: any;
}

function MapSection({ comments, selectedComment, quests, selectedQuest, events, selectedEvent, setclickedLocation, showClickMarkers, clickedLocation, location }: Props) {

    
    const mapRef = useRef<MapView | null>(null);

    // get position of press
    const handlePress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const lat = latitude;
        const lng = longitude;

        console.log('Tapped at:', latitude, longitude);

        setclickedLocation({ lat, lng });
    };

    // recenter on location
    const recenter = (lat: number, lng: number) => {
        mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 1000); // duration in ms
    };

    // recenter on selected comment
    useEffect(() => {
        const lat = selectedComment?.location.lat ?? null;
        const lng = selectedComment?.location.lng ?? null;

        if (!(lat == null || lng == null)) {
            recenter (lat, lng);
        };

    }, [selectedComment])

    // recenter on selected quest
    useEffect(() => {
        const lat = selectedQuest?.location.lat ?? null;
        const lng = selectedQuest?.location.lng ?? null;

        if (!(lat == null || lng == null)) {
            recenter (lat, lng);
        };

    }, [selectedQuest])

    // recenter on selected event
    useEffect(() => {
        const lat = selectedEvent?.location.lat ?? null;
        const lng = selectedEvent?.location.lng ?? null;

        if (!(lat == null || lng == null)) {
            recenter (lat, lng);
        };

    }, [selectedEvent])

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation
                ref={mapRef}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                onPress={handlePress}
            >
                {comments.map((c: any) => {
                    const lat = c.location?.lat;
                    const lng = c.location?.lng;
                    if (lat == null || lng == null) return null;

                    return (
                        <Marker
                            coordinate={{ latitude: lat, longitude: lng }}
                            key={c.id ?? `${lat}-${lng}-${c.comment}`}
                            title={c.comment}
                        />
                    );
                })}
                {quests.map((q: any) => {
                    const lat = q.location?.lat;
                    const lng = q.location?.lng;
                    if (lat == null || lng == null) return null;

                    return (
                        <Marker
                            coordinate={{ latitude: lat, longitude: lng }}
                            key={q.id ?? `${lat}-${lng}-${q.description}`}
                            title={q.description}
                        />
                    );
                })}
                {events.map((e: any) => {
                    const lat = e.location?.lat;
                    const lng = e.location?.lng;
                    if (lat == null || lng == null) {
                        return null
                    };

                    return (
                        <Marker
                            coordinate={{ latitude: lat, longitude: lng }}
                            key={e.id ?? `${lat}-${lng}-${e.description}`}
                            title={e.description}
                        />
                    );
                })}
                {showClickMarkers ?
                    <Marker key={`${clickedLocation.lat}-${clickedLocation.lng}`} coordinate={{ latitude: clickedLocation.lat, longitude: clickedLocation.lng }}>
                    </Marker>
                    : null}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
});

export default MapSection;