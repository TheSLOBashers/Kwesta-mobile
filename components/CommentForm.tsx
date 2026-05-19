import { useColorScheme } from "@/hooks/use-color-scheme.web";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
    onSubmit: (commentData: any) => void;
    onClose: () => void;
    username: string | null;
    location: any;
    initialText?: string;
}

function CommentForm({ onSubmit, onClose, username, location, initialText }: Props) {
    const [text, setText] = useState(initialText || "");

    const isEditing = !!initialText;

    const buttonColor = "#4CAF50";
    const colorScheme = useColorScheme();
    const bgColor = colorScheme === 'dark' ? "#0F0F0F" : "white";
    const textColor = colorScheme === 'light' ? "black" : "white";

    useEffect(() => {
        setText(initialText || "");
    }, [initialText]);

    const handleSubmit = () => {
        if (!username || !text) {
            return;
        };
        const validLocation = {
            lat: location?.lat ?? location?.latitude ?? 0,
            lng: location?.lng ?? location?.longitude ?? 0,
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
            <View style={[styles.form,{backgroundColor: bgColor}]}>
                <Text style={[styles.label, {color: textColor}]}>{isEditing ? "Edit comment" : "Add a comment"}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Comment"
                    value={text}
                    onChangeText={setText}
                />

                <Pressable style={[styles.submitButton, {backgroundColor:buttonColor}]} onPress={handleSubmit}>
                    <Text style={{color: bgColor}}>{isEditing ? "Save Changes" : "Add Comment"}</Text>
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
        padding: 16,
        marginTop: "30%",
        borderRadius: '7%',
    },

    input: {
        padding: 8,
        fontSize: 14,
        marginBottom: 10,
    },

    submitButton: {
        padding: 10,
        borderRadius: '5%',
        textAlign: 'center',
        margin: 'auto',
    },
    label: {
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5,
    },
});

export default CommentForm;