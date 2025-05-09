import { View, StyleSheet } from "react-native";
import Footer from "../../components/Footer";
import ProfileScreen from "../../components/ProfileScreen";
import Header from "../../components/Header";

export default function ProfileUser() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        <ProfileScreen
          username={"Pepe"}
          seguidores={10}
          seguidos={10}
          publicaciones={10}
          imagenes={[
            "https://images.unsplash.com/photo-1617781754299-d1d0e2e4b5f0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
            "https://images.unsplash.com/photo-1617781754299-d1d0e2e4b5f0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
            "https://images.unsplash.com/photo-1617781754299-d1d0e2e4b5f0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
          ]}
        />
      </View>
      <Footer />
    </View>
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
});
