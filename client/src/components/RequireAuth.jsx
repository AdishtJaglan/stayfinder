// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // show a minimal placeholder while we read localStorage
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse inline-block px-6 py-3 border border-gray-800 rounded">
          Checking auth...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
