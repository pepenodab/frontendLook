// import { Camera, CameraType as TCameraType } from "expo-camera";
// import * as ImagePicker from "expo-image-picker";

// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   Image,
// } from "react-native";
// import React, { useEffect, useRef, useState } from "react";

// export default function CameraScreen() {
//   const cameraRef = useRef<typeof Camera | null>(null);
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [type, setType] = useState<TCameraType>(
//     Camera.Constants.Type.back as TCameraType
//   );
//   const [photo, setPhoto] = useState<string | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [descripcion, setDescripcion] = useState("");

//   useEffect(() => {
//     (async () => {
//       const cameraStatus = await Camera.requestCameraPermissionsAsync();
//       const mediaStatus =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       setHasPermission(
//         cameraStatus.status === "granted" && mediaStatus.status === "granted"
//       );
//     })();
//   }, []);

//   const takePhoto = async () => {
//     if (cameraRef.current) {
//       // @ts-ignore: next line for compatibility
//       const result = await cameraRef.current.takePictureAsync();
//       setPhoto(result.uri);
//       setModalVisible(true);
//     }
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ["photo"],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setPhoto(result.assets[0].uri);
//       setModalVisible(true);
//     }
//   };

//   const handlePublicar = () => {
//     // Aquí va tu service
//     console.log(" Publicar", photo, "Descripción:", descripcion);
//     setModalVisible(false);
//     setPhoto(null);
//     setDescripcion("");
//   };

//   if (hasPermission === null) return <Text>Solicitando permisos...</Text>;
//   if (hasPermission === false)
//     return <Text>Permisos denegados para cámara o galería.</Text>;

//   return (
//     <View style={styles.container}>
//       <Camera
//         style={styles.camera}
//         type={type}
//         // @ts-ignore: para evitar conflicto JSX type
//         ref={cameraRef}
//       />

//       <View style={styles.controls}>
//         <TouchableOpacity onPress={pickImage} style={styles.button}>
//           <Text>Galería</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
//           <Text style={{ color: "white" }}>📸</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() =>
//             setType(
//               type === Camera.Constants.Type.back
//                 ? Camera.Constants.Type.front
//                 : Camera.Constants.Type.back
//             )
//           }
//           style={styles.button}
//         >
//           <Text>🔄</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Modal de descripción */}
//       <Modal transparent visible={modalVisible} animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             {photo && (
//               <Image source={{ uri: photo }} style={styles.previewImage} />
//             )}
//             <Text style={styles.label}>Añade una descripción</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Texto..."
//               value={descripcion}
//               onChangeText={setDescripcion}
//               multiline
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 onPress={handlePublicar}
//                 style={styles.publicar}
//               >
//                 <Text style={{ color: "white" }}>Publicar</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   setModalVisible(false);
//                   setPhoto(null);
//                   setDescripcion("");
//                 }}
//                 style={styles.cancelar}
//               >
//                 <Text style={{ color: "white" }}>Cancelar</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   camera: { flex: 1 },
//   controls: {
//     position: "absolute",
//     bottom: 30,
//     flexDirection: "row",
//     width: "100%",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   button: {
//     backgroundColor: "#FFF0C9",
//     borderRadius: 6,
//     padding: 10,
//   },
//   captureButton: {
//     backgroundColor: "#4B0082",
//     borderRadius: 30,
//     padding: 20,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     width: "80%",
//     alignItems: "center",
//   },
//   previewImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   label: {
//     fontWeight: "bold",
//     color: "#4B0082",
//     marginBottom: 5,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     width: "100%",
//     height: 80,
//     borderRadius: 8,
//     padding: 8,
//     textAlignVertical: "top",
//   },
//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     marginTop: 12,
//   },
//   publicar: {
//     flex: 1,
//     marginRight: 8,
//     backgroundColor: "#FFD966",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   cancelar: {
//     flex: 1,
//     backgroundColor: "#D73A49",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
// });
