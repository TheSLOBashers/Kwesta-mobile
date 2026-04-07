import { StyleSheet, Dimensions } from "react-native";

const CARD_WIDTH = Dimensions.get("window").width * 0.85;
const CARD_MARGIN = 16;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,

    },
    overlay: {
        flex: 1,
        marginTop: 85,
        justifyContent: "flex-start",
    },
    Card: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginRight: CARD_MARGIN,
        marginTop: "0.3%"
    },
    Slider: {
        flexDirection: "row",
        paddingHorizontal: "7.5%",
    },
    author: { fontWeight: "600", fontSize: 18, marginBottom: 8 },
});

export default { styles, CARD_WIDTH, CARD_MARGIN};