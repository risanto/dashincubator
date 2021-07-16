import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";

import MainLayout from "../../layouts/MainLayout";
import Lottie from "react-lottie";
import * as animationData from "./done.json";

import { fetchMyTasks } from "../../api/tasksApi";

import TaskDetailsView from "../TaskDetails";
import ReviewTaskView from "../ReviewTask";
import CompleteTaskView from "../CompleteTask";
import CompleteJobView from "../CompleteJob";
import EditTaskView from "../EditTask";
import ReviewJobView from "../ReviewJob";

import NotificationItem from "../../components/NotificationItem";
import checkedIcon from "../Home/images/checked.svg";
import { CircularProgress } from "@material-ui/core";
import caretDown from "../Home/images/caretDown.svg";
import { truncate, Breakpoints } from "../../utils/utils";
import { useHistory } from "react-router";
import cx from "classnames";
import {
  BountyLocation,
  ConceptLocation,
  PaymentsLocation,
} from "../../Locations";

const defaultOptions = {
  loop: false,
  autoplay: true,
  animationData: animationData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px 88px 24px",
    marginTop: "32px",
    color: "#0B0F3B",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  markAll: {
    marginLeft: "0px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "white",
    fontSize: "12px",
    marginTop: 0,
  },
  mobileHeading: { display: "block", alignItems: "center" },
  notifBadge: {
    backgroundColor: "#AD1D73",
    borderRadius: "4px",
    color: "white",
    marginLeft: "6px",
    minWidth: "15px",
    minHeight: "17px",
    userSelect: "none",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: "13px",
    padding: "4px",
  },
  header: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: 600,
    letterSpacing: "0.1em",
    fontSize: "12px",
    lineHeight: "15px",
    marginTop: "32px",
  },
  myTasksItemContainer: {
    fontSize: "18px",
    fontWeight: 600,
    marginTop: "32px",
  },
  myTasksItemHeader: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  index: {
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    lineHeight: "15px",
    letterSpacing: "0.1em",
    marginRight: "12px",
    flexShrink: 0,
  },
  quote: {
    marginTop: "4px",
    backgroundColor: "#D6E4EC",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
  },
  rightColumn: { marginLeft: "0px", flexShrink: 0, marginTop: "24px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    markAll: {
      marginLeft: "24px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      color: "white",
      fontSize: "12px",
      marginTop: 0,
    },
    mobileHeading: { display: "flex", alignItems: "center" },
    rightColumn: { marginLeft: "24px", flexShrink: 0, marginTop: "0px" },
    container: {
      maxWidth: "1050px",
      margin: "auto",
      padding: "0 88px 88px 88px",
      marginTop: "32px",
      color: "#0B0F3B",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "nowrap",
    },
  },
});

export default function MyTasksView({ match }) {
  const [loading, setLoading] = useState(false);
  const [myTasksLoading, setMyTasksLoading] = useState(false);
  const [myTasksItems, setMyTasksItems] = useState(null);

  const [showWorkingOnTasks, setShowWorkingOnTasks] = useState(true);
  const [showPendingClaimsTasks, setShowPendingClaimsTasks] = useState(true);
  const [showPendingBidsTasks, setShowPendingBidsTasks] = useState(true);
  const [showClaimsToProcessTasks, setShowClaimsToProcessTasks] = useState(true);
  const [showBidsToProcessTasks, setShowBidsToProcessTasks] = useState(true);
  const [showManagingTasks, setShowManagingTasks] = useState(true);
  const [showTasksToPay, setShowTasksToPay] = useState(true);

  const [task, setTask] = useState(null);
  const [completionID, setCompletionID] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCompleteJobModal, setShowCompleteJobModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJobReviewModal, setShowJobReviewModal] = useState(false);

  const [notifications, setNotifications] = useState(null);
  const [showPendingConcepts, setShowPendingConcepts] = useState(false);
  const [showPendingContributorModify, setShowPendingContributorModify] =
    useState(false);
  const [
    showPendingContributorCompletion,
    setShowPendingContributorCompletion,
  ] = useState(false);
  const [showPendingAdminApproval, setShowPendingAdminApproval] =
    useState(false);

  const history = useHistory();

  const styles = useStyles();

  function isAllEmpty() {
    return (
      Object.keys(myTasksItems).every(function (key) {
        return myTasksItems[key].length === 0;
      }) === true
    );
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setMyTasksLoading(true);
        const myTasks = await fetchMyTasks();

        setMyTasksItems(myTasks);
        setMyTasksLoading(false);
        console.log(myTasks);
      } catch (error) {
        console.log("Error in My Tasks ===>", error);
      }
    }
    fetchData();
  }, []);

  function renderDropdown({
    setShowTaskItems,
    showTaskItems,
    taskItems,
    headline,
  }) {
    return (
      <div className={styles.myTasksItemContainer}>
        <div
          className={styles.myTasksItemHeader}
          onClick={() => setShowTaskItems(!showTaskItems)}
        >
          <div>{headline}</div>
          <img
            src={caretDown}
            alt="dropdown"
            style={{
              marginLeft: "6px",
              transition: "all 0.2s",
              transform: showTaskItems ? "rotate(-180deg)" : "rotate(0deg)",
            }}
          />
        </div>
        {showTaskItems && (
          <div>
            {taskItems.map((item, i) => (
              <div
                style={{
                  marginTop: "24px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "normal",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setTask(item);
                  setShowDetailsModal(true);
                }}
              >
                <div className={styles.index}>{i + 1}</div>
                <div
                  style={{ textDecoration: "underline" }}
                  dangerouslySetInnerHTML={{
                    __html: item.description,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showDetailsModal && (
        <TaskDetailsView
          task={task}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onReview={() => {
            setShowDetailsModal(false);
            setShowReviewModal(true);
          }}
          onComplete={() => {
            setShowDetailsModal(false);
            setShowCompleteModal(true);
          }}
          onJobComplete={() => {
            setShowDetailsModal(false);
            setShowCompleteJobModal(true);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          onJobReview={(e, item) => {
            setCompletionID(item);
            setShowDetailsModal(false);
            setShowJobReviewModal(true);
          }}
        />
      )}
      {showReviewModal && (
        <ReviewTaskView
          task={task}
          open={showReviewModal}
          onClose={(e, data) => {
            setShowReviewModal(false);
            if (data) {
              setTask(data);
            }
          }}
        />
      )}
      {showCompleteModal && (
        <CompleteTaskView
          task={task}
          open={showCompleteModal}
          onClose={(e, data) => {
            setShowCompleteModal(false);
            if (data) {
              setTask(data);
            }
          }}
        />
      )}
      {showCompleteJobModal && (
        <CompleteJobView
          task={task}
          open={showCompleteJobModal}
          onClose={(e, data) => {
            setShowCompleteJobModal(false);
            if (data) {
              setTask(data);
            }
          }}
        />
      )}
      {showEditModal && (
        <EditTaskView
          task={task}
          open={showEditModal}
          onClose={(e, submit, data) => {
            setShowEditModal(false);
            if (submit) {
              setTask(data);
            }
          }}
        />
      )}
      {showJobReviewModal && (
        <ReviewJobView
          task={task}
          completionID={completionID}
          open={showJobReviewModal}
          onClose={(e, data) => {
            setShowJobReviewModal(false);
            if (data) {
              setTask(data);
            }
          }}
        />
      )}
      <MainLayout match={match}>
        <div className={styles.container}>
          <div style={{ width: "100%" }}>
            <div className={styles.header}>MY TASKS</div>
            <div
              style={{ marginTop: "32px", color: "white", fontSize: "18px" }}
            >
              {myTasksLoading || !myTasksItems ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress style={{ color: "white" }} />
                </div>
              ) : // Show "You're all caught up" if every key in myTaskItems is an empty array
              isAllEmpty() ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div>
                    <Lottie
                      options={defaultOptions}
                      height={50}
                      width={50}
                      isClickToPauseDisabled={true}
                    />
                    <div style={{ marginTop: "4px" }}>
                      You're all caught up{" "}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* 1. Tasks you’re working on -> Tasks the user has been assigned but not created a Claim for yet */}
                  {myTasksItems.workingOn?.length > 0 && renderDropdown({
                    setShowTaskItems: setShowWorkingOnTasks,
                    showTaskItems: showWorkingOnTasks,
                    taskItems: myTasksItems.workingOn,
                    headline: "Tasks You're Working On",
                  })}

                  {/* 2. Pending Claims -> Claims the user has made (on Tasks they want to claim) */}
                  {myTasksItems.pendingClaims?.length > 0 && renderDropdown({
                    setShowTaskItems: setShowPendingClaimsTasks,
                    showTaskItems: showPendingClaimsTasks,
                    taskItems: myTasksItems.pendingClaims,
                    headline: "Pending Claims",
                  })}

                  {/* 3. Pending Bids -> Bids the user has made (on Tasks they want to reserve) */}
                  {myTasksItems.pendingBids?.length > 0&& renderDropdown({
                    setShowTaskItems: setShowPendingBidsTasks,
                    showTaskItems: showPendingBidsTasks,
                    taskItems: myTasksItems.pendingBids,
                    headline: "Pending Bids",
                  })}

                  {/* 4. Claims to Process -> Claims on Tasks the user is the Admin owner of (on uncompleted Tasks) */}
                  {myTasksItems.claimsToProcess?.length > 0 && renderDropdown({
                    setShowTaskItems: setShowClaimsToProcessTasks,
                    showTaskItems: showClaimsToProcessTasks,
                    taskItems: myTasksItems.claimsToProcess,
                    headline: "Claims to Process",
                  })}

                  {/* 5. Bids to Process -> Bids on Tasks the user is the Admin owner of */}
                  {myTasksItems.bidsToProcess?.length > 0 && renderDropdown({
                    setShowTaskItems: setShowBidsToProcessTasks,
                    showTaskItems: showBidsToProcessTasks,
                    taskItems: myTasksItems.bidsToProcess,
                    headline: "Bids to Process",
                  })}

                  {/* 6. Tasks you’re managing -> Tasks the Admin user owns that are in progress */}
                  {myTasksItems.managing?.length > 0 && renderDropdown({
                    setShowTaskItems: setShowManagingTasks,
                    showTaskItems: showManagingTasks,
                    taskItems: myTasksItems.managing,
                    headline: "Tasks You're Managing",
                  })}

                  {/* 7. Tasks to pay -> Completed Tasks from all users that are unpaid */}
                  {myTasksItems.tasksToPay?.length > 0 && renderDropdown({
                    setShowTaskItems: setShowTasksToPay,
                    showTaskItems: showTasksToPay,
                    taskItems: myTasksItems.tasksToPay,
                    headline: "Tasks You're Managing",
                  })}
                </div>
              )}
            </div>
          </div>
          <div className={styles.rightColumn}>
            {notifications?.length > 0 && (
              <>
                <div className={cx(styles.header, styles.mobileHeading)}>
                  <div>
                    NOTIFICATIONS{" "}
                    {notifications.filter((notif) => !notif.isRead).length >
                      0 && (
                      <span className={styles.notifBadge}>
                        {notifications.filter((notif) => !notif.isRead).length}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: "32px" }}>
                  {notifications?.map((notification) => (
                    <NotificationItem notification={notification} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
}
