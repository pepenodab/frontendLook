import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CommentProps {
  authorName: string;
  commentText: string;
}

const Comment: React.FC<CommentProps> = ({ authorName, commentText }) => {
  const { theme, colors, toggleTheme } = useTheme();
  return (
    <View
      style={[
        styles.commentBox,
        { backgroundColor: colors.card, borderColor: colors.secondary },
      ]}
    >
      <Text style={[styles.usuarioBold, { color: colors.secondary }]}>
        {authorName}:
      </Text>
      <Text style={[styles.descripcionTexto, { color: colors.secondary }]}>
        {" "}
        {commentText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  commentBox: {
    backgroundColor: "#F8F4FF",
    borderWidth: 1,
    borderColor: "#4B0082",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  usuarioBold: {
    fontWeight: "bold",
    color: "#4B0082",
    marginRight: 5,
  },
  descripcionTexto: {
    color: "#4B0082",
    fontStyle: "italic",
    flexShrink: 1,
  },
});

export default Comment;
