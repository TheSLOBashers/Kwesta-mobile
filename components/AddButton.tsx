import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface Props {
    onClick: () => void;
}

function AddButton({ onClick }: Props){
    const colorScheme = useColorScheme();
    const bgColor = colorScheme === 'light' ? "white" : "#0F0F0F";
    const textColor = colorScheme === 'dark' ? "white" : "#0F0F0F";
    return (
        <Pressable 
            aria-label = "add button"
            onPress={onClick}
            style={[styles.button, {backgroundColor: bgColor}]}
        >
            <Text style={[styles.text, {color: textColor}]}>+</Text>
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
        zIndex: 1000,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "100%",
        width: "10%",
        height: "5%",
        padding: "2%",
    },
    text: {
        margin: 0,
    }
});

export default AddButton;
