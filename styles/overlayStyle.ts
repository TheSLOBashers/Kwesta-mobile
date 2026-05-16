import { Appearance, Dimensions, StyleSheet } from "react-native";

const screen_width = Dimensions.get("window").width;
const CARD_WIDTH = screen_width * 0.8;
const CARD_MARGIN = 16;
const textColor = Appearance.getColorScheme() === 'light' ? "black" : "white";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 1,
    },
    overlay: {
        position: "absolute",
        marginTop: 85,
        justifyContent: "flex-start",
        zIndex: 2,
    },
    Card: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: Appearance.getColorScheme() === 'light' ? "white" : "#0F0F0F",
        borderRadius: 20,
        padding: 20,
        marginHorizontal: CARD_MARGIN / 2,
        marginTop: 16,
        overflow: "hidden",
    },
    Slider: {
        flexDirection: "row",
    },
    author: { fontWeight: "600", fontSize: 18, color: textColor},
    popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  popup: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: Appearance.getColorScheme() === 'light' ? "white" : "#0F0F0F",
    borderRadius: 20,
    padding: 20,
  },
});

export default { styles, CARD_WIDTH, CARD_MARGIN};