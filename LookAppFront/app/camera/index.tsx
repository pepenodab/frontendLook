import React from "react";
import { StyleSheet, View } from "react-native";

import CameraScreen from "../../components/CameraScreen";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useTheme } from "../../context/ThemeContext";

export default function CameraPageRoute() {
  const { theme, colors, toggleTheme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.body}>
        <Header />
        <View
          style={{
            borderColor: colors.secondary,
            borderWidth: 2,
            height: "75%",
          }}
        >
          <CameraScreen />
        </View>
        <Footer />
      </View>
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
    height: "95%",
  },
});
