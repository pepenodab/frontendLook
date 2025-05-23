import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import apiService from "../../service/api";
import { UserResponseDto } from "../../service/api";
import { router } from "expo-router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

interface UserSearchResultItemProps {
  user: UserResponseDto;
  onPress: (userId: string) => void;
}

const UserSearchResultItem: React.FC<UserSearchResultItemProps> = ({
  user,
  onPress,
}) => {
  const { theme, colors, toggleTheme } = useTheme();
  return (
    <Pressable
      style={[
        styles.resultItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => onPress(user.id)}
    >
      <Image
        source={
          user.profilePictureUri
            ? { uri: user.profilePictureUri }
            : require("../../assets/example.png")
        }
        style={styles.resultAvatar}
      />
      <Text style={[styles.resultUsername, { color: colors.secondary }]}>
        {user.username}
      </Text>
    </Pressable>
  );
};

export default function SearchScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<UserResponseDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  /**
   * Fetches all users from the API, excluding 'superadmin'.
   * Sets loading state and handles potential errors during the fetch.
   * Stores fetched users in `allUsers` state.
   */
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setInitialLoadError(null);
      try {
        console.log("Fetching all users...");
        const users = await apiService.getAllUser();
        const filteredUsers = users.filter(
          (user) => user.username !== "superadmin"
        );
        setAllUsers(filteredUsers);
        console.log(`Workspaceed ${users.length} users.`);
      } catch (error) {
        console.error("Error fetching all users:", error);
        setAllUsers([]);
        setInitialLoadError("Failed to load users for search.");
        Alert.alert("Error", "Failed to load users for search.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  /**
   * Handles changes in the search input text.
   * Updates the `searchTerm` and filters `allUsers` based on the input.
   * If the input is empty, `filteredUsers` is cleared.
   */
  const handleSearchInputChange = useCallback(
    (text: string) => {
      setSearchTerm(text);

      if (text.trim() === "") {
        setFilteredUsers([]);
      } else {
        const filtered = allUsers.filter((user) =>
          user.username.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    },
    [allUsers]
  );

  /**
   * Handles the press event on a user search result item.
   * Navigates to the user's profile page using the `userId`.
   */
  const handleUserResultPress = useCallback((clickedUserId: string) => {
    console.log(`User item clicked with ID: ${clickedUserId}`);
    router.push(`/profileuser?userId=${clickedUserId}`);
  }, []);

  /**
   * Renders the appropriate content for the results area based on loading state,
   * errors, and search term. Displays a loading indicator, error message,
   * initial search prompt, or the list of filtered users.
   */
  const renderResultsArea = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color="#4B0082"
          style={styles.loadingIndicator}
        />
      );
    }

    if (initialLoadError) {
      return <Text style={styles.errorText}>{initialLoadError}</Text>;
    }

    if (searchTerm.trim() === "") {
      return (
        <Text style={[styles.initialMessageText, { color: colors.secondary }]}>
          Busca un perfil usando la barra de búsqueda.
        </Text>
      );
    }

    if (filteredUsers.length === 0) {
      if (allUsers.length === 0 && !loading && !initialLoadError) {
        return (
          <Text style={[styles.noResultsText, { color: colors.secondary }]}>
            No hay usuarios disponibles para buscar.
          </Text>
        );
      }
      return (
        <Text style={[styles.noResultsText, { color: colors.secondary }]}>
          No se encontraron usuarios para "{searchTerm}".
        </Text>
      );
    }

    return (
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserSearchResultItem user={item} onPress={handleUserResultPress} />
        )}
        contentContainerStyle={styles.resultsList}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Header />
      <View
        style={[
          styles.profilesContainer,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: colors.card, color: colors.secondary },
            ]}
            placeholder="Introduce el nombre a buscar..."
            placeholderTextColor={colors.secondary}
            value={searchTerm}
            onChangeText={handleSearchInputChange}
          />
        </View>
        <View style={styles.resultsArea}>{renderResultsArea()}</View>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE6A8",
    width: "100%",
    height: "80%",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  profilesContainer: {
    backgroundColor: "#FFF",
    height: "70%",
    width: "95%",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#4E4187",
    alignItems: "center",
  },
  searchContainer: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 16,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
    color: "#4B0082",
    fontSize: 16,
  },
  resultsArea: {
    flex: 1,
    width: "90%",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  initialMessageText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4B0082",
    fontStyle: "italic",
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4B0082",
  },
  resultsList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4FF",
    borderWidth: 1,
    borderColor: "#4B0082",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B0082",
    flexShrink: 1,
  },
});
