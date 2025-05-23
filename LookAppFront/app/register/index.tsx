import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  StatusBar,
  Alert,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const { register } = useAuth();
  const [userInfo, setUserInfo] = useState({
    email: "",
    user: "",
    pswd: "",
  });

  /**
   * Handles the user registration process.
   * Validates if all fields are completed.
   * Attempts to register the user with the provided credentials.
   * If successful, displays a success alert and navigates to the login screen.
   * If unsuccessful, displays an error alert with a descriptive message.
   */
  const handleRegister = async () => {
    if (!userInfo.email || !userInfo.user || !userInfo.pswd) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      console.log(userInfo.email, userInfo.user, userInfo.pswd);
      await register(userInfo.email, userInfo.user, userInfo.pswd);
      Alert.alert("Éxito", "¡Registro exitoso! Ahora puedes iniciar sesión.");
      router.push("login");
    } catch (error) {
      let errorMessage = "Ocurrió un error durante el registro.";
      Alert.alert("Error de registro", errorMessage);
    }
  };

  return (
    <>
      <StatusBar hidden={true} />
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: colors.secondary }]}>LooK</Text>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, borderColor: colors.secondary },
          ]}
        >
          <View style={styles.row}>
            <Text style={[styles.subTitle, { color: colors.secondary }]}>
              Regístrate
            </Text>
          </View>
          <View>
            <Text style={[styles.inputText, { color: colors.secondary }]}>
              Introduce tu email:{" "}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario..."
              value={userInfo.email}
              onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
            />
            <Text style={[styles.inputText, { color: colors.secondary }]}>
              Introduce tu nombre de usuario:{" "}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario..."
              value={userInfo.user}
              onChangeText={(text) => setUserInfo({ ...userInfo, user: text })}
            />
            <Text style={[styles.inputText, { color: colors.secondary }]}>
              Introduce la contraseña:{" "}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña..."
              value={userInfo.pswd}
              onChangeText={(text) => setUserInfo({ ...userInfo, pswd: text })}
              secureTextEntry
            />
          </View>
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor: colors.primary,
                borderColor: colors.secondary,
              },
            ]}
            onPress={handleRegister}
          >
            <Text style={[styles.textButton, { color: colors.secondary }]}>
              Regístrate
            </Text>
          </Pressable>
          <Text style={[styles.helpText, { color: colors.secondary }]}>
            ¿Ya tienes cuenta?
          </Text>
          <Pressable
            onPress={() => {
              router.push("login");
            }}
          >
            <Text style={[styles.textButton, { color: colors.secondary }]}>
              Pulsa aquí.
            </Text>
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
  modalContainer: {
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
  inputText: {
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
  subTitle: {
    color: "#4E4187",
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
  },
  textButton: {
    color: "#4E4187",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  helpText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  sendButton: {
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
  themeButton: {
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
