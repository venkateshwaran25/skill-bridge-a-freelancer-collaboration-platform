import { createContext, useState, useEffect, useContext } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("skillbridge_user");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("skillbridge_token");
    if (!token) {
      setUser(null);
      localStorage.removeItem("skillbridge_user");
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.get("/api/users/me");
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("skillbridge_user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.warn("Auth fetch user network/server error:", error.message);
      // ONLY clear session if server explicitly returned 401 Unauthorized
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("skillbridge_token");
        localStorage.removeItem("skillbridge_user");
        setUser(null);
      }
      // If it's a network issue or server restart, KEEP cached user session!
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("skillbridge_token", token);
    localStorage.setItem("skillbridge_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("skillbridge_token");
    localStorage.removeItem("skillbridge_user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedData };
      localStorage.setItem("skillbridge_user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
