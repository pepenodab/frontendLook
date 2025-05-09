import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Puedes cambiar la librería si prefieres otra
import { router } from "expo-router";

export default function Footer() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.section} onPress={() => router.push("/home")}>
        <Ionicons name="home-outline" size={28} color="#4E4187" />
      </Pressable>

      <View style={styles.divider} />

      <Pressable style={styles.section} onPress={() => router.push("/home")}>
        <Ionicons name="camera-outline" size={28} color="#4E4187" />
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        style={styles.section}
        onPress={() => router.push("/profileuser")}
      >
        <Ionicons name="search-outline" size={28} color="#4E4187" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "10%",
    width: "95%",
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    borderColor: "#4E4187",
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  section: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "60%",
    backgroundColor: "#4E4187",
  },
});
