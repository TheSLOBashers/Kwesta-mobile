import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ShopIcon() {
  const router = useRouter();

  const openShop = () => {
    // navigate to Shop screen in the same tab folder
    router.push("./Shop");
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity onPress={openShop} style={styles.button}>
        <IconSymbol name="bag.fill" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 40,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6C00",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
