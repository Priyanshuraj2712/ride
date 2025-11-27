import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { auth } = useAuth();
  const location = useLocation();

  // Not logged in
  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but wrong role
  if (role && auth.user?.role !== role) {
    return <Navigate to={`/${auth.user.role}/dashboard`} replace />;
  }

  return children;
}
