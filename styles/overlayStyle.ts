import { StyleSheet, Dimensions } from "react-native";

const CARD_WIDTH = Dimensions.get("window").width * 0.85;
const CARD_MARGIN = 16;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    overlay: {
        marginTop: 85,
        marginBottom: "120%",
        justifyContent: "flex-start",
        alignSelf: "flex-start",
        flexGrow: 0
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