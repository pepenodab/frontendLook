import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

type ProfileProps = {
  username: string;
  seguidores: number;
  seguidos: number;
  publicaciones: number;
  imagenes: string[]; // URLs de las publicaciones
};

const ProfileScreen = ({
  username,
  seguidores,
  seguidos,
  publicaciones,
  imagenes,
}: ProfileProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/example.png")}
          style={styles.avatar}
        />
        <Text style={styles.username}>{username}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{seguidores}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{publicaciones}</Text>
            <Text style={styles.statLabel}>Publicaciones</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{seguidos}</Text>
            <Text style={styles.statLabel}>Seguidos</Text>
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Seguir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageText}>Enviar mensaje</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={imagenes}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Image
            source={require("../assets/example.png")}
            style={styles.postImage}
          />
        )}
        contentContainerStyle={styles.postsContainer}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    width: "100%",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomColor: "#4B0082",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4B0082",
  },
  statsRow: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-around",
    width: "100%",
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
    color: "#4B0082",
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  followButton: {
    backgroundColor: "#FFD966",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  messageButton: {
    backgroundColor: "#fff",
    borderColor: "#4B0082",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followText: {
    color: "#4B0082",
    fontWeight: "bold",
  },
  messageText: {
    color: "#4B0082",
    fontWeight: "bold",
  },
  postsContainer: {
    padding: 4,
  },
  postImage: {
    width: width / 3 - 8,
    height: width / 3 - 8,
    margin: 4,
    borderRadius: 6,
  },
});
