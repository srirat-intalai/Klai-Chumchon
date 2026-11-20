import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import ReportListPage from "./pages/ReportListPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import NewReportPage from "./pages/NewReportPage";
import EditReportPage from "./pages/EditReportPage";
import MapPage from "./pages/MapPage";
import BookmarksPage from "./pages/BookmarksPage";
import MyReportsPage from "./pages/MyReportsPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "reports", element: <ReportListPage /> },
      { path: "reports/:id", element: <ReportDetailPage /> },
      { path: "map", element: <MapPage /> },
      { path: "bookmarks", element: <BookmarksPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      // ต้องล็อกอิน
      { path: "reports/new", element: <RequireAuth><NewReportPage /></RequireAuth> },
      { path: "reports/:id/edit", element: <RequireAuth><EditReportPage /></RequireAuth> },
      { path: "my-reports", element: <RequireAuth><MyReportsPage /></RequireAuth> },

      // เจ้าหน้าที่/แอดมินเท่านั้น
      { path: "admin", element: <RequireAuth roles={["STAFF", "ADMIN"]}><AdminPage /></RequireAuth> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
