import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Alert } from "react-native";

interface Props {
    onClick: () => void;
};

function CommentOpenButton( {onClick} : Props ){
    return (
        <Pressable onPress={onClick} style={styles.button}>
            <Text style={styles.text}>Comments</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: "5%",
        left: "10%",
        display: "flex",
        flexDirection: "column",
        padding: "1%",
        zIndex: 1000,
        alignItems: "center",
        fontFamily: "Acephimere",
        backgroundColor: "rgba(0,0,0,0.5)",
        width: "20%",
    },
    text: {
        color: "#ffffff",
    }
});

export default CommentOpenButton;