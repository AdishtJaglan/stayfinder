/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "stayfinder_user";

// Hardcoded users (for MVP only)
const HARDCODED_USERS = [
  {
    username: "adarsh",
    password: "password123",
    name: "Adarsh",
    email: "adarsh@example.com",
  },
  {
    username: "meera",
    password: "letmein",
    name: "Meera",
    email: "meera@example.com",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load from localStorage on mount
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  function persist(u) {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  }

  // login: checks hardcoded credentials, returns { ok, message }
  function login({ username, password }) {
    return new Promise((resolve) => {
      // simulate network delay for realism
      setTimeout(() => {
        const found = HARDCODED_USERS.find(
          (u) => u.username === username && u.password === password
        );
        if (found) {
          // don't store password on client
          const safeUser = {
            username: found.username,
            name: found.name,
            email: found.email,
          };
          persist(safeUser);
          resolve({ ok: true, user: safeUser });
        } else {
          resolve({ ok: false, message: "Invalid username or password" });
        }
      }, 700); // 700ms "thinking" delay
    });
  }

  function logout() {
    persist(null);
  }

  // allow updating profile (preferences, quiz results etc.)
  function updateProfile(patch = {}) {
    const updated = { ...(user || {}), ...patch };
    persist(updated);
    return updated;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
