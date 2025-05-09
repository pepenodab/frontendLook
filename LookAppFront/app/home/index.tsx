import { View, StyleSheet } from "react-native";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post from "../../components/Post";

export default function HomeScreen() {
  return (
    <>
      <View style={styles.container}>
        <Header />
        <View style={styles.body}>
          <Post
            usuario={"Pepe"}
            imagenUri={"daigual"}
            descripcion={"Soy JODIDAMENTE GUAPO"}
            meGusta={["ana", "jorge", "lucas"]}
            comentarios={[
              { usuario: "ana", texto: "Me encantó" },
              { usuario: "lucas", texto: "Muy buena foto" },
            ]}
          />
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
});
