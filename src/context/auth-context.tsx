
'use client';

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
    type User 
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useSiteSettings } from '@/hooks/use-site-settings';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, pass: string, name: string) => Promise<User | null>;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<User | null>;
  updateUserProfile: (name: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { state: settings } = useSiteSettings();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, pass: string, name: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      // To get the updated user info, we need to get the user object again
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({ ...currentUser }); // Force a state update with the new profile info
        return currentUser;
      }
      return userCredential.user;
    } catch (error: any) {
      console.error("Signup error:", error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
          throw new Error('This email address is already registered. Please login or use a different email.');
      }
      // Let the UI handle other errors
      throw new Error(error.message || 'An unexpected error occurred during sign up.');
    }
  };

  const login = async (email: string, pass: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error: any) {
      console.error("Login error:", error.message);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          throw new Error('Invalid email or password. Please try again.');
      }
      // Let the UI handle other errors
      throw new Error(error.message || 'An unexpected error occurred during login.');
    }
  };
  
  const loginWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        // This is a common case where the user closes the popup.
        // We don't want to show an error for this.
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Google login popup closed by user.");
            return null;
        }
        console.error("Google login error:", error.message);
        throw new Error(error.message || 'Failed to sign in with Google.');
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUserProfile = async (name: string) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        setUser({ ...auth.currentUser }); // Force refresh of user state
    } else {
        throw new Error("No user is currently signed in.");
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (auth.currentUser) {
        try {
            await updatePassword(auth.currentUser, newPassword);
        } catch (error: any) {
            console.error("Password update error:", error);
             if (error.code === 'auth/requires-recent-login') {
                throw new Error("This action is sensitive and requires recent authentication. Please log out and log back in to change your password.");
            }
            throw new Error(error.message || 'An unexpected error occurred while updating the password.');
        }
    } else {
        throw new Error("No user is currently signed in.");
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Password reset error:", error);
        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found with that email address.');
        }
        throw new Error(error.message || 'Failed to send password reset email.');
    }
  };

  const value = { user, loading, signup, login, logout, loginWithGoogle, updateUserProfile, updateUserPassword, sendPasswordReset };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
