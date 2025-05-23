import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, User as AuthUser } from "../context/AuthContext";
import apiService, {
  UserEditRequestDto,
  UserResponseDto,
  ApiResponseDto,
  TokenResponseDto,
} from "../service/api";
import * as ImagePicker from "expo-image-picker";
import Profile from "./Profile";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

type ProfileProps = {
  userId: string;
};

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

const CLOUDINARY_CLOUD_NAME = "dk8ppeive";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";

const uploadImageToCloudinary = async (
  imageUri: string
): Promise<string | null> => {
  if (!imageUri) return null;
  const formData = new FormData();
  const filename = imageUri.split("/").pop();
  const fileType = imageUri.split(".").pop();

  formData.append("file", {
    uri: imageUri,
    name: filename,
    type: `image/${fileType}`,
  } as any);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", response.status, errorText);
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    Alert.alert("Error de Subida", "No se pudo subir la imagen a Cloudinary.");
    return null;
  }
};

const followUser = async (userIdToFollow: string) => {
  await apiService.api.post(`/v1/users/${userIdToFollow}/follow`);
};

const unfollowUser = async (userIdToUnfollow: string) => {
  await apiService.api.delete(`/v1/users/${userIdToUnfollow}/follow`);
};

const ProfileScreen = ({ userId }: ProfileProps) => {
  const { theme, colors, toggleTheme } = useTheme();
  const auth = useAuth();
  const router = useRouter();

  const isMyProfile = auth.user && auth.user.id === userId;

  const [userData, setUserData] = useState<UserResponseDto | null>(null);
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loadingFollowState, setLoadingFollowState] = useState<boolean>(true);
  const [loadingProfileData, setLoadingProfileData] = useState<boolean>(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newProfilePictureUri, setNewProfilePictureUri] = useState<
    string | null
  >(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const [followersList, setFollowersList] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [loadingFollows, setLoadingFollows] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoadingProfileData(true);
    try {
      const userResponse = await apiService.getUserById(userId);
      setUserData(userResponse);

      const postsResponse = await apiService.getAllPostByUserId(userId);
      const parsedPosts: PostResponseDto[] = postsResponse.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      }));
      setPosts(parsedPosts);
    } catch (error: any) {
      console.error("Error al obtener datos del perfil:", error);
      Alert.alert("Error", "No se pudo cargar los datos del perfil.");
      setUserData(null);
      if (error.response && error.response.status === 401) {
        await auth.logout();
        router.replace("/login");
      }
    } finally {
      setLoadingProfileData(false);
    }
  }, [userId, auth, router]);

  useEffect(() => {
    if (!auth.loading && auth.user && auth.token) {
      fetchProfileData();
    } else if (!auth.loading && isMyProfile) {
      router.replace("/login");
    } else if (!auth.loading && !isMyProfile && (!auth.user || !auth.token)) {
      setLoadingProfileData(false);
    }
  }, [
    fetchProfileData,
    auth.loading,
    auth.user,
    auth.token,
    isMyProfile,
    router,
  ]);

  useEffect(() => {
    const checkIfFollowing = async () => {
      if (
        !isMyProfile &&
        auth.user &&
        auth.user.id &&
        auth.token &&
        !auth.loading
      ) {
        setLoadingFollowState(true);
        try {
          const followingIds = await apiService.getFollowingId(auth.user.id);
          setIsFollowing(followingIds.includes(userId));
        } catch (error: any) {
          console.error("Error al verificar estado de seguimiento:", error);
          setIsFollowing(false);
          if (error.response && error.response.status === 401) {
            await auth.logout();
            router.replace("/login");
          }
        } finally {
          setLoadingFollowState(false);
        }
      } else {
        setIsFollowing(false);
        setLoadingFollowState(false);
      }
    };
    if (auth.token) {
      checkIfFollowing();
    }
  }, [userId, auth.user, auth.token, isMyProfile, auth.loading, auth, router]);

  const handleFollowToggle = async () => {
    if (!auth.user || !auth.token) {
      Alert.alert("Error", "No hay sesión activa para realizar esta acción.");
      return;
    }
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setUserData((prev) =>
          prev
            ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) }
            : prev
        );
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setUserData((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev
        );
      }
    } catch (error: any) {
      console.error("Error al cambiar estado de seguimiento:", error);
      Alert.alert("Error", "No se pudo cambiar el estado de seguimiento.");
      if (error.response && error.response.status === 401) {
        await auth.logout();
        router.replace("/login");
      }
    }
  };

  const openEditModal = useCallback(() => {
    if (userData) {
      setNewUsername(userData.username);
      setNewProfilePictureUri(userData.profilePictureUri || null);
    }
    setEditModalVisible(true);
  }, [userData]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso Requerido",
        "Necesitamos permiso para acceder a tu galería."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setNewProfilePictureUri(result.assets[0].uri);
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!auth.user || !auth.token) {
      Alert.alert("Error", "No hay usuario logueado o sesión inválida.");
      return;
    }
    setIsSavingProfile(true);
    let finalCloudinaryUrl: string | undefined | null = newProfilePictureUri;

    try {
      if (
        newProfilePictureUri &&
        newProfilePictureUri !== userData?.profilePictureUri
      ) {
        const uploadedUrl = await uploadImageToCloudinary(newProfilePictureUri);
        if (!uploadedUrl) {
          Alert.alert("Error", "No se pudo subir la nueva imagen de perfil.");
          setIsSavingProfile(false);
          return;
        }
        finalCloudinaryUrl = uploadedUrl;
      } else if (newProfilePictureUri === null && userData?.profilePictureUri) {
        finalCloudinaryUrl = null;
      } else {
        finalCloudinaryUrl = userData?.profilePictureUri;
      }

      const updateData: UserEditRequestDto = {
        username: newUsername,
        profilePictureUri:
          finalCloudinaryUrl === null ? "" : finalCloudinaryUrl || "",
        email: auth.user.email,
      };

      await apiService.editUserProfileById(updateData);

      Alert.alert(
        "Éxito",
        "Perfil actualizado correctamente. Por favor, inicia sesión de nuevo para ver los cambios."
      );
      setEditModalVisible(false);
      await auth.logout();
      router.replace("/login");
    } catch (error: any) {
      console.error("Error al guardar el perfil:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "No se pudo guardar.";
      Alert.alert("Error", errorMessage);
      if (error.response && error.response.status === 401) {
        await auth.logout();
        router.replace("/login");
      }
    } finally {
      setIsSavingProfile(false);
    }
  }, [
    newUsername,
    newProfilePictureUri,
    userData?.profilePictureUri,
    auth,
    router,
  ]);

  const fetchAndShowFollowers = useCallback(async () => {
    setLoadingFollows(true);
    try {
      const followerIds = await apiService.getFollowers(userId);
      setFollowersList(followerIds);
    } catch (error: any) {
      console.error("Error al obtener IDs de seguidores:", error);
      Alert.alert("Error", "No se pudo cargar la lista de IDs de seguidores.");
      if (error.response && error.response.status === 401) {
        await auth.logout();
        router.replace("/login");
      }
    } finally {
      setLoadingFollows(false);
    }
  }, [userId, auth, router]);

  const fetchAndShowFollowing = useCallback(async () => {
    setLoadingFollows(true);
    try {
      const followingIds = await apiService.getFollowingId(userId);
      setFollowingList(followingIds);
    } catch (error: any) {
      console.error("Error al obtener IDs de seguidos:", error);
      Alert.alert("Error", "No se pudo cargar la lista de IDs de seguidos.");
      if (error.response && error.response.status === 401) {
        await auth.logout();
        router.replace("/login");
      }
    } finally {
      setLoadingFollows(false);
    }
  }, [userId, auth, router]);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar tu sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => {
            await auth.logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  if (loadingProfileData || auth.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>
          Usuario no encontrado o error al cargar el perfil.
        </Text>
        {isMyProfile && (
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={styles.editButton}
          >
            <Text style={styles.editText}>Ir al Login</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const handlePostClick = (postId: string) => {
    router.push(`/post?postId=${postId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.secondary },
        ]}
      >
        <Image
          source={
            userData.profilePictureUri
              ? { uri: userData.profilePictureUri }
              : require("../assets/example.png")
          }
          style={[styles.avatar, { borderColor: colors.secondary }]}
        />
        <Text style={[styles.username, { color: colors.secondary }]}>
          {userData.username}
        </Text>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              setFollowersModalVisible(true);
              fetchAndShowFollowers();
            }}
          >
            <Text style={[styles.statNumber, { color: colors.secondary }]}>
              {userData.followersCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>
              Seguidores
            </Text>
          </TouchableOpacity>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>
              {posts.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>
              Publicaciones
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              setFollowingModalVisible(true);
              fetchAndShowFollowing();
            }}
          >
            <Text style={[styles.statNumber, { color: colors.secondary }]}>
              {userData.followingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>
              Seguidos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsRow}>
          {isMyProfile ? (
            <>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary }]}
                onPress={openEditModal}
              >
                <Text style={[styles.editText, { color: colors.secondary }]}>
                  Editar perfil
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton} // Estilo para el botón de cerrar sesión
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {loadingFollowState ? (
                <ActivityIndicator size="small" color="#4B0082" />
              ) : (
                <TouchableOpacity
                  style={
                    isFollowing ? styles.unfollowButton : styles.followButton
                  }
                  onPress={handleFollowToggle}
                >
                  <Text
                    style={
                      isFollowing ? styles.unfollowText : styles.followText
                    }
                  >
                    {isFollowing ? "Dejar de seguir" : "Seguir"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      <FlatList
        data={posts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePostClick(item.id)}>
            <Image
              source={
                item.imageUri
                  ? { uri: item.imageUri }
                  : require("../assets/example.png")
              }
              style={styles.postImage}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.postsContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Todavía no tiene ninguna publicación.
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.secondary }]}>
              Editar Perfil
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.profileImagePicker}
            >
              <Image
                source={
                  newProfilePictureUri
                    ? { uri: newProfilePictureUri }
                    : userData.profilePictureUri
                    ? { uri: userData.profilePictureUri }
                    : require("../assets/example.png")
                }
                style={[styles.editAvatar, { borderColor: colors.secondary }]}
              />
              <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { borderColor: colors.secondary }]}
              placeholder="Nuevo nombre de usuario"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <Text style={styles.securityWarning}>
              ¡Advertencia! Por motivos de seguridad, deberás iniciar sesión de
              nuevo después de guardar los cambios.
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { backgroundColor: "red" },
                ]}
                onPress={() => setEditModalVisible(false)}
                disabled={isSavingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.secondary,
                  },
                ]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={followersModalVisible}
        onRequestClose={() => setFollowersModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.secondary }]}>
              Seguidores
            </Text>
            {loadingFollows ? (
              <ActivityIndicator size="large" color="#4B0082" />
            ) : (
              <ScrollView style={styles.modalScrollContent}>
                {followersList.length === 0 ? (
                  <Text style={styles.emptyText}>No hay seguidores.</Text>
                ) : (
                  followersList.map((id) => <Profile key={id} userId={id} />)
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { marginTop: 20 },
              ]}
              onPress={() => setFollowersModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={followingModalVisible}
        onRequestClose={() => setFollowingModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.secondary }]}>
              Seguidos
            </Text>
            {loadingFollows ? (
              <ActivityIndicator size="large" color="#4B0082" />
            ) : (
              <ScrollView style={styles.modalScrollContent}>
                {followingList.length === 0 ? (
                  <Text style={styles.emptyText}>No hay seguidos.</Text>
                ) : (
                  followingList.map((id) => <Profile key={id} userId={id} />)
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { marginTop: 20 },
              ]}
              onPress={() => setFollowingModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#FFF",
  },
  modalScrollContent: {
    width: "100%",
    flexGrow: 1,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
    backgroundColor: "#F8F8F8",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DDD",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#4B0082",
  },
  username: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginBottom: 15,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4B0082",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  editButton: {
    backgroundColor: "#4B0082",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  editText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "red",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  logoutButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  followButton: {
    backgroundColor: "#FFD966",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    borderColor: "#EAA300",
    borderWidth: 1,
  },
  unfollowButton: {
    backgroundColor: "#EEE",
    borderColor: "#AAA",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  messageButton: {
    backgroundColor: "#FFF",
    borderColor: "#4B0082",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  followText: {
    color: "#4B0082",
    fontWeight: "bold",
    fontSize: 14,
  },
  unfollowText: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageText: {
    color: "#4B0082",
    fontWeight: "bold",
    fontSize: 14,
  },
  postsContainer: {
    padding: 5,
  },
  postImage: {
    width: width / 2.25 - 6,
    height: width / 2.25 - 6,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#4B0082",
  },
  profileImagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DDD",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#4B0082",
  },
  changePhotoText: {
    color: "#4B0082",
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#red",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4B0082",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  securityWarning: {
    color: "red",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  modalList: {
    width: "100%",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    width: "100%",
  },
  userItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: "#DDD",
  },
  userItemUsername: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
