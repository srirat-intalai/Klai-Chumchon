import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ReportListPage from "./pages/ReportListPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import NewReportPage from "./pages/NewReportPage";
import EditReportPage from "./pages/EditReportPage";
import BookmarksPage from "./pages/BookmarksPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "reports", element: <ReportListPage /> },
      { path: "reports/new", element: <NewReportPage /> },
      { path: "reports/:id", element: <ReportDetailPage /> },
      { path: "reports/:id/edit", element: <EditReportPage /> },
      { path: "bookmarks", element: <BookmarksPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
