// AuthProvider.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase'; // Import from your firebase.js file
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// At the top of your AuthProvider.js
import { onAuthStateChanged } from "firebase/auth";


// Create a context for the auth state
export const AuthContext = createContext();

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [justSignedUp, setJustSignedUp] = useState(false); // Track if user just signed up


  // Function to sign up a new user
  const signUp = async (email, password, confirmPassword) => {
  
    if (!email || !password || !confirmPassword) {
      setAuthError("Please fill all the fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
  
    try {
       await createUserWithEmailAndPassword(auth, email, password);
      // Update state or UI as needed

      setIsLoading(false);
      setAuthError("");
      setJustSignedUp(true); // Set justSignedUp to true after successful sign-up

    } catch (error) {
      console.log(error.message);
      setAuthError(error.message);
      setIsLoading(false);
    }
  };

  // Function to sign in a user
  const signIn = async (email, password) => {

    if (!email || !password) {
      setAuthError("Please provide both email and password.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update state or UI as needed

      setIsLoading(false);
      setAuthError("");
    } catch (error) {
      setAuthError(error.message);
      setIsLoading(false);
    }
  
  };

  const signOutUser = async () => {
    try {
      await signOut(auth); // Use the signOut function from Firebase Auth and pass the auth instance
      setAuthError(""); // Optionally reset the auth error state
    } catch (error) {
      console.error("Sign out error:", error);
      setAuthError(error.message); // Optionally update the auth error state with the sign-out error message
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Unsubscribe from the listener when unmounting
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoading,
    authError,
    signUp,
    signIn,
    signOutUser,
    justSignedUp
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
