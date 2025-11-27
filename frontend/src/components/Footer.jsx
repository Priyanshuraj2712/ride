import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { isAuthenticated, auth } = useAuth();

  return (
    <footer style={{
      textAlign: "center",
      padding: "0.75rem 1rem",
      background: "#f5f5f5",
      borderTop: "1px solid #e0e0e0",
      marginTop: 12
    }}>
      <div>© {new Date().getFullYear()} Ridezy</div>
      {isAuthenticated && (
        <div style={{ fontSize: 12, marginTop: 6 }}>Signed in as {auth.user?.name || auth.user?.email} ({auth.user?.role})</div>
      )}
    </footer>
  );
}
