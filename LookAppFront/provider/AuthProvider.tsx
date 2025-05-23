import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext, User, AuthContextType } from "../context/AuthContext";
import apiService from "../service/api";

const api = apiService.api;
const USER_INFO_KEY = "userInfo";
const AUTH_TOKEN_KEY = "authToken";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      // await api.post("/auth/logout");
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_INFO_KEY);
      setUser(null);
      setToken(null);
      if (api.defaults.headers.common["Authorization"]) {
        delete api.defaults.headers.common["Authorization"];
      }
    }
  }, []);

  const login = useCallback(
    async (usernameOrEmail: string, password: string) => {
      try {
        const response = await api.post("/auth/login", {
          username: usernameOrEmail,
          password,
        });

        const {
          accessToken,
          userId,
          username: userNameFromResponse,
          email: userEmail,
          roles,
          profilePictureUri,
        } = response.data.data;

        const userInfo: User = {
          id: userId,
          username: userNameFromResponse,
          email: userEmail,
          roles,
          profilePictureUri,
        };

        setUser(userInfo);
        setToken(accessToken);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      } catch (error) {
        console.error("Login failed:", error);
        await logout();
        throw error;
      }
    },
    [logout]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      try {
        const response = await api.post("/auth/register", {
          username,
          email,
          password,
        });
        const registeredUserResponse = response.data.data;
        console.log("User registered:", registeredUserResponse);

        if (response.status !== 201) {
          throw new Error(
            "Registration failed with status: " + response.status
          );
        }
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    [] // No hay dependencias externas, ya que no estamos logueando automáticamente aquí
  );

  const updateUserContext = useCallback(async (updatedUserInfo: User) => {
    setUser(updatedUserInfo);
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUserInfo));
  }, []);

  useEffect(() => {
    const loadAuthData = async () => {
      setLoading(true);
      try {
        const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const savedUserInfoString = await AsyncStorage.getItem(USER_INFO_KEY);

        if (savedToken) {
          if (savedUserInfoString) {
            setToken(savedToken);
            setUser(JSON.parse(savedUserInfoString) as User);
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${savedToken}`;
          } else {
            console.warn(
              "Token found but no user info in storage. Performing automatic logout."
            );
            await logout();
          }
        }
      } catch (error) {
        console.error(
          "Failed to load auth data from storage, performing logout:",
          error
        );
        await logout();
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, [logout]);

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateUserContext,
    setToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
