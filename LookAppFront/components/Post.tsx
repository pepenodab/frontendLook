import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState } from "react";

type PublicacionProps = {
  usuario: string;
  imagenUri: string;
  descripcion: string;
  meGusta: string[];
  comentarios: { usuario: string; texto: string }[];
};

const Post = ({
  usuario,
  imagenUri,
  descripcion,
  meGusta,
  comentarios,
}: PublicacionProps) => {
  const [modalLikesVisible, setModalLikesVisible] = useState(false);
  const [modalComentariosVisible, setModalComentariosVisible] = useState(false);
  const [modalNuevoComentarioVisible, setModalNuevoComentarioVisible] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");

  const handleEnviarComentario = () => {
    // Aquí debes llamar a tu service para enviar el comentario a la API
    console.log("Comentario enviado:", nuevoComentario);
    setNuevoComentario("");
    setModalNuevoComentarioVisible(false);
    // Idealmente, también actualizarías el estado de los comentarios si la API responde correctamente
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={require("../assets/example.png")}
          style={styles.avatar}
        />
        <Text style={styles.nombreUsuario}>{usuario}</Text>
      </View>

      <Image source={require("../assets/example.png")} style={styles.imagen} />

      <View style={styles.stats}>
        <Pressable onPress={() => setModalLikesVisible(true)}>
          <Text style={styles.statText}>{meGusta.length} Me Gustas</Text>
        </Pressable>
        <Pressable onPress={() => setModalComentariosVisible(true)}>
          <Text style={styles.statText}>{comentarios.length} Comentarios</Text>
        </Pressable>
      </View>

      <View style={styles.descripcion}>
        <Text style={styles.usuarioBold}>{usuario}:</Text>
        <Text style={styles.descripcionTexto}>{descripcion}</Text>
      </View>

      {/* Modal de Me Gusta */}
      <Modal visible={modalLikesVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Me gustas:</Text>
            <ScrollView>
              {meGusta.map((name, index) => (
                <View key={index} style={styles.itemBox}>
                  <Image
                    source={require("../assets/example.png")}
                    style={styles.avatar}
                  />
                  <Text style={styles.nombreUsuarioModal}>{name}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable onPress={() => setModalLikesVisible(false)}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal de Comentarios */}
      <Modal
        visible={modalComentariosVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Comentarios:</Text>
            <ScrollView>
              {comentarios.map((c, index) => (
                <View key={index} style={styles.commentBox}>
                  <Text style={styles.usuarioBold}>Usuario:</Text>
                  <Text style={styles.descripcionTexto}> {c.texto}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable onPress={() => setModalNuevoComentarioVisible(true)}>
              <Text style={styles.statText}>➕ Agregar comentario</Text>
            </Pressable>
            <Pressable onPress={() => setModalComentariosVisible(false)}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal para Agregar Comentario */}
      <Modal
        visible={modalNuevoComentarioVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nuevo Comentario:</Text>
            <TextInput
              placeholder="Escribe tu comentario..."
              style={styles.input}
              value={nuevoComentario}
              onChangeText={setNuevoComentario}
              multiline
            />
            <Pressable onPress={handleEnviarComentario}>
              <Text style={styles.statText}>✅ Enviar</Text>
            </Pressable>
            <Pressable onPress={() => setModalNuevoComentarioVisible(false)}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  card: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FFF",
    marginVertical: 10,
    overflow: "hidden",
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
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
  imagen: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statText: {
    color: "#4B0082",
    fontWeight: "bold",
  },
  descripcion: {
    paddingHorizontal: 10,
    marginTop: 6,
  },
  usuarioBold: {
    fontWeight: "bold",
    color: "#4B0082",
  },
  descripcionTexto: {
    color: "#4B0082",
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBox: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#4B0082",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
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
  },
  input: {
    borderColor: "#4B0082",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 80,
    marginBottom: 10,
    backgroundColor: "#F8F4FF",
    color: "#4B0082",
  },
  close: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 18,
    color: "#4B0082",
  },
});
