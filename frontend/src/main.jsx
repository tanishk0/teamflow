import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Route } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Workspace from "../pages/Workspace.jsx";
import Invitations from "../pages/Invitations.jsx"
import Teams from "../pages/Teams.jsx";
import WorkspaceDetail from "../pages/WorkspaceDetail.jsx";
import Team from "../pages/Team.jsx";
import WorkspaceSettings from "../pages/WorkspaceSettings.jsx";
import TeamSettings from "../pages/TeamSettings.jsx";
import WorkspaceMembers from "../pages/WorkspaceMembers.jsx";
import WorkspaceActivity from "../pages/WorkspaceActivity.jsx";
import ProjectDetail from "../pages/ProjectDetail.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/workspaces",
    element: <Workspace />,
  },
  {
    path: '/invitations',
    element: <Invitations />
  },
  {
    path: '/teams',
    element: <Teams />
  },
  {
    path: '/workspace/:id',
    element: <WorkspaceDetail />
  },
  {
    path: '/workspace/:id/activity',
    element: <WorkspaceActivity />
  },
  {
    path: '/workspace/:id/members',
    element: <WorkspaceMembers />
  },
  {
    path: '/team/:id', 
    element: <Team />
  },
  {
    path: "/workspace/:id/settings",
    element: <WorkspaceSettings />
  },
  {
    path: "/team/:id/settings",
    element: <TeamSettings />
  },
  {
    path: "/project/:projectId",
    element: <ProjectDetail />,
  },
  {
    path: "/:projectId",
    element: <ProjectDetail />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
