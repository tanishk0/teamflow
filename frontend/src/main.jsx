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
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
