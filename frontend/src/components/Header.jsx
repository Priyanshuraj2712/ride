import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export default function Header() {
  const { isAuthenticated, isDriver, isPassenger, auth, logout } = useAuth();
  const navigate = useNavigate();

  console.log("[Header] Auth State:", { isAuthenticated, isDriver, isPassenger, user: auth.user });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.05rem 0.2rem",
      background: "#faede8",
      color: "#000"
    }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>
        <Link to={isAuthenticated ? (isDriver ? "/driver/dashboard" : "/passenger/dashboard") : "/"} style={{ color: "inherit", textDecoration: "none" }}>
          <img src="../public/logo.png" alt="Ridezy Logo" style={{ height: 100, verticalAlign: "middle", marginRight: 8 }} />
        </Link>
      </div>

      <nav className="Nav-buttons">
        {isAuthenticated ? (
          <>
            {isDriver && (
              <>
                <Link to="/driver/requests" style={{ margin: "0 10px", color: "#3e4749" }}>Requests</Link>
                <Link to="/driver/earnings" style={{ margin: "0 10px", color: "#3e4749" }}>Earnings</Link>
                <Link to="/driver/profile" style={{ margin: "0 10px", color: "#3e4749" }}>Profile</Link>
              </>
            )}

            {isPassenger && (
              <>
                <Link to="/passenger/book" style={{ margin: "0 10px", color: "#3e4749" }}>Book</Link>
                <Link to="/passenger/rides" style={{ margin: "0 10px", color: "#3e4749" }}>My Rides</Link>
                <Link to="/passenger/live" style={{ margin: "0 10px", color: "#3e4749" }}>Live</Link>
              </>
            )}

            <button onClick={handleLogout} style={{ marginLeft: 12, padding: "6px 10px", borderRadius: 4, background: "#3e4749", color: "#fff", border: "none", cursor: "pointer" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ margin: "0 10px", color: "#3e4749" }}>Login</Link>
            <Link to="/register" style={{ margin: "0 10px", color: "#3e4749" }}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
