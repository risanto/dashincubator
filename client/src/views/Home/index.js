import React from "react";
import useGlobalState from "../../state";
import LoginView from "../Login";
import TasksView from "../Tasks";
import MainLayout from "../../layouts/MainLayout";

const HomeView = ({ match }) => {
  const { loggedInUser } = useGlobalState();

  if (!loggedInUser) {
    return <LoginView match={match} />;
  }

  return <MainLayout match={match}></MainLayout>;
};

export default HomeView;
