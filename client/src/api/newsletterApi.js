import { dashincubatorRequest, RequestTypes } from "./serverRequest";

export const fetchSubscribers = async () => {
  const response = await dashincubatorRequest("newsletter");
  return response.json();
};

export const subscribeNewsletter = async (subscription) =>
  dashincubatorRequest("newsletter/subscribe", RequestTypes.Post, subscription);
