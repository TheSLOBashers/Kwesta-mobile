
import { useAuth } from "@/components/auth-context";
import { usePoints } from "@/components/points-context";
import backend from "@/constants/backend";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import buyBadgeCall from "@/scripts/buyBadgeCall";
import getBadgesCall from "@/scripts/getBadges";
import redeemPointsCall from "@/scripts/redeemPointsCall";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";


type GiftCard = {
  id: string;
  name: string;
  amountCents: number; // cents
};


type BadgeItem = {
  id: string;
  name: string;
  cost: number;
};


const AVAILABLE_GIFTCARDS: GiftCard[] = [
  { id: "mcdo-10", name: "McDonald's $10", amountCents: 1000 },
  { id: "star-5", name: "Starbucks $5", amountCents: 500 },
  { id: "grocery-25", name: "Grocery $25", amountCents: 2500 },
  { id: "chipotle-15", name: "Chipotle $15", amountCents: 1500 },
];


const AVAILABLE_BADGES: BadgeItem[] = [
  { id: "founding_member", name: "Founding Member", cost: 3 },
  { id: "kwester", name: "Kwester", cost: 4 },
  { id: "basher", name: "Basher", cost: 5 },
];


export default function Shop() {
  const { token } = useAuth();
  const { points, refreshUserPoints } = usePoints();
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [badges, setBadges] = useState<any>(null); // Placeholder for badges, can be set with getBadgesCall if needed


  useEffect(() => {
    // Preload any assets or data for the shop here if needed
    const preloadShopData = async () => {
      // Example: await fetchShopItems();
      await getBadgesCall().then((badges) => setBadges(badges)).catch((err) => console.error("Failed to fetch badges:", err)); // Preload badges if necessary
      console.log("Shop data preloaded");
    }
    preloadShopData();
  }, []);


  const handlePurchase = async (item: GiftCard) => {
    const costPoints = Math.round(item.amountCents); // 1 point = 1 cent


    if ((points ?? 0) < costPoints) {
      Alert.alert(
        "Insufficient points",
        "You don't have enough points to buy this gift card.",
      );
      return;
    }


    Alert.alert(
      "Confirm Purchase",
      `Spend ${costPoints} points for ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            try {
              setBusyId(item.id);
              await redeemPointsCall(token, item.name, costPoints);
              await refreshUserPoints();
              Alert.alert(
                "Success",
                `You redeemed ${costPoints} points for ${item.name}.`,
              );
            } catch (err: any) {
              Alert.alert("Purchase failed", err?.message ?? String(err));
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };


  const handleBadgePurchase = async (item: BadgeItem) => {
    if ((points ?? 0) < item.cost) {
      Alert.alert(
        "Insufficient funds",
        "You don't have enough points to buy this badge.",
      );
      return;
    }


    Alert.alert(
      "Confirm Purchase",
      `Spend ${item.cost} points for the ${item.name} badge?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            try {
              setBusyId(item.id);
              await buyBadgeCall(token, item.name, item.cost);
              await refreshUserPoints();
              Alert.alert("Success", `You bought the ${item.name} badge.`);
            } catch (err: any) {
              Alert.alert("Purchase failed", err?.message ?? String(err));
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };


  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, marginTop: 20 }]}>Shop</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={{ color: colors.text }}>Close</Text>
        </Pressable>
      </View>


      <Text style={[styles.balance, { color: colors.text }]}>
        Your points: {points ?? 0}
      </Text>


      <FlatList
        data={AVAILABLE_GIFTCARDS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                borderColor: colors.tint,
                backgroundColor:
                  colorScheme === "dark" ? "rgba(255,255,255,0.02)" : "#fff",
              },
            ]}
          >
            <View style={styles.cardRow}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text
                style={styles.price}
              >{`$${(item.amountCents / 100).toFixed(2)}`}</Text>
            </View>
            <Pressable
              onPress={() => handlePurchase(item)}
              style={({ pressed }) => [
                styles.buyButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              disabled={busyId !== null}
            >
              <Text style={styles.buyText}>
                {busyId === item.id
                  ? "Processing…"
                  : `Buy for ${item.amountCents} pts`}
              </Text>
            </Pressable>
          </View>
        )}
      />


      {/* Badge Shop Code */}
      <Text style={[styles.title, { color: colors.text }]}>Badge Shop</Text>


      <FlatList
        data={badges}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                borderColor: colors.tint,
                backgroundColor:
                  colorScheme === "dark" ? "rgba(255,255,255,0.02)" : "#fff",
              },
            ]}
          >
            <View style={styles.cardRow}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.name}
              </Text>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Text style={[styles.price, { color: colors.text }]}>
                  {item.cost} pts
                </Text>
                <Image
                  source={{ uri: `${backend}badges/${item.name}` }}
                  style={{ width: 50, height: 50, borderRadius: 8 }}
                />
              </View>
            </View>


            <Pressable
              onPress={() => handleBadgePurchase(item)}
              style={({ pressed }) => [
                styles.buyButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              disabled={busyId !== null}
            >
              <Text style={styles.buyText}>
                {busyId === item.id
                  ? "Processing…"
                  : `Buy for ${item.cost} pts`}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "700" },
  closeButton: {
    backgroundColor: "#FF6C00",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  balance: { marginBottom: 12, fontSize: 16 },
  list: { gap: 12, paddingBottom: 60 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: "700" },
  price: { fontSize: 15, color: "#111" },
  buyButton: {
    backgroundColor: "#0A7EA4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buyText: { color: "white", fontWeight: "700" },
});
