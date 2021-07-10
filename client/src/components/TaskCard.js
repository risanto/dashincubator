import React from "react";
import dashLogo from "./images/dashLogo.svg";
import commentBubble from "./images/commentBubble.svg";
import projectIcon from "../views/ApproveConcept/images/project.svg";
import serviceIcon from "../views/ApproveConcept/images/service.svg";
import jobIcon from "../views/ApproveConcept/images/job.svg";
import ReactDOMServer from "react-dom/server";
import moment from "moment";
import UserAvatar from "./UserAvatar";
import { longhandRelative, truncate, Breakpoints } from "../utils/utils";
import { useHistory } from "react-router";
import { BountyLocation } from "../Locations";
import programmeIcon from "../views/ApproveConcept/images/programme.svg";
import { createUseStyles } from "react-jss";

const getHighlightedText = (text, highlight) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span style={{ backgroundColor: "#eaf194" }}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const useStyles = createUseStyles({
  container: {
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    color: "#0B0F3B",
    // cursor: "pointer",
    marginBottom: "16px",
  },
  bountyTypeText: { marginLeft: "5px", fontSize: "11px", lineHeight: "12px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    bountyTypeText: { marginLeft: "8px", fontSize: "11px", lineHeight: "12px" },
    container: {
      padding: "16px",
      backgroundColor: "white",
      borderRadius: "6px",
      color: "#0B0F3B",
      // cursor: "pointer",
      marginBottom: "16px",
    },
  },
});

export default function TaskCard({ task, search }) {
  search = "";
  // console.log(task);
  const styles = useStyles();
  moment.updateLocale("en", {
    relativeTime: longhandRelative,
  });

  const history = useHistory();
  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "3px",
              //   backgroundColor:
              //     bounty.bountyType === "project"
              //       ? "#EF8144"
              //       : bounty.bountyType === "service"
              //       ? "#4452EF"
              //       : bounty.bountyType === "job"
              //       ? "#00B6F0"
              //       : "#AD1D73",
            }}
          >
            <img
              src={
                projectIcon
                // bounty.bountyType === "project"
                //   ? projectIcon
                //   : bounty.bountyType === "service"
                //   ? serviceIcon
                //   : bounty.bountyType === "job"
                //   ? jobIcon
                //   : programmeIcon
              }
              style={{ width: "12px" }}
              alt="icon"
            />
          </div>
          <div className={styles.bountyTypeText}>
            {task.taskType === "spec"
              ? "Spec"
              : task.taskType === "production"
              ? "Production"
              : task.taskType === "qa"
              ? "QA"
              : null}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "11px",
            lineHeight: "12px",
          }}
        >
          <div>Created {moment(task.dateCreated).fromNow()}</div>
          {/* {bounty.primaryAdmin && (
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
          )} */}
        </div>
      </div>
      <div
        style={{
          marginTop: "8px",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "22px",
          wordWrap: "break-word",
        }}
      >
        {task.description}
        {/* {getHighlightedText(task.description, search)} */}
      </div>
      {/* <div
        style={{ fontSize: "12px", lineHeight: "18px", marginTop: "8px" }}
        dangerouslySetInnerHTML={{
          __html: highlightedValueProposition,
        }}
      ></div> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            textDecoration: "underline",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          View Bounty
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flexg",
              alignItems: "center",
            }}
          >
            <div style={{ marginRight: "12px" }}>
              <img src={commentBubble} alt="comments" />
            </div>
            <img src={dashLogo} alt="dash" />
            <div
              style={{
                marginLeft: "10px",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "15px",
              }}
            >
              {task.payout} DASH
            </div>
          </div>
          {/* <div
            style={{
              backgroundColor: "#E0E0E0",
              borderRadius: "3px",
              padding: "2px 6px",
              fontSize: "10px",
              lineHeight: "12px",
              textTransform: "uppercase",
              marginLeft: "10px",
              fontWeight: 600,
            }}
          >
            {task.payout}
          </div> */}
        </div>
      </div>
    </div>
  );
}
