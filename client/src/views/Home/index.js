import React from "react";
import useGlobalState from "../../state";
import LoginView from "../Login";
import DashboardView from "../Dashboard";

const HomeView = ({ match }) => {
  const { loggedInUser } = useGlobalState();

  if (!loggedInUser) {
    return <LoginView match={match} />;
  }

  return <DashboardView match={match} />;
};

export default HomeView;
