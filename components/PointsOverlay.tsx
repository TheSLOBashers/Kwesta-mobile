import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
    points: any
}

export default function PointsOverlay({points}: Props) {

    const styles = StyleSheet.create({
        overlay: {
            position: "absolute",
            display: "flex",
            flexDirection: 'row',
            alignItems: "center",
            top: "6%",
            left: "10%",
            width: "27%",
            backgroundColor: "#ffffff",
            padding: "2%",
            borderRadius: "5%",
        },
        text: {
            color: "#000"
        },
        image: {
            width: 15,
            height: 20,
            resizeMode: 'stretch',
            marginRight: '5%',
        },
    })

    return (
        <View style={styles.overlay}>
            <Image
                    style = {styles.image}
                    source = {require('../assets/images/sparkle.png')}
                />
            <Text style={styles.text}>Points: {points}</Text>
        </View>
    );

}