import { View, StyleSheet, Text } from "react-native";

interface Props {
    points: any
}

export default function PointsOverlay({points}: Props) {

    const styles = StyleSheet.create({
        overlay: {
            position: "absolute",
            display: "flex",
            alignItems: "center",
            top: "6%",
            left: "10%",
            width: "20%",
            backgroundColor: "#ffffff",
            padding: "2%",
            borderRadius: "5%",
        },
        text: {
            color: "#000"
        }

    })

    return (
        <View style={styles.overlay}>
            <Text style={styles.text}>Points: {points}</Text>
        </View>
    );

}