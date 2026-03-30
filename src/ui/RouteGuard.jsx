import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/useAuth";

export function RouteGuard({ children }) {
  const location = useLocation();
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return (
      <div className="loading-shell">
        <div className="spinner" />
        <p>Restoring your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
