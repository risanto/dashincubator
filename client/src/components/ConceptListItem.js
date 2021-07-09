import React from "react";
import { createUseStyles } from "react-jss";
import { ConceptLocation } from "../Locations";
import FadeIn from "react-fade-in";
import { useHistory } from "react-router";
import UserAvatar from "./UserAvatar";
import checkboxIcon from "./images/dashLogo.svg";
import commentEmpty from "./images/commentEmpty.svg";
import commentNew from "./images/commentNew.svg";

const useStyles = createUseStyles({
  conceptCardWrapper: {
    cursor: "pointer",
    userSelect: "none",
    backgroundColor: "white",
    padding: "10px",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
  },
  conceptCardIcon: {
    display: "flex",
    alignItems: "center",
    marginRight: 10,
  },
  conceptTitle: {
    width: 150,
    fontWeight: 600,
    fontSize: 14,
    lineHeight: "17px",
    marginRight: 10,
  },
  conceptDescription: {
    flex: 1,
  },
  conceptComments: {
    marginLeft: 10,
    display: "flex",
    alignItems: "center"
  }
});

export default function ConceptListItem({ concept }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <FadeIn>
      <div
        onClick={() => history.push(ConceptLocation(concept.displayURL))}
        className={classes.conceptCardWrapper}
      >
        <div className={classes.conceptCardIcon}>
          <img src={checkboxIcon} alt={"check"} style={{ width: 16, marginRight: 5, }} /> Concept
        </div>
        <div className={classes.conceptTitle}>
          {concept.title}
        </div>
        <div className={classes.conceptDescription} dangerouslySetInnerHTML={{ __html: concept.valueProposition}} />
        <UserAvatar
          user={concept.user}
          size={18}
          fontSize={"8px"}
          lineHeight={"10px"}
        />
        <div className={classes.conceptComments}>
          {concept.comments.length > 0 ? <img src={commentNew} style={{width: 16}} alt="comments-new" /> : <img src={commentEmpty} style={{width: 16}} alt="comments-empty" /> }
        </div>
      </div>
    </FadeIn>
  );
}
