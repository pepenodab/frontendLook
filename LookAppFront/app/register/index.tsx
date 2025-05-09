import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    user: "",
    pswd: "",
  });

  return (
    <>
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <Text style={styles.title}>LooK</Text>
        <View style={styles.modal_container}>
          <View style={styles.row}>
            {/* <FontAwesomeIcon
                    size={35}
                    icon={faSun}
                    style={styles.theme_button}
                  /> */}
            <Text style={styles.sub_title}>Registrate</Text>
          </View>
          <View>
            <Text style={styles.input_text}>Introduce tu email: </Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario..."
              value={userInfo.email}
              onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
            />
            <Text style={styles.input_text}>
              Introduce tu nombre de usuario:{" "}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario..."
              value={userInfo.user}
              onChangeText={(text) => setUserInfo({ ...userInfo, user: text })}
            />
            <Text style={styles.input_text}>Introduce la contraseña: </Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña..."
              value={userInfo.pswd}
              onChangeText={(text) => setUserInfo({ ...userInfo, pswd: text })}
              secureTextEntry
            />
          </View>
          <Pressable style={styles.send_button} onPress={() => {}}>
            <Text style={styles.text_button}>Registrate</Text>
          </Pressable>
          <Text style={styles.help_text}>¿Ya tienes cuenta?</Text>
          <Pressable
            onPress={() => {
              router.push("login");
            }}
          >
            <Text style={styles.text_button}>Pulsa aqui.</Text>
          </Pressable>
        </View>
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
  modal_container: {
    width: "90%",
    height: "80%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#4E4187",
    alignItems: "center",
  },
  input: {
    marginTop: "5%",
    borderColor: "#4E4187",
    borderWidth: 2,
    height: "8%",
    backgroundColor: "lightgray",
  },
  input_text: {
    width: 200,
    textAlign: "center",
    color: "#4E4187",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "5%",
  },
  title: {
    color: "#4E4187",
    fontSize: 80,
    marginTop: "5%",
    fontWeight: "bold",
    textAlign: "center",
  },
  sub_title: {
    color: "#4E4187",
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
  },
  text_button: {
    color: "#4E4187",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  help_text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  send_button: {
    borderColor: "#4E4187",
    borderWidth: 2,
    color: "#4E4187",
    textAlign: "center",
    backgroundColor: "#FFE6A8",
    paddingVertical: "5%",
    paddingHorizontal: "10%",
    borderRadius: 15,
    marginBottom: "10%",
  },
  theme_button: {
    borderRadius: "100%",
    borderWidth: 2,
    borderColor: "black",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "5%",
  },
});
