import React from "react";
import { DimensionValue, Pressable, StyleSheet, Text } from "react-native";

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
        justifyContent: 'center',
        fontFamily: "Acephimere",
        backgroundColor: "rgba(0,0,0,0.6)",
        width: "25%",
        height: "4%",
        borderRadius: "10%",
    },
    text: {
        color: "#ffffff",
    }
});

export default OpenButton;