import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import apiService from "../service/api";
import { useTheme } from "../context/ThemeContext";

interface LikeProps {
  userId: string;
}

const Like: React.FC<LikeProps> = ({ userId }) => {
  const { theme, colors, toggleTheme } = useTheme();
  const [loadingUsername, setLoadingUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUri, setAvatarUri] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.getUserById(userId);
        setUsername(response.username);
        setAvatarUri(response.profilePictureUri);
      } catch (error) {}
    };
    fetchUser();
  }, [userId]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.secondary },
      ]}
    >
      <Image source={require("../assets/example.png")} style={styles.avatar} />
      <Text style={[styles.username, { color: colors.secondary }]}>
        {username}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4FF",
    borderWidth: 1,
    borderColor: "#4B0082",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  username: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4B0082",
    flexShrink: 1,
  },
});

export default Like;
