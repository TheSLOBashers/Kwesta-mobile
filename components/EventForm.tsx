import React from "react";
import { useState } from "react";
import { TouchableWithoutFeedback, StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    onSubmit: (commentData: any) => void;
    onClose: () => void;
    username: string | null;
    location: any;
}

function EventForm({ onSubmit, onClose, username, location }: Props) {
    const [text, setText] = useState("");
    const [uDate, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const handleSubmit = () => {
        if (!username || !text || !uDate) {
            return;
        };
        const validLocation = {
            lat: location.lat != null ? location.lat : 0,
            lng: location.lng != null ? location.lng : 0,
        };

        const eventData = {
            description: text,
            location: validLocation,
            date: uDate.toLocaleDateString(),
            time: uDate.toLocaleTimeString()
        }

        onSubmit(eventData);
        onClose();
    };

    const onChange = (event: any, selectedDate: any) => {
    // Android: the picker closes on selection, so we must update 'show' state
    const currentDate = selectedDate || uDate;
    setDate(currentDate);
    setShow(false);
  };


    return (
        <View style={styles.formOverlay} pointerEvents="box-none">

            {/* Actual form */}
            <View style={styles.form}>
                <Pressable onPress={onClose}><Text>X</Text></Pressable>
                <Text style={styles.label}>Add an event</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={text}
                    onChangeText={setText}
                />
                {show ? (
                <DateTimePicker
                    value={uDate}
                    mode="date" // Options: 'date', 'time', 'datetime' (iOS only)
                    display="default" // Options: 'default', 'spinner', 'calendar', 'clock'
                    onChange={onChange}
                />
                ) : (<Pressable onPress={() => setShow(true)}>
                    <Text>{String(uDate)}</Text>
                </Pressable>)}

                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                    <Text>Add Event</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    formOverlay: {
        position: "absolute",
        top: 50, left: 50, right: 50, bottom: 50,
        zIndex: 1000,
    },
    form: {
        flexDirection: "column",
        backgroundColor: "#ccc",
        padding: 16,
        marginTop: "30%"
    },

    input: {
        padding: 8,
        fontSize: 14,
        marginBottom: 10,
    },

    submitButton: {
        padding: 10,
        backgroundColor: "#aaa",
    },
    label: {
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5
    },
});

export default EventForm;