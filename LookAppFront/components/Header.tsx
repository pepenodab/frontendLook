import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { theme, colors, toggleTheme } = useTheme();

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
      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.themeToggleButton,
          {
            backgroundColor: pressed ? colors.secondary : "transparent",
            opacity: pressed ? 0.7 : 1,
            borderColor: colors.secondary,
          },
        ]}
      >
        <Ionicons
          name={theme === "light" ? "sunny-outline" : "moon-outline"}
          size={24}
          color={colors.secondary}
        />
      </Pressable>

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, { color: colors.secondary }]}>LooK</Text>
      </View>

      <Pressable style={styles.invisibleSpacer}>
        <Ionicons name="sunny-outline" size={24} color="transparent" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 2,
    marginTop: "10%",
    width: "95%",
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  titleWrapper: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  themeToggleButton: {
    padding: 5,
    borderRadius: 25,
    borderWidth: 1,
  },
  invisibleSpacer: {
    padding: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
});
