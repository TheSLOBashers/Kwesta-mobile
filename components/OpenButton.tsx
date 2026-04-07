import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Alert, DimensionValue } from "react-native";

interface Props {
    onClick: () => void;
    text: string;
    position: DimensionValue;
};

function OpenButton( {onClick, text, position} : Props ){
    return (
        <Pressable onPress={onClick} style={[styles.button, {left: position}]}>
            <Text style={styles.text}>{text}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: "5%",
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

export default OpenButton;