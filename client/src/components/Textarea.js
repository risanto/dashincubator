import React, { useState, useEffect } from "react";
import { MentionsInput, Mention } from "react-mentions";
import { fetchUsersSimple } from "../api/usersApi";

export default function Textarea({ value, onChange, loading }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsersSimple().then((response) =>
      setUsers(
        response.map((user) => {
          user.id = user._id;
          user.display = user.username;
          return user;
        })
      )
    );
  }, []);
  return (
    <MentionsInput
      style={{
        width: "100%",
        minWidth: "140px",
        control: {
          backgroundColor: "#fff",
          fontSize: 12,
          fontWeight: "normal",
          borderRadius: "4px",
        },
        highlighter: {
          overflow: "hidden",
        },
        input: {
          margin: 0,
        },
        "&singleLine": {
          control: {
            display: "inline-block",
            width: 130,
          },
          highlighter: {
            padding: 1,
          },

          input: {
            fontFamily: "inherit",
            fontSize: "12px",
            borderRadius: "4px",
            padding: 1,
          },
        },
        "&multiLine": {
          control: {
            border: "1px solid rgb(118, 118, 118)",
          },
          highlighter: {
            padding: 9,
          },
          input: {
            padding: "8px",
            fontFamily: "inherit",
            lineHeight: "18px",
            borderRadius: "4px",
            fontSize: "12px",
            outline: 0,
            border: 0,

            //maxHeight: 100,
            overflow: "auto",
            position: "absolute",
            bottom: 14,
          },
        },
        suggestions: {
          list: {
            backgroundColor: "rgb(11, 15, 59)",
            color: "white",
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: 10,
          },
          item: {
            padding: "5px 15px",
            borderBottom: "1px solid rgba(0,0,0,0.15)",

            "&focused": {
              backgroundColor: "#008de4",
            },
          },
        },
      }}
      placeholder={"Write a comment"}
      disabled={loading}
      value={value}
      onChange={onChange}
    >
      <Mention
        trigger="@"
        markup={`<b>@__display__</b>`}
        displayTransform={(id, display) => `@${display}`}
        data={users}
        appendSpaceOnAdd
      />
    </MentionsInput>
  );
}
