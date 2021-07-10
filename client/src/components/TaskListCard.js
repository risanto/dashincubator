import React, { useState } from "react";
import useGlobalState from "../state";

import dashLogo from "./images/dashLogo.svg";
import commentEmpty from "./images/commentEmpty.svg";
import commentNew from "./images/commentNew.svg";
import checklistIcon from "./images/checklistIcon.svg";
import productIcon from "./images/productIcon.svg";
import qualityIcon from "./images/qualityIcon.svg";

import { getTaskActivity } from "../api/tasksApi";

import moment from "moment";
import { longhandRelative, Breakpoints } from "../utils/utils";
import { useHistory } from "react-router";
import { BountyLocation } from "../Locations";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    color: "#0B0F3B",
    marginBottom: "16px",
  },
  taskTypeText: { marginLeft: "5px", fontSize: "11px", lineHeight: "12px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    taskTypeText: { marginLeft: "8px", fontSize: "11px", lineHeight: "12px" },
    container: {
      padding: "16px",
      backgroundColor: "white",
      borderRadius: "6px",
      marginBottom: "16px",
    },
  },
  upperSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBox: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "3px",
  },
  age: {
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
    lineHeight: "12px",
  },
  description: {
    marginTop: "12px",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "22px",
    wordWrap: "break-word",
  },
  lowerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
  },
  dashPayout: {
    marginLeft: "6px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
  },
  bountyLink: {
    fontSize: "11px",
    textDecoration: "underline",
    fontWeight: 500,
    cursor: "pointer",
    marginLeft: "24px",
  },
});

export default function TaskListCard({ task }) {
  const { loggedInUser } = useGlobalState();
  const styles = useStyles();
  const history = useHistory();

  const [unseenComments, setUnseenComments] = useState(0);

  moment.updateLocale("en", {
    relativeTime: longhandRelative,
  });

  useState(() => {
    function fetchData() {
      getTaskActivity(task._id)
        .then((data) => data.json())
        .then((results) => {
          if (results.length) {
            let unseen = 0;

            for (let i = 0; i < results.length; i++) {
              // if the current logged in user doesn't exist in activity's last view, add to the unseen comments
              if (!results[i].lastView?.[loggedInUser.username]) {
                unseen++;
              }
            }
            setUnseenComments(unseen);
          }
        });
    }
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.upperSection}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            className={styles.iconBox}
            style={{
              backgroundColor:
                task.taskType === "spec"
                  ? "#EF8144"
                  : task.taskType === "production"
                  ? "#4452EF"
                  : task.taskType === "qa"
                  ? "#00B6F0"
                  : "#AD1D73",
            }}
          >
            <img
              src={
                task.taskType === "spec"
                  ? checklistIcon
                  : task.taskType === "production"
                  ? productIcon
                  : task.taskType === "qa"
                  ? qualityIcon
                  : null
              }
              style={{ width: "12px" }}
              alt="icon"
            />
          </div>
          <div className={styles.taskTypeText}>
            {task.taskType === "spec"
              ? "Spec"
              : task.taskType === "production"
              ? "Production"
              : task.taskType === "qa"
              ? "QA"
              : null}
          </div>
        </div>
        <div className={styles.age}>
          <div>Created {moment(task.dateCreated).fromNow()}</div>
        </div>
      </div>

      <div className={styles.description}>{task.description}</div>

      <div className={styles.lowerSection}>
        <div style={{ display: "flex" }}>
          <img src={dashLogo} alt="dash" />
          <div className={styles.dashPayout}>{task.payout} DASH</div>
          <div
            className={styles.bountyLink}
            onClick={() => history.push(BountyLocation(task.bountyDisplayURL))}
          >
            {task.bountyTitle}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                marginRight: "12px",
                cursor: "pointer",
                display: "flex",
              }}
              onClick={() =>
                history.push(BountyLocation(task.bountyDisplayURL))
              }
            >
              <div style={{ marginRight: "6px", fontSize: "11px" }}>
                {unseenComments > 0 && unseenComments}
              </div>
              <img
                alt={"comment"}
                src={unseenComments === 0 ? commentEmpty : commentNew}
                style={{ width: 16 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
