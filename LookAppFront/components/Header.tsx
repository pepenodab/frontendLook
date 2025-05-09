import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View style={styles.container}>
      <Pressable>
        <Ionicons name="sunny-outline" size={24} color="#4E4187" />
      </Pressable>

      <Text style={styles.title}>LooK</Text>

      <Pressable>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={24}
          color="#4E4187"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderColor: "#4E4187",
    borderWidth: 2,
    marginTop: "10%",
    width: "95%",
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#4E4187",
  },
});
