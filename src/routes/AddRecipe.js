import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid
import Modal from '../components/Modal'; // Adjust the import path according to your file structure
import LoadingSpinner from '../components/LoadingSpinner'; // Adjust the import path according to your file structure
import { toast } from 'react-toastify';
import { MdDelete } from 'react-icons/md';
import { supabase } from "../supabaseClient";
import { useAuth } from '../AuthProvider'; // Import the hook
import { db } from '../firebase'; // Adjust the import path as needed
import { collection, getDoc, getDocs, query, where, addDoc, doc, setDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";






export default function AddRecipe() {
  
  const { currentUser, signUp, signIn, signOutUser, authError, justSignedUp, setJustSignedUp } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);

  const [removingIndex, setRemovingIndex] = useState(null);

  const [masterIngredients, setMasterIngredients] = useState([]);
  const fileInputRef = useRef(null);

  const [instructions, setInstructions] = useState([""]);
  const [imageFile, setImageFile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userListener, setUserListener] = useState(null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [ingredientNameSelected, setIngredientNameSelected] = useState(
    ingredients.map(() => false)
  );  const [emailVerified, setEmailVerified] = useState(false);
  const [showPhoneSignup, setShowPhoneSignup] = useState(false);
  const [showMagicLinkSignin, setShowMagicLinkSignin] = useState(false);
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isIngredientSelected, setisIngredientSelected] = useState(true); // New state for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New state for success modal
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [addingNewIngredient, setAddingNewIngredient] = useState(false);
  const [uniqueIngredients, setUniqueIngredients] = useState([]);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startFadeOut, setStartFadeOut] = useState(false);

  const [showNewIngredientModal, setShowNewIngredientModal] = useState(false);
  const [newIngredientDetails, setNewIngredientDetails] = useState({
    name: '',
    nutrient_info: {
      fat: '',
      carbs: '',
      protein: '',
      calories: '',
    },
    conversion_info: {
      cup_to_g: '',
      each_to_g: '',
      tbsp_to_g: '',
    },
  });
  

  

  useEffect(() => {
    if (justSignedUp) {
      setShowEmailVerificationMessage(true); // Show verification message if user just signed up
      setTimeout(() => {
        setShowEmailVerificationMessage(false); // Hide verification message after a delay
        setJustSignedUp(false); // Reset justSignedUp state
      }, 3000); // Adjust the delay as needed
    }
  }, [justSignedUp, setJustSignedUp]);

  const handleSignUp = async () => {

  
    setIsLoading(true);
    try {
      await signUp(email, password, confirmPassword);
       setShowEmailVerificationMessage(true);
      setTimeout(() => {
         setIsSignedIn(true);
         setShowEmailVerificationMessage(false);
       }, 3000);
      setIsLoading(false);
    
    } catch (error) {

      setIsLoading(false);
    }
    
  };
  
  const handleSignIn = async () => {
   
  
    setIsLoading(true);
    try {
      await signIn(email, password);
      setIsLoading(false);

    } catch (error) {
      console.error("Firebase sign in error:", error);
     
    }
  };
  
  const handleSignOut = async () => {
    setIsLoading(true); // Optional: Set a loading state
  
    try {
      await signOutUser(); // Call signOutUser without passing the auth object
      // Update application state or UI as needed
      setIsSignedIn(false);
      setEmail(""); // Clear email state
      setPassword(""); // Clear password state
      setConfirmPassword(""); // Clear password state

      console.log("User signed out successfully");
    } catch (error) {
      // Handle errors (if any)
     
    }
  
    setIsLoading(false); // Optional: Clear loading state
  };
  

  const renderEmailVerificationMessage = () => {
    if (showEmailVerificationMessage) {
      return (
        <div className={`${
          startFadeOut ? "animate-fade-out" : "animate-fade-in"
        } fixed inset-0 bg-[#58acbb] bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center`}>
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign up Successful</h2>
            <p className="text-gray-600">Signing you in now...</p>
            <div className="flex justify-end mt-4">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
  
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Function to close the New Ingredient Modal
const closeNewIngredientModal = () => setShowNewIngredientModal(false);

// Function to close the Ingredient Selection Modal
const closeIngredientModal = () => setShowIngredientModal(false);


  // Modify the click handler for closing the modal
  const handleCloseModal = () => {
    setStartFadeOut(true);
    setTimeout(() => {
      setShowIngredientModal(false);
      setStartFadeOut(false); // Reset fade-out state
    }, 350); // duration of the fade-out animation
  };

  const PUBLIC_USER_ID = 'cJdHi6LhyAdlCnUpMlJ0u2KiDJF2'; // Replace with the actual ID of the owner account used for public recipes


  const fetchIngredientsMaster = async () => {
    // Reference to the ingredients_master collection
    const ingredientsMasterRef = collection(db, 'ingredients_master');
  
    let queryConstraints = [];
  
    // Check if there is a logged-in user and if they are not the owner
    if (currentUser && currentUser.uid !== PUBLIC_USER_ID) {
      // Fetch ingredients that are either public or belong to the current user
      queryConstraints = [
        where("user_id", "in", [PUBLIC_USER_ID, currentUser.uid])
      ];
    } else if (!currentUser || currentUser.uid === PUBLIC_USER_ID) {
      // If not logged in or if it is the owner account, fetch only public ingredients
      queryConstraints = [where("user_id", "==", PUBLIC_USER_ID)];
    }
  
    try {
      // Apply the query constraints
      const q = query(ingredientsMasterRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
    
      // Map through documents and format them into an array of ingredients
      const ingredientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    
      // Update your state with the fetched ingredients
      setMasterIngredients(ingredientsList);
    } catch (error) {
      console.error("Error fetching ingredients from Firestore:", error.message);
    }
  };
  
  

  useEffect(() => {
    fetchIngredientsMaster();
  }, [currentUser?.uid]); // React to changes in currentUser.uid
  
  
  

  // ... existing functions

 const resetForm = () => {
  setTitle("");
  setIngredients([{ name: "", quantity: "", unit: "" }]);
  setInstructions([{ text: "" }]);
  setImageFile(null);
  setImagePreview(null); // Also clear the image preview state
  if (fileInputRef.current) {
    fileInputRef.current.value = ""; // Clear the file input visually
  }
};


  const uploadImage = async (imageFile) => {
    if (!imageFile) {
        console.error("No image file provided");
        return null;
    }

    // Ensure that there's a current user with a UID before proceeding
    if (!currentUser || !currentUser.uid) {
        console.error("No current user or user ID unavailable");
        return null;
    }

    const storage = getStorage();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${currentUser.uid}/${uuidv4()}.${fileExtension}`;
    const filePath = `recipeImages/${fileName}`;
    const fileRef = storageRef(storage, filePath);

    try {
        // Upload the file
        await uploadBytes(fileRef, imageFile);

        // Get the URL of the uploaded file
        const url = await getDownloadURL(fileRef);

        // Return the URL of the file
        return url;
    } catch (error) {
        console.error("Error uploading image to storage:", error);
        return null;
    }
};




  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleIngredientChange = (index, e) => {
    const newIngredients = ingredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [e.target.name]: e.target.value };
      }
      return ingredient;
    });
    setIngredients(newIngredients);
  };

  const addIngredientInput = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
    setisIngredientSelected(false);
  };

  const removeIngredientInput = (index) => {
    // Apply fade-out animation
    const ingredientElement = document.getElementById(`ingredient-input-${index}`);
    if (ingredientElement) {
      ingredientElement.style.animation = 'fadeOut 0.5s ease-out forwards';
  
      // Remove the ingredient from state after animation completes
      setTimeout(() => {
        setIngredients(currentIngredients =>
          currentIngredients.filter((_, i) => i !== index)
        );
      }, 500); // Animation duration
    }
  };
  
  
  const removeInstructionInput = (index) => {
    // Apply fade-out animation
    const instructionElement = document.getElementById(`instruction-input-${index}`);
    if (instructionElement) {
      instructionElement.style.animation = 'fadeOut 0.5s ease-out forwards';
      
      // Remove the instruction from state after animation completes
      setTimeout(() => {
        setInstructions(currentInstructions =>
          currentInstructions.filter((_, i) => i !== index)
        );
      }, 500); // Match this with the CSS animation duration
    }
  };
  
  const handleInstructionChange = (index, e) => {
    const newInstructions = instructions.map((instruction, i) => {
      if (i === index) {
        return e.target.value;
      }
      return instruction;
    });
    setInstructions(newInstructions);
  };

  const addInstructionInput = () => {
    setInstructions([...instructions, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if all ingredients have a name selected
    const allIngredientsFilled = ingredients.every((ingredient) => ingredient.name !== "");
  
    if (!allIngredientsFilled) {
      toast.error("Please fill in all the ingredient names.");
      return; // Prevent form submission if validation fails
    }
  
    // Check if at least one ingredient has a name selected
    const IngredientSelected = ingredients.some((ingredient) => ingredient.name !== "");
  
    if (!IngredientSelected) {
      toast.error("Please select at least one ingredient.");
      return; // Prevent form submission if validation fails
    }
  
    const formattedInstructions = instructions.map((instr, index) => ({
      stepNumber: index + 1,
      text: instr,
    }));

    setIsLoading(true);
    toast.promise(
      async () => {
          let imageUrl = null;
          // If there's an image file, upload it and get the URL
          if (imageFile) {
              imageUrl = await uploadImage(imageFile);
          }

          // Ensure you handle the null case if the image wasn't uploaded
          if (imageFile && !imageUrl) {
              throw new Error("Failed to upload image.");
          }
    
        const userId = currentUser?.uid; // Get UID from the authenticated user
        if (!userId) throw new Error("No user logged in");
    
        // This function adds the recipe to Firestore and needs to be defined
        await addRecipeToFirestore(title, ingredients, formattedInstructions, imageUrl, userId);
      },
      {
        pending: 'Adding recipe...',
        success: 'Recipe added successfully!',
        error: 'Error adding recipe.'
      }
    ).then(() => {
      // Reset form and state variables upon successful recipe addition
      resetForm(); // Implement this function to reset your form fields
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error adding recipe:", error);
      setIsLoading(false);
    });
    
  };
  const sanitizeTitleForId = (title) => {
    return title.replace(/\s+/g, '_').toLowerCase();
  };
  
  

  const addRecipeToFirestore = async (title, ingredients, formattedInstructions, imageUrl, userId) => {

    const sanitizedTitle = sanitizeTitleForId(title);

    try {
      const recipeDocRef = doc(db, "recipes", sanitizedTitle); // Use sanitizedTitle as document ID
      await setDoc(recipeDocRef, {

      title: title,
        ingredients: ingredients,
        instructions: formattedInstructions,
        image_url: imageUrl,
        user_id: userId
      });
      console.log("Document written with ID: ", sanitizedTitle);
      return sanitizedTitle; // This will return the new document's ID
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    fetchIngredientsMaster(); // Initial fetch when component mounts
  }, []); // Empty dependency array ensures this runs only once at mount

  const handleAddIngredient = async () => {
    if (currentUser) {
      const ingredientNameCapitalized = newIngredientDetails.name.replace(/\b\w/g, c => c.toUpperCase());
  
      // Define the Firestore collection where you want to add the new ingredient
      const ingredientDocRef = doc(db, "ingredients_master", ingredientNameCapitalized); // Directly referencing the document by name
  
      // Wrap the async operation with toast.promise
      toast.promise(
        (async () => {
          const docSnap = await getDoc(ingredientDocRef);
          if (docSnap.exists()) {
            throw new Error("Ingredient already exists."); // Use throw to trigger the toast.error
          }
  
          let conversionInfo = { ...newIngredientDetails.conversion_info };
          if (!conversionInfo.each_to_g || conversionInfo.each_to_g === '') {
            delete conversionInfo.each_to_g; // Remove 'each_to_g' if it's empty or not provided
          }
  
          const newIngredientData = {
            name: ingredientNameCapitalized,
            nutrient_info: newIngredientDetails.nutrient_info,
            conversion_info: conversionInfo,
            user_id: currentUser.uid, // Use the current user's UID
          };
  
          // Set the new ingredient document with a specific ID (name)
          await setDoc(ingredientDocRef, newIngredientData);
        })(),
        {
          pending: 'Adding new ingredient...',
          success: 'Ingredient added successfully!',
          error: {
            render: ({data}) => {
              // Check if it's the custom error for duplicate ingredient
              if (data.message === "Ingredient already exists.") {
                return data.message;
              }
              // Fallback for other errors
              return "Failed to add ingredient.";
            }
          }
        }
      ).then(() => {
        // Optionally, reset the form fields and close the modal here
        setNewIngredientDetails({
          name: '',
          nutrient_info: {
            fat: '',
            carbs: '',
            protein: '',
            calories: '',
          },
          conversion_info: {
            cup_to_g: '',
            each_to_g: '',
            tbsp_to_g: '',
          },
        });
        setShowNewIngredientModal(false); // Close the modal
        fetchIngredientsMaster(); // Refresh the ingredient list to include the newly added ingredient

      }).catch((error) => {
        console.error("Error adding new ingredient:", error);
      });
    } else {
      toast.error("You must be logged in to add ingredients.");
    }
  };
  
  
  
  

  
  
  const handleIngredientSelection = (ingredientName) => {
    // Find the ingredient info from masterIngredients
    const selectedIngredientInfo = masterIngredients.find(ingredient => ingredient.name === ingredientName);
  
    // Update the ingredients state
    setIngredients(currentIngredients => 
      currentIngredients.map((ingredient, idx) => {
        if (idx === currentIngredientIndex) {
          // Determine available units
          let availableUnits = ['g', 'cups', 'tbsp'];
          if (selectedIngredientInfo.conversion_info?.each_to_g) {
            availableUnits.push('pieces'); // Add 'pieces' if applicable
          }
  
          return {
            ...ingredient,
            name: ingredientName,
            // Ensure existing unit is valid; if not, reset it
            unit: availableUnits.includes(ingredient.unit) ? ingredient.unit : '',
            availableUnits // Store available units for this ingredient
          };
        }
        return ingredient;
      })
    );
  
    // Close the modal after selection
    setShowIngredientModal(false);
  };
  
  
 // Update handleImageChange to set both newImageFile and editImage (for preview)
const handleImageChange = (event) => {
  if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file); // Set the file for uploading
      setImagePreview(URL.createObjectURL(file)); // Set the preview URL
  }
};
  
  const adjustHeight = (e) => {
    e.target.style.height = "inherit"; // Reset height to recalculate
    e.target.style.height = `${e.target.scrollHeight}px`; // Set new height based on content
  };
 
  // JSX
  return (
    <div className="w-full bg-gray-100">
      <div className="max-w-max mx-auto pt-[7rem] p-7">
        {!currentUser ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              Log In/Sign Up and Add Recipe
            </h2>

            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
              <div className="mb-4">
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
                  id="password"
                  type="password"
                  placeholder="******************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {isSigningUp && (
  <div className="mb-6">
    <label
      className="block text-grey-darker text-sm font-bold mb-2"
      htmlFor="confirmPassword"
    >
      Confirm Password
    </label>
    <input
      className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
      id="confirmPassword"
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />
  </div>
)}
              <div className="flex gap-2 items-center justify-between">
                <button
                  className="bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
                  type="button"
                  onClick={isSigningUp ? handleSignUp : handleSignIn}
                >
                  {isSigningUp ? "Sign Up" : "Sign In"}
                </button>
                <button
                  className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker"
                  type="button"
                  onClick={() => setIsSigningUp(!isSigningUp)}
                >
                  {isSigningUp
                    ? "Already have an account? Log In"
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
            {authError && (
              <p className="text-red-500 text-xs italic">{authError}</p>
            )}
{/* 
<button
            className="bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-gray-600 font-bold py-2 px-4 rounded"
            onClick={handleSignInWithMagicLink}
          >
            Sign In with Magic Link
          </button> */}
          {/* ... remaining form elements */}
          {renderEmailVerificationMessage()}
        
              {renderEmailVerificationMessage()}
              



              
          </div>
        ) : (

          
          <div className=" rounded-lg">
<div className="flex justify-between items-center border-b-2 py-4">
  <button
    type="button"
    onClick={() => setShowNewIngredientModal(true)}
    className="bg-[#58acbb] text-white px-4 py-2 rounded transition duration-300 hover:bg-[#3e7983] transition duration-300"
  >
    Add New Ingredient
  </button>
  
  <button
    type="button"
    onClick={handleSignOut}
    className="bg-red-500 text-white px-4 py-2 rounded transition duration-300 hover:bg-red-700 transition duration-300"
  >
    Sign Out
  </button>
</div>
<h1 className="text-3xl text-center my-10 text-gray-600">Add Recipe</h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
              <div className="flex flex-col">
                <div className="shadow-md shadow-md bg-white p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    Recipe Title
                  </h3>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Recipe Title"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="text-gray-600 shadow-md bg-white p-4 mb-8 rounded-lg">
  <h3 className="text-xl font-semibold">Recipe Image</h3>
  <span className="text-sm">(leave blank for default image)</span>
  <div
    className="mt-4 w-[250px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
    onClick={() => fileInputRef.current && fileInputRef.current.click()}
  >
    {imagePreview ? (
      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
    ) : (
      <div className="text-center">
        <p className="text-gray-400">Click to upload image</p>
      </div>
    )}
  </div>
  <input
    id="imageUpload"
    type="file"
    onChange={handleImageChange}
    accept="image/*"
    ref={fileInputRef}
    className="hidden"
  />
</div>


                <div className="text-gray-600 shadow-md bg-white p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Ingredients</h3>
    
  {ingredients.map((ingredient, index) => (
    <div 
    key={index} id={`ingredient-input-${index}`} 
className={`relative flex md:gap-2 md:flex-row flex-col sm:items-center mb-4 ${index !== 0 ? "animate-fade-in" : "animate-fade-out"}`}>
    

      <input
        type="text"
        value={ingredient.name}
        className="bg-transparent w-[0.1rem] h-[0.1rem] ml-[8rem] mt-9 absolute "
        onChange={() => {}} // No-op function for onChange
        readOnly
        required
      />
  <button
  type="button"
  onClick={() => {
    setCurrentIngredientIndex(index);
    setShowIngredientModal(true);
  }}
  className={`border border-gray-300 sm:w-1/6 sm:flex-grow bg-white px-10 py-2 rounded transition duration-300 hover:bg-gray-200 mb-2 sm:mb-0 ${
    ingredient.name ? "text-gray-600" : "text-gray-400"
  }`}
>
  {ingredient.name || "Choose Ingredient"}
</button>

  <div className="flex flex-1 sm:flex-row sm:ml-2">

      <input
        type="number"
        name="quantity"
        value={ingredient.quantity}
        onChange={(e) => handleIngredientChange(index, e)}
        placeholder="Quantity"
        className="text-gray-600 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
        required
      />
  <select
    name="unit"
    value={ingredient.unit}
    onChange={(e) => handleIngredientChange(index, e)}
    className=" p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
    required
  >
    <option disabled value="">Unit</option>
    {ingredient.availableUnits?.map(unit => (
      <option key={unit} value={unit}>{unit}</option>
    ))}
  </select>

      </div>
      {ingredients.length > 1 && (
      <button
        type="button"
        onClick={() => removeIngredientInput(index)}
        className="flex items-center justify-center bg-gray-400 transition duration-300 hover:bg-gray-700 text-white font-bold p-2 rounded"
        aria-label="Remove ingredient"
      >
          <MdDelete /> Remove

      </button>
  )}
    </div>
  ))}



                  <button
                    type="button"
                    onClick={addIngredientInput}
                    className="mt-2 bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
                  >
                    Next Ingredient
                  </button>
                </div>
  

                <div className="text-gray-600 shadow-md bg-white p-4 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Instructions</h3>
                   {instructions.map((instruction, index) => (
                    <div 
    key={index} 
    id={`instruction-input-${index}`} 
    className={`relative mb-4 ${index !== 0 ? "animate-fade-in" : ""}`}
  >  <label
                        className="block text-grey-darker text-sm font-bold mb-2"
                        htmlFor={`instruction-${index}`}
                      >
                        {`Step ${index + 1}`}
                      </label>
                      <textarea
  id={`instruction-${index}`}
  value={instruction.text}
  onChange={(e) => handleInstructionChange(index, e)}
  onInput={adjustHeight}
  placeholder={`Instruction for step ${index + 1}`}
  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none overflow-hidden"
  required
  rows="2" // Start with at least two lines
  style={{ minHeight: '50px' }} // Ensure there's a minimum height if you want
></textarea>
               {index > 0 && (
      <button
        type="button"
        onClick={() => removeInstructionInput(index)}
        className="flex justify-center items-center gap-3 w-full bg-gray-400 transition duration-300 hover:bg-gray-700 text-white font-bold p-2 rounded"
        aria-label="Remove instruction"
      >
          <MdDelete /> Remove

      </button>
    )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInstructionInput}
                    className="mt-2 bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
                  >
                    Next Instruction
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
              >
                Add Recipe
              </button>
            </form>
            {showNewIngredientModal && (
      <Modal showModal={showNewIngredientModal} setShowModal={setShowNewIngredientModal}>

      <h2 className="text-xl font-semibold mb-4">Add New Ingredient</h2>
      
      {/* Ingredient Name */}
      <input 
        type="text" 
        placeholder="Ingredient Name"
        required
        value={newIngredientDetails.name}
        onChange={(e) => setNewIngredientDetails(prev => ({...prev, name: e.target.value}))}
        className="w-full mb-4"
      />

      {/* Nutrient Info */}
      <h3 className="text-lg font-semibold mb-2">Nutrient Info (per 100g)</h3>
      {Object.keys(newIngredientDetails.nutrient_info).map((key) => (
        <input 
          key={key}
          type="number" 
          placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} (g)`}
          value={newIngredientDetails.nutrient_info[key]}
          onChange={(e) => setNewIngredientDetails(prev => ({
            ...prev, 
            nutrient_info: {...prev.nutrient_info, [key]: e.target.value}
          }))}
          className="w-full mb-2"
        />
      ))}

      {/* Conversion Info */}
      <h3 className="text-lg font-semibold mb-2">Conversion Info</h3>
      {Object.keys(newIngredientDetails.conversion_info).map((key) => {
  let placeholderText = '';
  
  switch (key) {
    case 'cup_to_g':
      placeholderText = 'Grams in 1 cup';
      break;
    case 'tbsp_to_g':
      placeholderText = 'Grams in 1 tbsp';
      break;
    case 'each_to_g':
      placeholderText = 'Grams in 1 piece';
      break;
    default:
      placeholderText = key.replace(/_/g, ' ').toUpperCase();
  }
  
  return (
    <input 
      key={key}
      type="number" 
      placeholder={placeholderText}
      value={newIngredientDetails.conversion_info[key]}
      onChange={(e) => setNewIngredientDetails(prev => ({
        ...prev, 
        conversion_info: {...prev.conversion_info, [key]: e.target.value}
      }))}
      className="w-full mb-2"
    />
  );
})}


      {/* Add Ingredient Button */}
      <div className="flex justify-end mt-4">
        <button 
   
          onClick={handleAddIngredient} 
          className="bg-[#58acbb] text-white px-4 py-2 rounded transition duration-300 hover:bg-[#3e7983]"
        >
          Add Ingredient
        </button>
      </div>
    
    </Modal>

)}


{showIngredientModal && (
  <Modal showModal={showIngredientModal} setShowModal={setShowIngredientModal}>
    <div className="relative max-w-xl mx-auto">
      {/* Modal header */}
      <div className="flex justify-between items-center border-b-2 border-gray-200 mb-4">
        <h3 className="text-xl font-bold text-gray-700 py-2">Choose an ingredient</h3>
       
      </div>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search Ingredients"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
      />

      {/* Ingredients list */}
      <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-64">
        {masterIngredients
          .filter((ingredientObj) =>
            ingredientObj.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((ingredientObj, index) => (
            <button
              key={index}
              onClick={() => handleIngredientSelection(ingredientObj.name)}
              className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 transition duration-300 hover:bg-gray-50 px-3 py-2 rounded shadow-sm text-sm transition duration-150"
            >
              {ingredientObj.name}
            </button>
          ))
        }
      </div>

    
    </div>
  </Modal>
)}




         
          </div>
        )}{" "}
      </div>{" "}
    
    </div>
  );
}
