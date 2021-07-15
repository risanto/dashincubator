import React, {useMemo} from "react";
import moment from "moment";
import UserAvatar from "./UserAvatar";
import {longhandRelative, truncate, Breakpoints, getHighlightedText} from "../utils/utils";
import { useHistory } from "react-router";
import { BountyLocation } from "../Locations";
import { createUseStyles } from "react-jss";
import commentNew from "./images/commentNew.svg";
import commentEmpty from "./images/commentEmpty.svg";

const useStyles = createUseStyles({
  container: {
    padding: 8,
    borderRadius: 6,
    color: "#0B0F3B",
    cursor: "pointer",
  },
  bountyTitle: {
    fontWeight: 600,
    fontSize: 14,
    lineHeight: "18px",
  },
  bountyTypeText: {
    marginLeft: 5,
    fontSize: 11,
    lineHeight: "12px"
  },
  bountyTaskStatus: {
    fontSize: 11,
  },
  bountyStatus: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  bountyCreatedAt: {
    fontSize: 11,
    marginLeft: 4,
  },
  bountyAdminsWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontSize: 11,
    lineHeight: "12px",
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    bountyTypeText: {
      marginLeft: 8,
      fontSize: 11,
      lineHeight: "12px"
    },
    container: {
      padding: "16px",
      backgroundColor: "white",
      borderRadius: "6px",
      color: "#0B0F3B",
      cursor: "pointer",
    },
  },
});

export default function BountyCard({ bounty, search }) {
  const styles = useStyles();
  moment.updateLocale("en", {
    relativeTime: longhandRelative,
  });

  const history = useHistory();

  const completedTasks = useMemo(() => {
    return bounty.tasks.filter(task => task.status.toLowerCase() === "completed").length;
  }, [bounty]);

  const unreadComments = useMemo(() => {
    return bounty.comments.filter(comment => !comment.lastViewedAt);
  }, [bounty]);

  return (
    <div
      className={styles.container}
      onClick={() => history.push(BountyLocation(bounty.displayURL))}
    >
      <div className={styles.bountyTitle}>
        {getHighlightedText(bounty.title, search)}
      </div>
      <div className={styles.bountyStatus}>
        <div className={styles.bountyTaskStatus}>{completedTasks}/{bounty.tasks.length} Tasks Completed • </div>
        <img src={unreadComments.length > 0 ? commentNew : commentEmpty } style={{width: 12, marginLeft: 4}} alt="comments-new" />
        <div className={styles.bountyCreatedAt}> • {moment(bounty.approvedDate).format("D, MMM YYYY")}</div>
      </div>
      <div className={styles.bountyAdminsWrapper}>
        {bounty.primaryAdmin && (
          <div
            style={{
              marginLeft: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <UserAvatar
              user={bounty.primaryAdmin}
              size={"18px"}
              fontSize={"8px"}
              lineHeight={"10px"}
            />
            {bounty.secondaryAdmin && (
              <div
                style={{
                  marginLeft: "4px",
                }}
              >
                <UserAvatar
                  user={bounty.secondaryAdmin}
                  size={"18px"}
                  fontSize={"8px"}
                  lineHeight={"10px"}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
