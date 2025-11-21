import React from "react";
import api from "./api.jsx";

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) } catch { return null }
  });

  // try to hydrate user from backend if cookie auth available
  React.useEffect(() => {
    (async () => {
      try {
        // call current-user endpoint which returns user if cookie token is present
        const res = await api.get("/users/current-user");
        const payload = res?.data || res;
        
        // Only set user if payload is a valid object (not an error message string)
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          setUser(payload);
          localStorage.setItem("user", JSON.stringify(payload));
        }
      } catch (e) {
        console.debug("Failed to load current user:", e.message);
        // Clear invalid stored user data
        localStorage.removeItem("user");
      }
    })();
  }, []);

  function login(payload) {
    const p = payload?.data || payload;
    if (p?.accessToken) localStorage.setItem("accessToken", p.accessToken);
    if (p?.refreshToken) localStorage.setItem("refreshToken", p.refreshToken);
    if (p?.user) {
      localStorage.setItem("user", JSON.stringify(p.user));
      setUser(p.user);
    } else if (p?.username) {
      localStorage.setItem("user", JSON.stringify(p));
      setUser(p);
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

// login/register helpers
export async function loginApi({ username, email, password }) {
  const body = username ? { username, password } : { email, password };
  const res = await api.post("/users/login", body);
  return res;
}

export async function registerApi(formData) {
  const res = await api.post("/users/register", formData);
  return res;
}
