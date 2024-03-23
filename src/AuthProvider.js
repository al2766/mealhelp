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


// In AuthProvider.js

const getErrorMessage = (error) => {
  const firebaseErrors = {
    "auth/email-already-in-use": "This email is already in use.",
    "auth/invalid-credential": "Incorrect Email or Password",
    "auth/user-not-found": "No user found with this email. Please sign up.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later."
    // Add more Firebase error codes as needed
  };

  const customErrors = {
    "Passwords do not match.": "The passwords entered do not match. Please check and try again.",
    "Please fill all the fields.": "All fields are required. Please fill them out and try again."
    // Add more custom validation errors as needed
  };

  // Check for Firebase errors first
  if (firebaseErrors[error]) {
    return firebaseErrors[error];
  }

  // Check for custom validation errors
  if (customErrors[error]) {
    return customErrors[error];
  }

  // Fallback for unhandled errors
  return "An unexpected error occurred. Please try again.";
};


// Adjusted signUp function in AuthProvider.js
const signUp = (email, password, confirmPassword) => {
  return new Promise(async (resolve, reject) => {
    if (!email || !password || !confirmPassword) {
      return reject("Please fill all the fields.");
    }
    if (password !== confirmPassword) {
      return reject("Passwords do not match.");
    }    try {
      await createUserWithEmailAndPassword(auth, email, password);
      resolve("Sign up successful!");
    } catch (error) {
      reject(getErrorMessage(error.code)); // Use getErrorMessage function
    }
  });
};

// Adjusted signIn function
const signIn = (email, password) => {
  return new Promise(async (resolve, reject) => {
    // Your existing validation logic...
    try {
      await signInWithEmailAndPassword(auth, email, password);
      resolve("Sign in successful!");
    } catch (error) {
      reject(getErrorMessage(error.code)); // Use getErrorMessage function
    }
  });
};

// Adjust signOutUser similarly if needed



// Adjust signOutUser to return a promise in a similar way
const signOutUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await signOut(auth);
      resolve("Signed out successfully");
    } catch (error) {
      reject(error.message);
    }
  });
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
