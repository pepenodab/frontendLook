import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../service/api";
import { useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Post from "../../components/Post";
import { useTheme } from "../../context/ThemeContext";

interface PostDetailDto {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  imageUri: string;
  createdAt: Date;
  likeCount: number;
}

const PostDetailScreen = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useContext(AuthContext);

  const [postData, setPostData] = useState<PostDetailDto | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  /**
   * Fetches the detailed data for a specific post using its ID.
   * Handles loading states and potential errors during the data retrieval.
   * Sets postData to null if the post ID is not provided or an error occurs.
   */
  const fetchPostData = useCallback(async () => {
    if (!postId) {
      console.error("No postId provided.");
      setLoadingPost(false);
      return;
    }
    setLoadingPost(true);
    try {
      const response = await apiService.getPostById(postId);
      setPostData(response);
    } catch (error) {
      console.error("Error fetching post data:", error);
      setPostData(null);
    } finally {
      setLoadingPost(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  if (loadingPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text>Cargando publicación...</Text>
      </View>
    );
  }

  if (!postData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Publicación no encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Header />
      <View
        style={[
          styles.body,
          { borderColor: colors.secondary, backgroundColor: colors.card },
        ]}
      >
        <Post userLogId={user?.id || ""} postId={postData.id} />
      </View>
      <Footer />
    </View>
  );
};

export default PostDetailScreen;

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
  postScrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  emptyText: {
    fontSize: 16,
    color: "#4B0082",
    textAlign: "center",
  },
  post: {
    height: "80%",
  },
});
