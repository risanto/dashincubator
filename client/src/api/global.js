import { dashincubatorRequest } from "./serverRequest";

export const fetchActivity = async () =>
  dashincubatorRequest("global/activity");

export const fetchNotifications = async () =>
  dashincubatorRequest("global/notifications");

export const fetchDashboard = async () =>
  dashincubatorRequest("global/dashboard");

export const fetchDashboardCount = async () =>
  dashincubatorRequest("global/dashboard-count");
