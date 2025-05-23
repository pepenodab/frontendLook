import { View, StyleSheet } from "react-native";
import Footer from "../../components/Footer";
import ProfileScreen from "../../components/ProfileScreen";
import Header from "../../components/Header";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileUser() {
  const { theme, colors, toggleTheme } = useTheme();
  const { userId } = useLocalSearchParams();
  console.log("ID del usuario:", userId);
  const currentUserId = userId as string;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Header />
      <View style={[styles.body, { borderColor: colors.secondary }]}>
        <ProfileScreen userId={currentUserId} />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFE6A8",
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  body: {
    width: "95%",
    height: "70%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderColor: "#4E4187",
    borderWidth: 2,
  },
});
