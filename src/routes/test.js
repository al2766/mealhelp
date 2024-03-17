
const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setAuthError("Please fill all the fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential.user); // For debugging
      
      // Update any relevant state or perform any actions after successful signup
      setIsSignedIn(true);
      setShowEmailVerificationMessage(true);
      setTimeout(() => {
        setIsSignedIn(true);
        setShowEmailVerificationMessage(false);
      }, 3000);
  
      setIsLoading(false);
    } catch (error) {
      console.error("Firebase sign up error:", error);
      setAuthError(error.message);
      setIsLoading(false);
    }
  };
  
  
  const handleSignInWithEmail = async () => {
    if (!email || !password) {
      setAuthError("Email and password cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential.user); // For debugging
  
      setIsSignedIn(true);
      setAuthError("");
  
      setIsLoading(false);
    } catch (error) {
      console.error("Firebase sign in error:", error);
      setAuthError(error.message);
      setIsLoading(false);
    }
  };
  
  
    const handleSignOut = async () => {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      setIsLoading(false);
  
      if (error) {
        setAuthError(error.message);
      } else {
        setIsSignedIn(false);
        setAuthError("");
      }
    };