import { useState } from "react";

export const useAuth = () => {
  const [token, setToken] = useState(
    sessionStorage.getItem("devnotes_token") || ""
  );

  const login = (token) => {
    sessionStorage.setItem("devnotes_token", token);
    setToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem("devnotes_token");
    setToken("");
  };

  return { token, login, logout };
};