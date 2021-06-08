import { dashincubatorRequest, RequestTypes } from "./serverRequest";

export const readNotification = async (id) =>
  dashincubatorRequest(`notifications/set-read/${id}`, RequestTypes.Put);

export const readAllNotifications = async () =>
  dashincubatorRequest("notifications/set-read-all", RequestTypes.Put);

export const countNotifications = async () =>
  dashincubatorRequest("notifications/count");
