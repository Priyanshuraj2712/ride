import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { auth } = useAuth();
  const location = useLocation();

  // Not logged in → go to login
  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but wrong role → redirect to correct dashboard
  if (role && auth.role !== role) {
    return <Navigate to={`/${auth.role}/dashboard`} replace />;
  }

  return children;
}
