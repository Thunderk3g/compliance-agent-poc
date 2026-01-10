import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  hasOnboarded: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem("firebaseToken", token);

          // Check if user has any projects - if yes, they've onboarded
          try {
            const response = await api.getProjects();
            const projects = response.data?.projects || response.data || [];
            // User has onboarded if they have at least one project
            setHasOnboarded(Array.isArray(projects) && projects.length > 0);
          } catch (error) {
            console.log(
              "Failed to fetch projects, assuming not onboarded",
              error
            );
            setHasOnboarded(false);
          }
        } catch (error) {
          console.error("Error setting up user session:", error);
        }
      } else {
        localStorage.removeItem("firebaseToken");
        setHasOnboarded(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    loading,
    hasOnboarded,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
