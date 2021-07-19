import React, {useState, useEffect, useCallback} from "react";
import { createUseStyles } from "react-jss";
import MainLayout from "../../layouts/MainLayout";
import Lottie from "react-lottie";
import * as animationData from "../MyTasks/done.json";
import { fetchDashboard, fetchNotifications } from "../../api/global";
import NotificationItem from "../../components/NotificationItem";
import checkedIcon from "../Tasks/images/checked.svg";
import { CircularProgress } from "@material-ui/core";
import { readAllNotifications } from "../../api/notificationsApi";
import caretDown from "../Tasks/images/caretDown.svg";
import { truncate, Breakpoints } from "../../utils/utils";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import {
  BountyLocation,
  ConceptLocation,
  PaymentsLocation, ProfileLocation,
} from "../../Locations";
import useGlobalState from "../../state";
import MyTasksView from "../MyTasks";

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
    flexDirection: "column",
    alignItems: "flex-start",
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
  viewPofile: {
    backgroundColor: "#0B0F3B",
    color: "white",
    borderRadius: "4px",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    userSelect: "none",
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
  dashboardItemContainer: {
    fontSize: "18px",
    fontWeight: 600,
    marginTop: "32px",
  },
  dashboardItemHeader: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  index: {
    backgroundColor: "#E8E8E8",
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
  mainContainer: {
    width: "100%",
    display: "flex",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  leftColumn: {
    width: "30%",
    margin: "0 16px 0 0",
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
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
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px 88px 88px",
      marginTop: "32px",
      color: "#0B0F3B",
    },
  },
});

export default function DashboardView({ match }) {
  const [notifications, setNotifications] = useState(null);
  const [dashboardItems, setDashboardItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showPendingConcepts, setShowPendingConcepts] = useState(false);
  const [showPendingContributorModify, setShowPendingContributorModify] =
    useState(false);
  const [
    showPendingContributorCompletion,
    setShowPendingContributorCompletion,
  ] = useState(false);
  const [showPendingAdminApproval, setShowPendingAdminApproval] =
    useState(false);
  const [showUnpaidTasks, setShowUnpaidTasks] = useState(false);
  const { loggedInUser } = useGlobalState();
  const history = useHistory();

  const styles = useStyles();

  const setAllRead = async () => {
    setLoading(true);
    await readAllNotifications();
    fetchNotifications()
      .then((data) => data.json())
      .then((result) => {
        setNotifications(result);
        setLoading(false);
      });
  };

  useEffect(() => {
    setDashboardLoading(true);
    fetchDashboard()
      .then((data) => data.json())
      .then((result) => {
        setDashboardItems(result);
        setDashboardLoading(false);
      });
    fetchNotifications()
      .then((data) => data.json())
      .then((result) => setNotifications(result));
  }, []);

  const handleViewProfile = useCallback(() => {
    if (loggedInUser) {
      history.push(ProfileLocation(loggedInUser.username));
    }
  }, [loggedInUser, history]);

  return (
    <MainLayout match={match}>
      <div className={styles.container}>
        {
          loggedInUser &&
          <div className={styles.viewPofile} onClick={handleViewProfile}>View Profile</div>
        }
        <div className={styles.mainContainer}>
          <div className={styles.leftColumn}>
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
                  {notifications.filter((notif) => !notif.isRead).length > 0 && (
                    <div
                      className={cx(styles.header, styles.markAll)}
                      onClick={() => !loading && setAllRead()}
                    >
                      {loading ? (
                        <div style={{ marginRight: "12px" }}>
                          <CircularProgress
                            style={{ color: "white" }}
                            size={14}
                          />
                        </div>
                      ) : (
                        <img
                          src={checkedIcon}
                          alt="read"
                          style={{
                            marginRight: "8px",
                            width: "14px",
                            height: "14px",
                          }}
                        />
                      )}
                      Mark all notifications as read
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "32px" }}>
                  {notifications?.map((notification) => (
                    <NotificationItem notification={notification} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className={styles.rightColumn}>
            <MyTasksView match={match} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
