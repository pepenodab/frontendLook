import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState, useRef } from "react";
import apiService, { PostResponseDto, UserResponseDto } from "../service/api";
import Profile from "./Profile";
import Comment from "./Comment";
import { useTheme } from "../context/ThemeContext";

type PostProps = {
  userLogId: string;
  postId: string;
};

interface commentResponseDto {
  id: string;
  postId: string;
  userId: string;
  authorUsername: string;
  content: string;
}

interface LikeResponseDto {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

const Post = ({ postId, userLogId }: PostProps) => {
  const { theme, colors, toggleTheme } = useTheme();
  const [fetchedPostData, setFetchedPostData] =
    useState<PostResponseDto | null>(null);
  const [loadingPostData, setLoadingPostData] = useState(false);

  const [fetchedAuthorProfile, setFetchedAuthorProfile] =
    useState<UserResponseDto | null>(null);
  const [loadingAuthorProfile, setLoadingAuthorProfile] = useState(false);

  const displayUsername = fetchedAuthorProfile?.username || "Cargando...";
  const displayAvatarUri =
    fetchedAuthorProfile?.profilePictureUri || require("../assets/example.png");
  const displayImageUri =
    fetchedPostData?.imageUri || require("../assets/example.png");
  const displayDescription = fetchedPostData?.content || "Cargando...";

  const [modalLikesVisible, setModalLikesVisible] = useState(false);
  const [modalComentariosVisible, setModalComentariosVisible] = useState(false);
  const [modalNuevoComentarioVisible, setModalNuevoComentarioVisible] =
    useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [fetchedCommments, setFetchedCommments] = useState<
    commentResponseDto[]
  >([]);
  const [likesList, setLikesList] = useState<LikeResponseDto[]>([]);
  const [loadingLikesList, setLoadingLikesList] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [lastPress, setLastPress] = useState(0);

  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(0.5)).current;

  /**
   * Obtiene los detalles de la publicación por su ID.
   */
  const fetchPostContentDetails = useCallback(async () => {
    if (!postId) {
      console.warn("[fetchPostContentDetails] No se proporcionó un postId.");
      return;
    }

    setLoadingPostData(true);
    try {
      const data = await apiService.getPostById(postId);
      setFetchedPostData(data);
      console.log(
        "[fetchPostContentDetails] Datos del post obtenidos exitosamente:",
        data
      );
    } catch (error) {
      console.error(
        "[fetchPostContentDetails] Error al obtener detalles del post:",
        error
      );
      setFetchedPostData(null);
    } finally {
      setLoadingPostData(false);
    }
  }, [postId]);

  /**
   * Obtiene el perfil del autor de la publicación.
   * @param {string} userIdToFetch - El ID del usuario cuyo perfil se va a obtener.
   */
  const fetchAuthorProfile = useCallback(async (userIdToFetch: string) => {
    if (!userIdToFetch) {
      console.error(
        "[fetchAuthorProfile] No se proporcionó un userId para obtener el perfil del autor."
      );
      setFetchedAuthorProfile(null);
      setLoadingAuthorProfile(false);
      return;
    }
    setLoadingAuthorProfile(true);
    try {
      const profile = await apiService.getNamePost(userIdToFetch);
      setFetchedAuthorProfile(profile);
      console.log(
        "[fetchAuthorProfile] Perfil del autor obtenido para userId:",
        userIdToFetch,
        profile
      );
    } catch (error) {
      console.error(
        "[fetchAuthorProfile] Error al obtener el perfil del autor para userId:",
        userIdToFetch,
        error
      );
      setFetchedAuthorProfile(null);
    } finally {
      setLoadingAuthorProfile(false);
    }
  }, []);

  /**
   * Obtiene los comentarios de la publicación.
   */
  const fetchCommets = useCallback(async () => {
    if (!postId) return;
    try {
      const comments = await apiService.getCommentsByPostId(postId);
      setFetchedCommments(comments);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  }, [postId]);

  /**
   * Obtiene la lista de "Me Gusta" de la publicación.
   */
  const fetchLikesList = useCallback(async () => {
    if (loadingLikesList || !postId) {
      return;
    }

    setLoadingLikesList(true);
    try {
      const fetchedLikes = await apiService.getPostLikes(postId);
      console.log(
        `Likes obtenidos exitosamente para el post ${postId}:`,
        fetchedLikes
      );
      setLikesList(fetchedLikes);
      const userHasLikedNow = fetchedLikes.some(
        (like) => like.userId === userLogId
      );
      setHasUserLiked(userHasLikedNow);
    } catch (error) {
      console.error(
        `Error al obtener la lista de likes para el post ${postId}:`,
        error
      );
      setLikesList([]);
      setHasUserLiked(false);
    } finally {
      setLoadingLikesList(false);
    }
  }, [postId, userLogId]);

  useEffect(() => {
    fetchPostContentDetails();
  }, [fetchPostContentDetails]);

  useEffect(() => {
    const userIdToUse = fetchedPostData?.userId;

    if (userIdToUse && !loadingAuthorProfile && !loadingPostData) {
      console.log(
        "[AuthorProfileEffect] Llamando a fetchAuthorProfile para userId:",
        userIdToUse
      );
      fetchAuthorProfile(userIdToUse);
    } else if (!userIdToUse && !loadingPostData) {
      console.warn(
        "[AuthorProfileEffect] Post cargado, pero no se pudo determinar el userId del autor para el post:",
        postId,
        { fetchedPostData }
      );
    }
  }, [fetchedPostData?.userId, fetchAuthorProfile, loadingPostData, postId]);

  useEffect(() => {
    fetchCommets();
    fetchLikesList();
  }, [fetchCommets, fetchLikesList]);

  /**
   * Activa la animación del corazón al dar "Me Gusta".
   */
  const triggerHeartAnimation = useCallback(() => {
    animatedOpacity.setValue(0);
    animatedScale.setValue(0.5);

    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.spring(animatedScale, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [animatedOpacity, animatedScale]);

  /**
   * Maneja el doble toque en la imagen para dar o quitar "Me Gusta".
   */
  const handleDoubleTap = async () => {
    if (!userLogId || !postId) return;

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastPress < DOUBLE_PRESS_DELAY) {
      if (hasUserLiked) {
        setHasUserLiked(false);
        setLikesList((prevLikes) =>
          prevLikes.filter((like) => like.userId !== userLogId)
        );
        try {
          await apiService.unlikePost(postId);
          console.log("Unlike exitoso para postId:", postId);
        } catch (error) {
          console.error("Error al llamar a unlikePost API:", error);
          setHasUserLiked(true);
          setLikesList((prevLikes) => [
            ...prevLikes,
            {
              id: "revert-id-" + Date.now(),
              postId: postId,
              userId: userLogId,
              createdAt: new Date(),
            },
          ]);
          Alert.alert(
            "Error",
            "No se pudo quitar el 'Me Gusta'. Inténtalo de nuevo."
          );
        }
      } else {
        setHasUserLiked(true);
        triggerHeartAnimation();
        setLikesList((prevLikes) => [
          ...prevLikes,
          {
            id: "temp-id-" + Date.now(),
            postId: postId,
            userId: userLogId,
            createdAt: new Date(),
          },
        ]);
        try {
          await apiService.likePost(postId);
          console.log("Like exitoso para postId:", postId);
        } catch (error) {
          console.error("Error al llamar a likePost API:", error);
          setHasUserLiked(false);
          setLikesList((prevLikes) =>
            prevLikes.filter((like) => like.userId !== userLogId)
          );
          Alert.alert(
            "Error",
            "No se pudo dar 'Me Gusta'. Inténtalo de nuevo."
          );
        }
      }
      setTimeout(fetchLikesList, 400);
    } else {
      setLastPress(now);
    }
  };

  /**
   * Abre el modal para ver la lista de "Me Gusta".
   */
  const handlePressLikesCount = useCallback(() => {
    setModalLikesVisible(true);
  }, []);

  /**
   * Abre el modal para ver los comentarios.
   */
  const handlePressCommentsCount = useCallback(() => {
    setModalComentariosVisible(true);
  }, []);

  /**
   * Envía un nuevo comentario a la publicación.
   */
  const handleSendComment = useCallback(async () => {
    if (!nuevoComentario.trim() || !postId) {
      Alert.alert(
        "Error",
        "El comentario no puede estar vacío o falta el ID del post."
      );
      return;
    }

    setModalNuevoComentarioVisible(false);
    setNuevoComentario("");

    try {
      const response = await apiService.createComment(postId, nuevoComentario);
      console.log("Respuesta de la API de creación de comentarios:", response);

      if (response && response.code === 201 && response.data) {
        console.log("Comentario creado exitosamente:", response.data);
        fetchCommets();
      } else {
        console.warn(
          "Respuesta de la API de creación de comentarios con estructura inesperada:",
          response
        );
        Alert.alert(
          "Error",
          "Comentario creado, pero no se pudo actualizar la lista."
        );
        fetchCommets();
      }
    } catch (error) {
      console.error("Error al crear comentario:", error);
      Alert.alert(
        "Error",
        "Falló la publicación del comentario. Inténtalo de nuevo."
      );
    }
  }, [nuevoComentario, postId, fetchCommets]);

  // Si se está cargando el post, mostrar cargando...
  if (loadingPostData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text>Cargando publicación...</Text>
      </View>
    );
  }

  // Si no se pudo cargar el post (fetchedPostData es null después de la carga), mostrar mensaje de error.
  if (!fetchedPostData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Publicación no encontrada.</Text>
      </View>
    );
  }

  // Si llegamos aquí, fetchedPostData no es null, podemos mostrar el post.
  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Image
            source={
              typeof displayAvatarUri === "string"
                ? { uri: displayAvatarUri }
                : displayAvatarUri
            }
            style={styles.avatar}
          />
          {loadingAuthorProfile ? (
            <ActivityIndicator size="small" color="#4B0082" />
          ) : (
            <Text style={[styles.nombreUsuario, { color: colors.secondary }]}>
              {displayUsername}
            </Text>
          )}
        </View>

        <Pressable onPress={handleDoubleTap} style={styles.imagenContainer}>
          <Image
            source={
              typeof displayImageUri === "string"
                ? { uri: displayImageUri }
                : displayImageUri
            }
            style={styles.imagen}
          />
          <Animated.Text
            style={[
              styles.heartAnimation,
              {
                opacity: animatedOpacity,
                transform: [
                  { scale: animatedScale },
                  { translateX: -50 },
                  { translateY: -50 },
                ],
              },
            ]}
          >
            ❤️
          </Animated.Text>
        </Pressable>

        <View style={styles.stats}>
          <Pressable onPress={handlePressLikesCount}>
            <Text
              style={[
                styles.statText,
                hasUserLiked && styles.likedStatText,
                { color: colors.secondary },
              ]}
            >
              {likesList.length} Me Gustas
            </Text>
          </Pressable>
          <Pressable onPress={handlePressCommentsCount}>
            <Text style={[styles.statText, { color: colors.secondary }]}>
              {fetchedCommments.length} Comentarios
            </Text>
          </Pressable>
        </View>
        <View style={styles.descripcion}>
          <Text style={[styles.usuarioBold, { color: colors.secondary }]}>
            {displayUsername}:
          </Text>
          <Text style={[styles.descripcionTexto, { color: colors.secondary }]}>
            {displayDescription}
          </Text>
        </View>

        <Modal visible={modalLikesVisible} animationType="slide" transparent>
          <View style={[styles.modalContainer]}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.secondary }]}>
                Me gustas: ({likesList.length})
              </Text>
              {loadingLikesList ? (
                <ActivityIndicator
                  size="large"
                  color="#4B0082"
                  style={{ marginVertical: 20 }}
                />
              ) : likesList.length > 0 ? (
                <ScrollView style={styles.modalListScrollView}>
                  {likesList.map((likeItem) => (
                    <Profile key={likeItem.id} userId={likeItem.userId} />
                  ))}
                </ScrollView>
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: colors.secondary,
                    marginVertical: 20,
                  }}
                >
                  Nadie le ha dado "Me Gusta" aún.
                </Text>
              )}
              <Pressable
                onPress={() => setModalLikesVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.close, { color: colors.secondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          visible={modalComentariosVisible}
          animationType="slide"
          transparent
        >
          <View style={[styles.modalContainer]}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.secondary }]}>
                Comentarios:
              </Text>
              <ScrollView style={styles.modalListScrollView}>
                {fetchedCommments.length > 0 ? (
                  fetchedCommments.map((comment) => (
                    <Comment
                      key={comment.id}
                      authorName={comment.authorUsername}
                      commentText={comment.content}
                    />
                  ))
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#666",
                      marginVertical: 20,
                    }}
                  >
                    No hay comentarios aún.
                  </Text>
                )}
              </ScrollView>
              <Pressable
                onPress={() => {
                  setModalNuevoComentarioVisible(true);
                  setModalComentariosVisible(false);
                }}
                style={{ paddingVertical: 10 }}
              >
                <Text style={[styles.statText, { color: colors.secondary }]}>
                  ➕ Agregar comentario
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setModalComentariosVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.close, { color: colors.secondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          visible={modalNuevoComentarioVisible}
          animationType="slide"
          transparent
        >
          <View style={[styles.modalContainer]}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.secondary }]}>
                Nuevo Comentario:
              </Text>
              <TextInput
                placeholder="Escribe tu comentario..."
                style={styles.input}
                value={nuevoComentario}
                onChangeText={setNuevoComentario}
                multiline
              />
              <Pressable onPress={handleSendComment}>
                <Text style={[styles.statText, { color: colors.secondary }]}>
                  Enviar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setModalNuevoComentarioVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.close, { color: colors.secondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default Post;

const styles = StyleSheet.create({
  card: {
    marginTop: 0,
    width: "100%",
    backgroundColor: "#FFF",
    overflow: "hidden",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  nombreUsuario: {
    color: "#4B0082",
    fontWeight: "bold",
    fontSize: 16,
  },
  imagenContainer: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  imagen: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#eee",
  },
  heartAnimation: {
    position: "absolute",
    top: "50%",
    left: "50%",
    fontSize: 80,
    color: "red",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  statText: {
    color: "#4B0082",
    fontWeight: "bold",
    fontSize: 14,
  },
  likedStatText: {
    color: "red",
  },
  descripcion: {
    paddingHorizontal: 10,
    marginTop: 6,
  },
  usuarioBold: {
    fontWeight: "bold",
    color: "#4B0082",
    marginRight: 5,
  },
  descripcionTexto: {
    color: "#4B0082",
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalBox: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 10,
    maxHeight: "80%",
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#4B0082",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  modalListScrollView: {
    flexGrow: 1,
    maxHeight: 300,
    marginBottom: 10,
  },
  itemBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4FF",
    borderWidth: 1,
    borderColor: "#4B0082",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  nombreUsuarioModal: {
    color: "#4B0082",
    fontWeight: "bold",
  },
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
  input: {
    borderColor: "#4B0082",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
    backgroundColor: "#F8F4FF",
    color: "#4B0082",
    textAlignVertical: "top",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  close: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 20,
    color: "#4B0082",
    fontWeight: "bold",
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
});
