import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://IP:PORT/api",
});

export interface ApiResponseDto<T> {
  message: string;
  code: number;
  data: T | null;
  timestamp?: string;
}

export interface TokenResponseDto {
  accessToken: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
}

interface CommentRequestDto {
  content: string;
}

interface commentResponseDto {
  id: string;
  postId: string;
  userId: string;
  authorUsername: string;
  content: string;
}

export interface PostResponseDto {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  imageUri: string;
  createdAt: Date;
  likeCount: number;
}

interface LikeResponseDto {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  profilePictureUri: string;
  followersCount: number;
  followingCount: number;
}

export interface UserEditRequestDto {
  username: string;
  email: string;
  profilePictureUri: string;
}

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Edits the currently logged-in user's profile information.
 * @param data - The user data to update.
 * @returns A promise that resolves to the updated token response DTO.
 * @throws An error if the profile update fails.
 */
const editUserProfileById = async (
  data: UserEditRequestDto
): Promise<TokenResponseDto> => {
  try {
    const response = await api.put("/v1/users/me", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error al actualizar el perfil:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Error al actualizar el perfil."
      );
    } else {
      console.error("Error inesperado:", error);
      throw new Error("Ocurrió un error inesperado al actualizar el perfil.");
    }
  }
};

/**
 * Retrieves all posts made by a specific user.
 * @param userId - The ID of the user whose posts are to be retrieved.
 * @returns A promise that resolves to an array of PostResponseDto. Returns an empty array on error.
 */
const getAllPostByUserId = async (
  userId: string
): Promise<PostResponseDto[]> => {
  try {
    const response = await api.get("/v1/users/" + userId + "/posts");
    return response.data.data;
  } catch (error) {
    console.log("Error fetching all users");
    return [];
  }
};

/**
 * Retrieves a list of all users.
 * @returns A promise that resolves to an array of UserResponseDto. Returns an empty array on error.
 */
const getAllUser = async (): Promise<UserResponseDto[]> => {
  try {
    const response = await api.get("/v1/users");
    return response.data.data;
  } catch (error) {
    console.log("Error fetching all users");
    return [];
  }
};

/**
 * Retrieves the IDs of users that a specific user is following.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of user IDs. Returns `["!"]` on error.
 */
const getFollowingId = async (userId: String): Promise<string[]> => {
  try {
    const response = await api.get("/v1/users/" + userId + "/following");
    const usersIds: string[] = response.data.data.map(
      (user: { id: String }) => user.id
    );
    return usersIds;
  } catch (error) {
    console.error("Error fetching following IDs:", error);
    return ["!"];
  }
};

/**
 * Retrieves the IDs of users that are following a specific user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of user IDs. Returns `["!"]` on error.
 */
const getFollowers = async (userId: String): Promise<string[]> => {
  try {
    const response = await api.get("/v1/users/" + userId + "/followers");
    const usersIds: string[] = response.data.data.map(
      (user: { id: String }) => user.id
    );
    return usersIds;
  } catch (error) {
    console.error("Error fetching following IDs:", error);
    return ["!"];
  }
};

/**
 * Retrieves all comments for a specific post.
 * @param postId - The ID of the post.
 * @returns A promise that resolves to an array of commentResponseDto. Returns an empty array on error.
 */
const getCommentsByPostId = async (
  postId: String
): Promise<commentResponseDto[]> => {
  try {
    const response = await api.get("v1/posts/" + postId + "/comments");
    return response.data.data;
  } catch (error) {
    return [];
  }
};

/**
 * Likes a specific post.
 * @param postId - The ID of the post to like.
 * @returns A promise that resolves to the API response data.
 * @throws An error if the like operation fails.
 */
const likePost = async (postId: string) => {
  try {
    const response = await api.post(`/v1/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error en apiService.likePost:" + "(" + postId + ") ", error);
    throw error;
  }
};

/**
 * Unlikes a specific post.
 * @param postId - The ID of the post to unlike.
 * @returns A promise that resolves to the API response data.
 * @throws An error if the unlike operation fails.
 */
const unlikePost = async (postId: string) => {
  try {
    const response = await api.delete(`/v1/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(
      "Error en apiService.unlikePost:" + "(" + postId + ") ",
      error
    );
    throw error;
  }
};

/**
 * Retrieves user details by ID.
 * @param userId - The ID of the user to retrieve.
 * @returns A promise that resolves to a UserResponseDto. Returns an empty UserResponseDto on error.
 */
const getUserById = async (userId: String): Promise<UserResponseDto> => {
  try {
    const response = await api.get("/v1/users/" + userId);
    const userData: UserResponseDto = {
      id: response.data.data.id,
      username: response.data.data.username,
      email: response.data.data.email,
      profilePictureUri: response.data.data.profilePictureUri,
      followersCount: response.data.data.followersCount,
      followingCount: response.data.data.followingCount,
    };
    return userData;
  } catch (error) {
    const userData: UserResponseDto = {
      id: "",
      username: "",
      email: "",
      profilePictureUri: "",
      followersCount: 0,
      followingCount: 0,
    };
    return userData;
  }
};

/**
 * Retrieves likes for a specific post.
 * @param postId - The ID of the post.
 * @returns A promise that resolves to an array of LikeResponseDto. Returns an empty array if no likes are found or an error occurs.
 */
const getPostLikes = async (postId: String): Promise<LikeResponseDto[]> => {
  try {
    const response = await api.get("v1/posts/" + postId + "/likes");
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      const likesData: LikeResponseDto[] = response.data.data.map(
        (likeItem: any) => {
          return {
            id: likeItem.id,
            postId: likeItem.postId,
            userId: likeItem.userId,
            createdAt: new Date(likeItem.createdAt),
          };
        }
      );

      console.log(
        `Likes obtenidos exitosamente para el post ${postId}:`,
        likesData
      );
      return likesData;
    } else {
      console.warn(
        `Estructura de respuesta inesperada o no se encontraron likes en response.data.data para post ${postId}:`,
        response.data
      );
      return [];
    }
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves the main feed posts for a list of followed user IDs.
 * Iterates through each user ID and fetches their posts.
 * @param usersId - An array of user IDs whose posts are to be fetched.
 * @returns A promise that resolves to an array of all fetched posts. Returns an empty array if `usersId` is empty or null, or if an error occurs.
 */
const getMainPost = async (usersId: String[]): Promise<PostResponseDto[]> => {
  if (!usersId || usersId.length === 0) {
    console.log("getMainPost called with empty or null usersId");
    return [];
  }

  const allPosts: PostResponseDto[] = [];

  for (const userId of usersId) {
    try {
      const response = await api.get<any>(`/v1/users/${userId}/posts`);

      if (
        response &&
        response.status === 200 &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        allPosts.push(...response.data.data);
      } else {
        console.warn(
          `No posts found or unexpected response format for user ${userId}. Status: ${
            response?.status
          }, Data structure OK: ${!!(
            response?.data?.data && Array.isArray(response?.data?.data)
          )}`
        );
      }
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
    }
  }

  return allPosts;
};

/**
 * Retrieves user details by ID, specifically for displaying the post author's name.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to a UserResponseDto. Returns an empty UserResponseDto on error.
 */
const getNamePost = async (userId: String): Promise<UserResponseDto> => {
  try {
    const response = await api.get("/v1/users/" + userId);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Estado de respuesta del error (error.response.status):",
        error.response.status
      );
      console.error(
        "Datos de respuesta del error (error.response.data):",
        error.response.data
      );
    }
    return {
      id: "",
      username: "",
      email: "",
      profilePictureUri: "",
      followersCount: 0,
      followingCount: 0,
    };
  }
};

/**
 * Creates a new comment on a specified post.
 * @param postId - The ID of the post to comment on.
 * @param content - The content of the comment.
 * @returns A promise that resolves to an ApiResponseDto containing the created comment.
 * @throws An error if the comment creation fails.
 */
const createComment = async (
  postId: string,
  content: string
): Promise<ApiResponseDto<commentResponseDto>> => {
  try {
    const commentRequestDto: CommentRequestDto = { content: content };
    const response = await api.post<ApiResponseDto<commentResponseDto>>(
      `/v1/posts/${postId}/comments`,
      commentRequestDto
    );
    console.log(
      `Comment created successfully on post ${postId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in apiService.createComment for post ${postId}:`,
      error
    );
    throw error;
  }
};

/**
 * Deletes a specific comment by its ID.
 * @param commentId - The ID of the comment to delete.
 * @returns A promise that resolves when the comment is successfully deleted.
 * @throws An error if the comment deletion fails.
 */
const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const response = await api.delete(`/v1/comments/${commentId}`);
    console.log(
      `Comment ${commentId} deleted successfully. Status: ${response.status}`
    );
    return;
  } catch (error) {
    console.error(
      `Error in apiService.deleteComment for comment ${commentId}:`,
      error
    );
    throw error;
  }
};

/**
 * Follows a specified user.
 * @param userId - The ID of the user to follow.
 * @returns A promise that resolves to the API response data. Returns `undefined` on error.
 */
const followUser = async (userId: string) => {
  try {
    const response = await api.post("/v1/users/" + userId + "/follow");
    return response.data;
  } catch (error) {
    console.log("Error following ", error);
    return;
  }
};

/**
 * Unfollows a specified user.
 * @param userId - The ID of the user to unfollow.
 * @returns A promise that resolves to the API response data. Returns `undefined` on error.
 */
const unfollowUser = async (userId: string) => {
  try {
    const response = await api.delete("/v1/users/" + userId + "/follow");
    return response.data;
  } catch (error) {
    console.log("Error following ", error);
    return;
  }
};

/**
 * Retrieves a single post by its ID.
 * @param postId - The ID of the post to retrieve.
 * @returns A promise that resolves to a PostResponseDto. Returns an empty PostResponseDto on error.
 */
const getPostById = async (postId: string): Promise<PostResponseDto> => {
  try {
    const response = await api.get("/v1/posts/" + postId);
    return response.data.data;
  } catch (error) {
    console.log(error);
    return {
      id: "",
      userId: "",
      username: "",
      title: "",
      content: "",
      imageUri: "",
      createdAt: new Date(),
      likeCount: 0,
    };
  }
};

export default {
  api,
  getFollowingId,
  getMainPost,
  getNamePost,
  getPostLikes,
  getUserById,
  getCommentsByPostId,
  likePost,
  unlikePost,
  createComment,
  deleteComment,
  getAllUser,
  getAllPostByUserId,
  followUser,
  unfollowUser,
  getPostById,
  editUserProfileById,
  getFollowers,
};
