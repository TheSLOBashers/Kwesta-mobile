import { Dimensions, StyleSheet } from "react-native";

const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    overlay: {
        position: "absolute",
        marginTop: 85,
        justifyContent: "flex-start",
    },
    Card: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginHorizontal: CARD_MARGIN / 2,
        marginTop: 16,
        overflow: "hidden",
    },
    Slider: {
        flexDirection: "row",
    },
    author: { fontWeight: "600", fontSize: 18, marginBottom: 8 },
});

export default { styles, CARD_WIDTH, CARD_MARGIN};