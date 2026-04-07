import React from "react";
import { useState } from "react";
import { TouchableWithoutFeedback, StyleSheet, View, Text, TextInput, Pressable } from "react-native";

interface Props {
    onSubmit: (commentData: any) => void;
    onClose: () => void;
    username: string | null;
    location: any;
}

function CommentForm({ onSubmit, onClose, username, location }: Props) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (!username || !text) {
            return;
        };
        const validLocation = {
            lat: location.latitude != null ? location.latitude : 0,
            lng: location.longitude != null ? location.longitude : 0,
        };

        const commentData = {
            comment: text,
            location: validLocation,
            date: new Date(),
        }

        onSubmit(commentData);
        onClose();
    };

    return (
        <View style={styles.formOverlay}>
            {/* Background click catcher */}
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            {/* Actual form */}
            <View style={styles.form}>
                <Text style={styles.label}>Add a comment</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Comment"
                    value={text}
                    onChangeText={setText}
                />

                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                    <Text>Add Comment</Text>
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

export default CommentForm;