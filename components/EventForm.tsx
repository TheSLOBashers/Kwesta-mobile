import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
    onSubmit: (commentData: any) => void;
    onClose: () => void;
    username: string | null;
    location: any;
}

function EventForm({ onSubmit, onClose, username, location }: Props) {
    const [text, setText] = useState("");
    const [uDate, setDate] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

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
            date: uDate
        }

        onSubmit(eventData);
        onClose();
    };

    const onChangeDate = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || uDate;
        setDate(currentDate);
        setShowDate(false);
    };

    const onChangeTime = (event: any, selectedTime: any) => {
        const currentDate = selectedTime || uDate;
        setDate(currentDate);
        setShowTime(false);
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
                {showDate ? (
                    <DateTimePicker
                        value={uDate}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                ) : (
                    <Pressable onPress={() => setShowDate(true)}>
                        <Text>Date: {uDate.toLocaleDateString()}</Text>
                    </Pressable>
                )}

                {/* Time Picker */}
                {showTime ? (
                    <DateTimePicker
                        value={uDate}
                        mode="time"
                        display="default"
                        onChange={onChangeTime}
                    />
                ) : (
                    <Pressable onPress={() => setShowTime(true)}>
                        <Text>Time: {uDate.toLocaleTimeString()}</Text>
                    </Pressable>
                )}
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