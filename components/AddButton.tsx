import React from "react";
import { Appearance, Pressable, StyleSheet, Text } from "react-native";

interface Props {
    onClick: () => void;
}

function AddButton({ onClick }: Props){
    return (
        <Pressable 
            aria-label = "add button"
            onPress={onClick}
            style={styles.button}
        >
            <Text style={styles.text}>+</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: "15%",
        right: "15%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: Appearance.getColorScheme() === 'light' ? "white" : "black",
        zIndex: 1000,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "100%",
        width: "10%",
        height: "5%",
        padding: "2%",
    },
    text: {
        color: Appearance.getColorScheme() === 'dark' ? "white" : "black",
        margin: 0,
    }
});

export default AddButton;