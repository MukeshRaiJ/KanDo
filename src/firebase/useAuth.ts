// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/firebase/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState((prev) => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, error: null }));
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to sign in with Google",
      }));
      console.error("Auth error:", error);
    }
  };

  const logout = async () => {
    try {
      setAuthState((prev) => ({ ...prev, error: null }));
      await signOut(auth);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to sign out",
      }));
      console.error("Sign out error:", error);
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    logout,
  };
}
