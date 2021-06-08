import { dashincubatorRequest, RequestTypes } from "./serverRequest";

export const getTask = async (id) =>
  dashincubatorRequest(`tasks/get/${id}`, RequestTypes.Get);

export const getTaskActivity = async (id) =>
  dashincubatorRequest(`tasks/get/${id}/activity`, RequestTypes.Get);

export const createTask = async (task, bountyID) =>
  dashincubatorRequest("tasks/new", RequestTypes.Post, { task, bountyID });

export const updateTask = (data) =>
  dashincubatorRequest(`tasks/update`, RequestTypes.Put, data);

export const requestToReserveTask = (user, taskId) => {
  dashincubatorRequest(
    `tasks/request-to-reserve/${taskId}`,
    RequestTypes.Put,
    user
  );
};

export const requestToModifyTask = (data, taskId) => {
  dashincubatorRequest(
    `tasks/request-to-modify/${taskId}`,
    RequestTypes.Put,
    data
  );
};

export const requestToApproveTask = (data, taskId) => {
  dashincubatorRequest(
    `tasks/request-to-approve/${taskId}`,
    RequestTypes.Put,
    data
  );
};

export const requestToApproveJob = (data, taskId) => {
  dashincubatorRequest(
    `tasks/request-to-approve-job/${taskId}`,
    RequestTypes.Put,
    data
  );
};

export const commentTask = (data, taskId) =>
  dashincubatorRequest(`tasks/comment/${taskId}`, RequestTypes.Put, data);

export const updateCommentTask = (data, commentId) =>
  dashincubatorRequest(
    `tasks/comment-edit/${commentId}`,
    RequestTypes.Put,
    data
  );

export const requestToCompleteTask = (data, taskId) => {
  dashincubatorRequest(
    `tasks/request-to-complete/${taskId}`,
    RequestTypes.Put,
    data
  );
};

export const requestToCompleteJob = (data, taskId) => {
  dashincubatorRequest(
    `tasks/request-to-complete-job/${taskId}`,
    RequestTypes.Put,
    data
  );
};

export const payoutTask = (data, taskId) => {
  dashincubatorRequest(`tasks/payout/${taskId}`, RequestTypes.Put, data);
};

export const getCompletedTasks = () =>
  dashincubatorRequest(`tasks/completed`, RequestTypes.Get);
