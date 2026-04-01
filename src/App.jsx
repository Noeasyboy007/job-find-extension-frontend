import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/useAuth";
import { AppLayout } from "./ui/AppLayout.jsx";
import { RouteGuard } from "./ui/RouteGuard.jsx";
import { DashboardPage } from "./views/DashboardPage.jsx";
import { ForgotPasswordPage } from "./views/ForgotPasswordPage.jsx";
import { JobDetailPage } from "./views/JobDetailPage.jsx";
import { JobsPage } from "./views/JobsPage.jsx";
import { LoginPage } from "./views/LoginPage.jsx";
import { ApplyProfilePage } from "./views/ApplyProfilePage.jsx";
import { ProfilePage } from "./views/ProfilePage.jsx";
import { ResumesPage } from "./views/ResumesPage.jsx";
import { ResetPasswordPage } from "./views/ResetPasswordPage.jsx";
import { SignupPage } from "./views/SignupPage.jsx";
import { VerifyEmailPage } from "./views/VerifyEmailPage.jsx";

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
}

function NotFoundPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <h1>Page not found</h1>
        <p>Use the dashboard menu to continue.</p>
        <a className="button-link" href="/app/dashboard">
          Open Dashboard
        </a>
      </section>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/app/dashboard" replace />}
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            <VerifyEmailPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        path="/app"
        element={
          <RouteGuard>
            <AppLayout />
          </RouteGuard>
        }
      >
        <Route
          path="dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="resumes"
          element={<ResumesPage />}
        />
        <Route
          path="jobs"
          element={<JobsPage />}
        />
        <Route
          path="jobs/:id"
          element={<JobDetailPage />}
        />
        <Route
          path="profile"
          element={<ProfilePage />}
        />
        <Route
          path="apply-profile"
          element={<ApplyProfilePage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default App;
