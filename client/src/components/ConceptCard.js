import React from "react";
import { ConceptLocation } from "../Locations";
import FadeIn from "react-fade-in";
import { useHistory } from "react-router";
import UserAvatar from "./UserAvatar";
import moment from "moment";

export default function ConceptCard({ concept }) {
  const history = useHistory();

  return (
    <FadeIn>
      <div
        onClick={() => history.push(ConceptLocation(concept.displayURL))}
        style={{
          cursor: "pointer",
          userSelect: "none",

          padding: "10px 0px",
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "17px",
          }}
        >
          {concept.title}
        </div>
        <div
          style={{ marginTop: "6px", display: "flex", alignItems: "center" }}
        >
          <UserAvatar
            user={concept.user}
            size={18}
            fontSize={"8px"}
            lineHeight={"10px"}
          />
          <div
            style={{
              color: "white",
              fontSize: "10px",
              lineHeight: "12px",
              marginLeft: "8px",
            }}
          >
            {moment(concept.dateCreated).fromNow()}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
