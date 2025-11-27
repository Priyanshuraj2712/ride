import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
  });

  // Restore token + user on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setAuth({ token, user: JSON.parse(user) });
    }
  }, []);

  // LOGIN FUNCTION
  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setAuth({ token, user });
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({ token: null, user: null });
  };

  // Utility helpers
  const isAuthenticated = !!auth.token;
  const isDriver = auth.user?.role === "driver";
  const isPassenger = auth.user?.role === "passenger";

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isAuthenticated,
        isDriver,
        isPassenger,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
