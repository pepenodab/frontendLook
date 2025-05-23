import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState({
    username: "",
    password: "",
  });

  const { login } = useAuth();

  /**
   * Handles the user login process.
   * Attempts to log in the user with the provided credentials.
   * If successful, navigates to the home screen.
   * If unsuccessful, displays an alert with an error message.
   */
  const handleLogin = async () => {
    try {
      await login(userInfo.username, userInfo.password);
      router.replace("/home");
    } catch (error) {
      console.log("Error al iniciar sesión:", error);
      Alert.alert(
        "Error",
        "Credenciales incorrectas o servidor no disponible."
      );
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
              Iniciar Sesión
            </Text>
          </View>
          <View>
            <Text style={[styles.inputText, { color: colors.secondary }]}>
              Introduce tu nombre de usuario:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario..."
              autoCapitalize="none"
              value={userInfo.username}
              onChangeText={(text) =>
                setUserInfo({ ...userInfo, username: text })
              }
            />
            <Text style={[styles.inputText, { color: colors.secondary }]}>
              Introduce la contraseña:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña..."
              value={userInfo.password}
              onChangeText={(text) =>
                setUserInfo({ ...userInfo, password: text })
              }
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
            onPress={handleLogin}
          >
            <Text style={[styles.textButton, { color: colors.secondary }]}>
              Iniciar sesión
            </Text>
          </Pressable>
          <Text style={[styles.helpText, { color: colors.secondary }]}>
            ¿No tienes cuenta?
          </Text>
          <Pressable onPress={() => router.push("/register")}>
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
    marginTop: "13%",
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
    marginTop: "15%",
  },
});
