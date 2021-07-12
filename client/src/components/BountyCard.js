import React from "react";
import projectIcon from "../views/ApproveConcept/images/project.svg";
import serviceIcon from "../views/ApproveConcept/images/service.svg";
import jobIcon from "../views/ApproveConcept/images/job.svg";
import ReactDOMServer from "react-dom/server";
import moment from "moment";
import UserAvatar from "./UserAvatar";
import {longhandRelative, truncate, Breakpoints, getHighlightedText} from "../utils/utils";
import { useHistory } from "react-router";
import { BountyLocation } from "../Locations";
import programmeIcon from "../views/ApproveConcept/images/programme.svg";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    color: "#0B0F3B",
    cursor: "pointer",
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
      cursor: "pointer",
      marginBottom: "16px",
    },
  },
});

export default function BountyCard({ bounty, search }) {
  const styles = useStyles();
  moment.updateLocale("en", {
    relativeTime: longhandRelative,
  });

  const highlightedValueProposition = ReactDOMServer.renderToStaticMarkup(
    getHighlightedText(
      search &&
        bounty.valueProposition.toUpperCase().includes(search.toUpperCase())
        ? bounty.valueProposition.replace(/<[^>]*>?/gm, "")
        : truncate(bounty.valueProposition, 170).replace(/<[^>]*>?/gm, ""),
      search
    )
  );

  const history = useHistory();
  return (
    <div
      className={styles.container}
      onClick={() => history.push(BountyLocation(bounty.displayURL))}
    >
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
              backgroundColor:
                bounty.bountyType === "project"
                  ? "#EF8144"
                  : bounty.bountyType === "service"
                  ? "#4452EF"
                  : bounty.bountyType === "job"
                  ? "#00B6F0"
                  : "#AD1D73",
            }}
          >
            <img
              src={
                bounty.bountyType === "project"
                  ? projectIcon
                  : bounty.bountyType === "service"
                  ? serviceIcon
                  : bounty.bountyType === "job"
                  ? jobIcon
                  : programmeIcon
              }
              style={{ width: "12px" }}
              alt="icon"
            />
          </div>
          <div className={styles.bountyTypeText}>
            {bounty.bountyType === "project"
              ? "Project"
              : bounty.bountyType === "service"
              ? "Service"
              : bounty.bountyType === "job"
              ? "Job"
              : bounty.bountyType === "programme"
              ? "Programme"
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
          <div>Created {moment(bounty.approvedDate).fromNow()}</div>
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
      <div
        style={{
          marginTop: "8px",
          fontWeight: 600,
          fontSize: "18px",
          lineHeight: "22px",
        }}
      >
        {getHighlightedText(bounty.title, search)}
      </div>
      <div
        style={{ fontSize: "12px", lineHeight: "18px", marginTop: "8px" }}
        dangerouslySetInnerHTML={{
          __html: highlightedValueProposition,
        }}
      ></div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div />
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "10px" }}
        >
          <div
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
            {bounty.status}
          </div>
        </div>
      </div>
    </div>
  );
}
