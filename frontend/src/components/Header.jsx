import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isAuthenticated, isDriver, isPassenger, auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.6rem 1rem",
      background: "#0b67a3",
      color: "#fff"
    }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>
        <Link to={isAuthenticated ? (isDriver ? "/driver/dashboard" : "/passenger/dashboard") : "/"} style={{ color: "inherit", textDecoration: "none" }}>
          Ridezy
        </Link>
      </div>

      <nav>
        {isAuthenticated ? (
          <>
            {isDriver && (
              <>
                <Link to="/driver/requests" style={{ margin: "0 10px", color: "#fff" }}>Requests</Link>
                <Link to="/driver/earnings" style={{ margin: "0 10px", color: "#fff" }}>Earnings</Link>
                <Link to="/driver/profile" style={{ margin: "0 10px", color: "#fff" }}>Profile</Link>
              </>
            )}

            {isPassenger && (
              <>
                <Link to="/passenger/book" style={{ margin: "0 10px", color: "#fff" }}>Book</Link>
                <Link to="/passenger/rides" style={{ margin: "0 10px", color: "#fff" }}>My Rides</Link>
                <Link to="/passenger/live" style={{ margin: "0 10px", color: "#fff" }}>Live</Link>
              </>
            )}

            <button onClick={handleLogout} style={{ marginLeft: 12, padding: "6px 10px", borderRadius: 4 }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ margin: "0 10px", color: "#fff" }}>Login</Link>
            <Link to="/register" style={{ margin: "0 10px", color: "#fff" }}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
