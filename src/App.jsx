import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import BoardPage from "./pages/BoardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationDetailPage from "./pages/ApplicationDetailPage";
import ApplicationNewPage from "./pages/ApplicationNewPage";
import ApplicationEditPage from "./pages/ApplicationEditPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import InsightsPage from "./pages/InsightsPage"
import Shell from "./components/layout/Shell";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/new" element={<ApplicationNewPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/applications/:id/edit" element={<ApplicationEditPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Shell>
  );
}