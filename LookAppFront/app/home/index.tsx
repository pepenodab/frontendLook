import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post from "../../components/Post";
import apiService from "../../service/api";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface PostResponseDto {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  imageUri: string;
  createdAt: Date;
  likeCount: number;
}

export default function HomeScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  /**
   * Fetches posts for the main feed.
   * If the user is not logged in or has no followed users, it sets posts to an empty array.
   * Otherwise, it fetches the IDs of followed users and then retrieves their posts.
   * Handles loading states and potential errors during the fetch operation.
   */
  const fetchPosts = async () => {
    if (!user || !user.id) {
      setLoadingPosts(false);
      setPosts([]);
      return;
    }

    setLoadingPosts(true);
    try {
      const followedUserIds = await apiService.getFollowingId(user.id);

      if (followedUserIds.length === 0) {
        setPosts([]);
      } else {
        const fetchedPosts = await apiService.getMainPost(followedUserIds);
        setPosts(fetchedPosts);
      }
    } catch (error) {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [user, authLoading]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Header />
        <View style={[styles.body, { borderColor: colors.border }]}>
          {authLoading || loadingPosts ? (
            <ActivityIndicator size="large" color="#4E4187" />
          ) : posts.length > 0 ? (
            <ScrollView style={styles.scrollView}>
              {posts.map((post) => (
                <Post
                  key={post.id}
                  userLogId={user?.id != null ? user.id : ""}
                  postId={post.id}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyMessage}>
              No hay posts para mostrar. Sigue a algunos usuarios o revisa más
              tarde.
            </Text>
          )}
        </View>
        <Footer />
      </View>
    </>
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
  scrollView: {
    width: "100%",
    height: "100%",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4E4187",
  },
});
