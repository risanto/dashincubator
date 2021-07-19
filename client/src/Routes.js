import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import {
  ConceptsLocation,
  ConceptLocationTemplate,
  RequestNewConceptLocation,
  RootLocation,
  EditConceptLocationTemplate,
  ApproveConceptLocationTemplate,
  BountyLocationTemplate,
  EditBountyLocationTemplate,
  PaymentsLocation,
  ProfileLocationTemplate,
  ActivityLocation,
  MyTasksLocation,
  UserManagementLocation,
  ResetPasswordLocation,
  UpdatePasswordLocation,
  BountiesLocation,
  TasksLocation,
  LoginLocation,
} from "./Locations";
import ScrollToTop from "./utils/ScrollToTop";
import HomeView from "./views/Home";
import LoginView from "./views/Login";
import RequestNewConceptView from "./views/RequestNewConcept";
import ConceptView from "./views/Concept";
import ConceptsView from "./views/Concepts";
import BountyView from "./views/Bounty";
import PaymentsView from "./views/Payments";
import ProfileView from "./views/Profile";
import ActivityView from "./views/Activity";
import MyTasksView from "./views/MyTasks";
import UserManagementView from "./views/UserManagement";
import ResetPasswordView from "./views/ResetPassword";
import UpdatePasswordView from "./views/UpdatePassword";
import BountiesView from "./views/Bounties";
import TasksView from "./views/Tasks";

// function isAuthMatch(withAuth, loggedInUser, token) {
//   if (!withAuth) {
//     return true;
//   }
//   if (token) {
//     return true;
//   }
//   return withAuth && loggedInUser;
// }

const CustomRoute = (props) => {
  const { path, redirect, withAuth, component, ...leftProps } = props;
  // const { loggedInUser } = useGlobalState();

  // const token = getAuthToken();

  // if (!isAuthMatch(withAuth, loggedInUser, token)) {
  //   let to = LoginLocation;
  //   return <Redirect from={path} to={to} {...leftProps} />;
  // }

  if (redirect) {
    return <Redirect from={path} to={redirect} {...leftProps} />;
  }

  //return <Route path={path} component={error.error ? ErrorView : component} />;
  return <Route path={path} component={component} />;
};

const routes = [
  {
    path: RootLocation,
    exact: true,
    withAuth: false,
    component: HomeView,
  },
  { path: LoginLocation, exact: true, component: LoginView },
  {
    path: TasksLocation,
    exact: true,
    withAuth: false,
    component: TasksView,
  },
  {
    path: ConceptsLocation,
    exact: true,
    withAuth: false,
    component: ConceptsView,
  },
  {
    path: BountiesLocation,
    exact: true,
    withAuth: false,
    component: BountiesView,
  },
  {
    path: RequestNewConceptLocation,
    exact: true,
    withAuth: false,
    component: RequestNewConceptView,
  },
  {
    path: PaymentsLocation,
    exact: true,
    withAuth: false,
    component: PaymentsView,
  },
  {
    path: ConceptLocationTemplate,
    exact: true,
    withAuth: false,
    component: ConceptView,
  },
  {
    path: EditConceptLocationTemplate,
    exact: true,
    withAuth: false,
    component: ConceptView,
  },
  {
    path: ProfileLocationTemplate,
    exact: true,
    withAuth: true,
    component: ProfileView,
  },
  {
    path: ApproveConceptLocationTemplate,
    exact: true,
    withAuth: true,
    component: ConceptView,
  },
  {
    path: BountyLocationTemplate,
    exact: true,
    withAuth: true,
    component: BountyView,
  },
  {
    path: EditBountyLocationTemplate,
    exact: true,
    withAuth: true,
    component: BountyView,
  },
  {
    path: ActivityLocation,
    exact: true,
    withAuth: true,
    component: ActivityView,
  },
  {
    path: MyTasksLocation,
    exact: true,
    withAuth: true,
    component: MyTasksView,
  },
  {
    path: UserManagementLocation,
    exact: true,
    withAuth: true,
    component: UserManagementView,
  },
  {
    path: ResetPasswordLocation,
    exact: true,
    withAuth: false,
    component: ResetPasswordView,
  },
  {
    path: UpdatePasswordLocation,
    exact: true,
    withAuth: false,
    component: UpdatePasswordView,
  },
];

export default function Routes() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {routes.map((props) => (
          <CustomRoute key={props.path || "default"} {...props} />
        ))}
      </Switch>
    </>
  );
}
