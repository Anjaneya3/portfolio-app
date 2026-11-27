import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, login as loginRequest, logout as logoutRequest } from "../services/api.js";

const AuthContext = createContext(null);

// Tracks whether the owner is signed in. Visitors are never signed in, so they only see read-only content.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .finally(() => setChecked(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginRequest(email, password);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checked, canEdit: Boolean(user), login, logout }),
    [user, checked, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
