import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useMediaLibraryPermissions } from "expo-image-picker";
import apiService from "../service/api";
import { useTheme } from "../context/ThemeContext";

type CameraFacing = "front" | "back";

interface PostRequestDto {
  title: string;
  content: string;
  imageUri: string;
}

export default function CameraScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraFacing>("back");
  const [photo, setPhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    useMediaLibraryPermissions();

  const CLOUD_NAME = "dk8ppeive";
  const UPLOAD_PRESET = "unsigned_preset";

  useEffect(() => {
    (async () => {
      const cameraPerm = await requestCameraPermission();
      const mediaLibPerm = await requestMediaLibraryPermission();

      if (!cameraPerm.granted) {
        Alert.alert(
          "Permiso de Cámara Requerido",
          "Por favor, otorga acceso a la cámara en la configuración de tu dispositivo para usar esta función."
        );
      }
      if (!mediaLibPerm.granted) {
        Alert.alert(
          "Permiso de Galería Requerido",
          "Por favor, otorga acceso a la galería en la configuración de tu dispositivo para seleccionar imágenes."
        );
      }
    })();
  }, []);

  /**
   * Captura una foto usando la cámara del dispositivo.
   */
  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      Alert.alert(
        "Permiso Requerido",
        "Se necesita permiso de cámara para tomar fotos.",
        [
          { text: "OK" },
          { text: "Solicitar", onPress: requestCameraPermission },
        ]
      );
      return;
    }

    if (cameraRef.current) {
      try {
        setUploadingImage(true);
        const result = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        if (result?.uri && result.base64) {
          await uploadToCloudinary(result.base64);
        } else {
          Alert.alert("Error", "No se pudo tomar la foto correctamente.");
        }
      } catch (error) {
        console.error("Error al tomar la foto:", error);
        Alert.alert("Error", "No se pudo tomar la foto.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  /**
   * Permite al usuario seleccionar una imagen de la galería.
   */
  const pickImage = async () => {
    if (!mediaLibraryPermission?.granted) {
      Alert.alert(
        "Permiso Requerido",
        "Se necesita permiso de galería para seleccionar imágenes.",
        [
          { text: "OK" },
          { text: "Solicitar", onPress: requestMediaLibraryPermission },
        ]
      );
      return;
    }

    try {
      setUploadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0 &&
        result.assets[0].base64
      ) {
        await uploadToCloudinary(result.assets[0].base64);
      } else if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0 &&
        !result.assets[0].base64
      ) {
        Alert.alert(
          "Error",
          "No se pudo obtener la imagen en formato base64. Intenta de nuevo."
        );
      } else if (result.canceled) {
        // El usuario canceló la selección de la imagen
      }
    } catch (error) {
      console.error("Error al seleccionar la imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen de la galería.");
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Sube una imagen en formato base64 a Cloudinary.
   * @param {string} base64 - La imagen en formato base64.
   */
  const uploadToCloudinary = async (base64: string) => {
    const data = {
      file: `data:image/jpg;base64,${base64}`,
      upload_preset: UPLOAD_PRESET,
      cloud_name: CLOUD_NAME,
    };

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      if (result.secure_url) {
        setPhoto(result.secure_url);
        // Añadir un ligero timeout después de subir la foto para evitar el crash de Expo
        setTimeout(() => {
          setModalVisible(true);
        }, 50);
      } else {
        Alert.alert(
          "Error",
          "No se pudo obtener la URL de la imagen de Cloudinary."
        );
        console.error("Fallo de carga en Cloudinary:", result);
      }
    } catch (err) {
      console.error("Error al subir a Cloudinary:", err);
      Alert.alert("Error", "Hubo un problema al subir la imagen.");
    }
  };

  /**
   * Cambia entre la cámara frontal y trasera.
   */
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  /**
   * Publica la imagen con su título y descripción.
   */
  const handlePublicar = async () => {
    if (!photo) {
      Alert.alert("Error", "No hay foto para publicar.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Error", "Por favor, añade un título al post.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Por favor, añade una descripción al post.");
      return;
    }

    setCreatingPost(true);
    try {
      const postData: PostRequestDto = {
        title: title.trim(),
        content: description.trim(),
        imageUri: photo,
      };
      const response = await apiService.api.post("/v1/posts", postData);

      if (response.status === 201) {
        Alert.alert("Éxito", "Post publicado correctamente.");
        setTimeout(() => {
          setModalVisible(false);
          setPhoto(null);
          setDescription("");
          setTitle("");
        }, 50);
      } else {
        Alert.alert("Error", "No se pudo publicar el post.");
        console.error("Error creando post:", response.data);
      }
    } catch (error) {
      console.error("Error al publicar el post:", error);
      Alert.alert("Error", "Ocurrió un error al intentar publicar el post.");
    } finally {
      setCreatingPost(false);
    }
  };

  /**
   * Cancela la publicación y cierra el modal.
   */
  const handleCancel = () => {
    setModalVisible(false);
    setPhoto(null);
    setDescription("");
    setTitle("");
  };

  if (!cameraPermission || !mediaLibraryPermission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text>Cargando permisos...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
    const canRequestAgain =
      cameraPermission.canAskAgain && mediaLibraryPermission.canAskAgain;
    return (
      <View style={[styles.centered, { borderColor: colors.secondary }]}>
        <Text style={[styles.permissionText, { color: colors.secondary }]}>
          Se requieren permisos de Cámara y Galería para usar esta función.
        </Text>
        {canRequestAgain && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              if (!cameraPermission.granted) requestCameraPermission();
              if (!mediaLibraryPermission.granted)
                requestMediaLibraryPermission();
            }}
          >
            <Text
              style={[styles.permissionButtonText, { color: colors.secondary }]}
            >
              Otorgar Permisos
            </Text>
          </TouchableOpacity>
        )}
        {!canRequestAgain && (
          <Text style={[styles.permissionText, { color: colors.secondary }]}>
            Por favor, habilita los permisos desde la configuración de tu
            dispositivo.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!modalVisible && !uploadingImage && !creatingPost && (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      {!modalVisible && !uploadingImage && !creatingPost && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={pickImage} style={styles.button}>
            <Text style={styles.buttonText}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <Text style={styles.captureButtonText}>📸</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleCameraFacing} style={styles.button}>
            <Text style={styles.buttonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {(uploadingImage || creatingPost) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFD966" />
          <Text style={styles.loadingText}>
            {uploadingImage ? "Subiendo imagen..." : "Publicando post..."}
          </Text>
        </View>
      )}

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {photo && (
              <Image source={{ uri: photo }} style={styles.previewImage} />
            )}
            <Text style={[styles.label, { color: colors.secondary }]}>
              Título del Post
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border }]}
              placeholder="Ej: Mi día en la playa"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#888"
            />
            <Text style={[styles.label, { color: colors.secondary }]}>
              Descripción
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border }]}
              placeholder="Escribe algo sobre la foto..."
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handlePublicar}
                style={[
                  styles.modalButton,
                  styles.publicar,
                  { backgroundColor: colors.primary },
                ]}
                disabled={creatingPost}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.secondary }]}
                >
                  Publicar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.modalButton, styles.cancelar]}
                disabled={creatingPost}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  permissionButton: {
    backgroundColor: "#4B0082",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#FFF0C9",
    borderRadius: 50,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
  buttonText: {
    fontSize: 24,
  },
  captureButton: {
    backgroundColor: "#4B0082",
    borderRadius: 40,
    padding: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.7)",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonText: {
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#eee",
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4B0082",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    minHeight: 80, // Aumentado para mejor visibilidad en multiline
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: "top",
    marginBottom: 15,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  publicar: {
    backgroundColor: "#FFD966",
    marginRight: 8,
  },
  cancelar: {
    backgroundColor: "#DC3545",
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
});
