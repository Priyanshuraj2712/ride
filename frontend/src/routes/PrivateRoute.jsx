import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { auth, loading } = useAuth();
  const location = useLocation();

  // still restoring state → STOP rendering routes
  if (loading) return null;

  // token exists but user still null → WAIT
  if (auth.token && !auth.user) return null;

  // not logged in
  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // wrong role
  if (role && auth.user.role !== role) {
    return <Navigate to={`/${auth.user.role}/dashboard`} replace />;
  }

  return children;
}
