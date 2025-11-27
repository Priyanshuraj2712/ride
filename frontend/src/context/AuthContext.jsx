import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);  // ⭐ IMPORTANT

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setAuth({ token, user: JSON.parse(user) });
    }

    setLoading(false);  // ⭐ done restoring
  }, []);

  const login = (token, user) => {
  setAuth(null); // force rerender first

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  // force state update AFTER localStorage write
  setAuth({
    token,
    user,
  });
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  // Compute these values based on current auth state
  const isAuthenticated = !!auth.token;
  const isDriver = auth.user?.role === "driver";
  const isPassenger = auth.user?.role === "passenger";

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, isAuthenticated, isDriver, isPassenger }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
