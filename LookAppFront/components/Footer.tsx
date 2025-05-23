import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme, colors, toggleTheme } = useTheme();
  const { user } = useContext(AuthContext);
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable style={styles.section} onPress={() => router.push("/home")}>
        <Ionicons name="home-outline" size={28} color={colors.secondary} />
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Pressable style={styles.section} onPress={() => router.push("/camera")}>
        <Ionicons name="camera-outline" size={28} color={colors.secondary} />
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Pressable style={styles.section} onPress={() => router.push("/search")}>
        <Ionicons name="search-outline" size={28} color={colors.secondary} />
      </Pressable>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Pressable
        style={styles.section}
        onPress={() =>
          router.push(`/profileuser?userId=${user?.id ? user.id : null}`)
        }
      >
        <Ionicons name="person-outline" size={28} color={colors.secondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "10%",
    width: "95%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  },
});
