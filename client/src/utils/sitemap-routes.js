import React from "react";
import { Route } from "react-router";

export default function BuildRoutes(jobs) {
  return (
    <Route>
      <Route path="/" />
      <Route path="/post" />
      <Route path="/newsletter" />
      {JSON.parse(jobs).map((job) => (
        <Route path={`/job/${job.displayURL}`} />
      ))}
    </Route>
  );
}
