import { dashincubatorRequest, RequestTypes } from "./serverRequest";

export const fetchUsers = async () => {
  const response = await dashincubatorRequest("users");
  return response.json();
};

export const fetchUsersSimple = async () => {
  const response = await dashincubatorRequest("users/simple");
  return response.json();
};

export const createUser = async (user) =>
  dashincubatorRequest("auth/register", RequestTypes.Post, user);

export const updateUser = (id, user) =>
  dashincubatorRequest(`users/${id}`, RequestTypes.Put, user);

export const getUser = (id) =>
  dashincubatorRequest(`users/${id}`, RequestTypes.Get);

export const getUserByUsername = (id) =>
  dashincubatorRequest(`users/username/${id}`, RequestTypes.Get);

export const loginUser = async (data) =>
  dashincubatorRequest("auth/login", RequestTypes.Post, data);

export const getAdmins = async () =>
  dashincubatorRequest("users/admins", RequestTypes.Get);

export const getAdminsSimple = async () =>
  dashincubatorRequest("users/admins/simple", RequestTypes.Get);

export const promoteUser = async (id) =>
  dashincubatorRequest(`users/promote/${id}`, RequestTypes.Put);

export const demoteUser = async (id) =>
  dashincubatorRequest(`users/demote/${id}`, RequestTypes.Put);
