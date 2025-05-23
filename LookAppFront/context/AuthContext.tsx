import { createContext, useContext } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  profilePictureUri?: string; // Añade otros campos que necesites
}

export interface AuthContextType {
  setToken(accessToken: string): unknown;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  updateUserContext: (updatedUser: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const useAuth = () => useContext(AuthContext);
