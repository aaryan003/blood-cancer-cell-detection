import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { SignupPage } from "./components/SignupPage";
import { LoginPage } from "./components/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardOverview } from "./components/DashboardOverview";
import { UploadDiagnosis } from "./components/UploadDiagnosis";
import { DiagnosisResults } from "./components/DiagnosisResults";
import { ModelMetrics } from "./components/ModelMetrics";
import { PatientReports } from "./components/PatientReports";
import { AuditLogs } from "./components/AuditLogs";
import { UserProfile } from "./components/UserProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardOverview },
      { path: "upload", Component: UploadDiagnosis },
      { path: "results", Component: DiagnosisResults },
      { path: "metrics", Component: ModelMetrics },
      { path: "reports", Component: PatientReports },
      { path: "audit", Component: AuditLogs },
      { path: "profile", Component: UserProfile },
    ],
  },
]);
