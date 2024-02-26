import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { signUpNewUser, signInWithEmail, signInWithMagicLink, signOut } from "../supabaseAuth";
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid

export default function AddRecipe() {
  const [masterIngredients, setMasterIngredients] = useState([]);

  const [instructions, setInstructions] = useState([""]);
  const [imageFile, setImageFile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState("");
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


  const renderEmailVerificationMessage = () => {
    if (showEmailVerificationMessage) {
      return (
        <div className={`${
          startFadeOut ? "animate-fade-out" : "animate-fade-in"
        } fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center`}>
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


  // Modify the click handler for closing the modal
  const handleCloseModal = () => {
    setStartFadeOut(true);
    setTimeout(() => {
      setShowIngredientModal(false);
      setStartFadeOut(false); // Reset fade-out state
    }, 350); // duration of the fade-out animation
  };

  const fetchIngredientsMaster = async () => {
    try {
      let { data, error } = await supabase
        .from('ingredients_master')
        .select('*');
    
      if (error) throw error;
  
      console.log('Master ingredients fetched: ', data); // Log the fetched data
      setMasterIngredients(data);
    } catch (error) {
      console.error("Error fetching master ingredients:", error.message);
    }
  };
  
  useEffect(() => {
    fetchIngredientsMaster();
  }, []);
  
  

  // ... existing functions

  const resetForm = () => {
    setTitle("");
    setIngredients([{ name: "", quantity: "", unit: "" }]);
    setInstructions([""]);
    setImageFile(null);
    // After successful submission
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    setImageFile(file);
  };
  const uploadImage = async (imageFile) => {
    if (!imageFile) {
      console.error("No image file provided");
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      console.error("No user logged in");
      return null;
    }

    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
    const filePath = `recipeImages/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("recipe-pics")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      // Return only the filePath, not the full URL
      return filePath;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      return null;
    }
  };

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };
    checkSession();
  }, []);

  useEffect(() => {
    const userListener = supabase
      .channel("public:user")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user" },
        (payload) => console.log(payload) // Replace with your handleAllEventsPayload function
      )
      .subscribe();

    setUserListener(userListener);

    return () => {
      supabase.removeChannel(userListener);
    };
  }, []);






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
      let { data: users, error } = await supabase
        .from('users') // Replace with your user table name
        .select('email')
        .eq('email', email);
  
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
  
      if (users.length > 0) {
        setAuthError("An account with this email already exists.");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setAuthError("Error during user check.");
      setIsLoading(false);
      return;
    }
  
    const response = await signUpNewUser(email, password);
    setIsLoading(false);
  
    if (response.error) {
      setAuthError(response.error.message || "An error occurred during sign up.");
    } else if (response.data && response.data.user) {
      setShowEmailVerificationMessage(true);
      setTimeout(() => {
        setIsSignedIn(true);
        setShowEmailVerificationMessage(false);
      }, 3000);
    } else {
      setAuthError("Unexpected error during sign up. Please try again.");
    }
  };
  

  const handleSignInWithEmail = async () => {
    if (!email || !password) {
      setAuthError("Email and password cannot be empty.");
      return;
    }
    setIsLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (user) {

      setIsSignedIn(true);
      setAuthError("");
 
    } else {
      setAuthError(error.message);
    }
  };

  const handleSignInWithMagicLink = async () => {
    if (!email) {
      setAuthError("Email cannot be empty.");
      return;
    }
    setIsLoading(true);
       
    const { error } = await signInWithMagicLink(email); // Ensure you have this function in your auth utilities
    setIsLoading(false);

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError("Check your email for the magic link.");
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
    const allIngredientsFilled = ingredients.every(
      (ingredient) => ingredient.name !== ""
    );

    if (!allIngredientsFilled) {
      setisIngredientSelected(false); // This will trigger the warning for unfilled fields
      return; // Prevent form submission
    }

    // Check if at least one ingredient has a name selected
    const IngredientSelected = ingredients.some(
      (ingredient) => ingredient.name !== ""
    );

    if (!IngredientSelected) {
      setisIngredientSelected(false);
      return;
    }

    const formattedInstructions = instructions
      .map((instr, index) => `Step ${index + 1}: ${instr}`)
      .join("\n");
    let imageUrl = null;

    setIsLoading(true);
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      console.log("Image URL:", imageUrl); // Check if imageUrl is logged correctly
    }

    await addRecipeToSupabase(
      title,
      ingredients,
      formattedInstructions,
      imageUrl
    );
    setIsLoading(false);
  };

  const TickIcon = () => (
    <svg
      className="tick-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const addRecipeToSupabase = async (
    title,
    ingredients,
    instructions,
    imageUrl
  ) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      console.error("No user logged in");
      return;
    }

    const userId = user.id;

    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .insert([
          {
            user_id: userId,
            title,
            ingredients: JSON.stringify(ingredients), // Ensure ingredients are serialized
            instructions,
            image_url: imageUrl, // Pass the image URL here
          },
        ])
        .single();

      if (recipeError) {
        console.error("Error inserting recipe:", recipeError);
        return;
      }

      setShowSuccessModal(true); // Show success modal
      setTimeout(() => {
        setShowSuccessModal(false); // Hide modal after a few seconds
        resetForm(); // Reset form fields
      }, 2000); // Adjust time as needed

      console.log("Recipe added successfully:");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleAddIngredient = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Get the current user
    const user = session?.user;

    // Check if the user is logged in
    if (user) {
      try {
        // Insert the new ingredient into the 'user_ingredients' table
        const { data, error } = await supabase
          .from("user_ingredients")
          .insert([{ user_id: user.id, ingredient_name: newIngredient }]);

        // Check for errors
        if (error) throw error;

        // Update the state
        setUserIngredients([...userIngredients, newIngredient]);
        setNewIngredient("");
        setAddingNewIngredient(false);
      } catch (error) {
        console.error("Error adding new ingredient:", error);
      }
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
  
  

   
 
  // JSX
  return (
    <div className="w-full bg-gray-100">
      <div className="max-w-max mx-auto pt-[7rem] p-7">
        {!isSignedIn ? (
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
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-dark text-white font-bold py-2 px-4 rounded"
                  type="button"
                  onClick={isSigningUp ? handleSignUp : handleSignInWithEmail}
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

<button
            className="bg-blue-500 hover:bg-blue-dark text-white font-bold py-2 px-4 rounded"
            onClick={handleSignInWithMagicLink}
          >
            Sign In with Magic Link
          </button>
          {/* ... remaining form elements */}
          {renderEmailVerificationMessage()}
        
              {renderEmailVerificationMessage()}
              



              
          </div>
        ) : (
          <div className=" rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <div className="shadow-md shadow-md bg-[#58acbb] p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">
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

                <div className="text-white shadow-md bg-[#58acbb] p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold">Recipe Image</h3>
                  <span className="text-sm">
                    (leave blank for default image)
                  </span>
                  <div>
                    <input
                      id="imageUpload"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="text-sm mt-8 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="text-white shadow-md bg-[#58acbb] p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Ingredients</h3>
    
  {ingredients.map((ingredient, index) => (
    <div 
    key={index}   
    className="relative flex flex-col sm:flex-row sm:items-center mb-4"
    >

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
        className="sm:w-1/6 sm:flex-grow bg-white text-black px-10 py-2 rounded hover:bg-gray-200 mb-2 sm:mb-0"
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
        className="text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
        required
      />
  <select
    name="unit"
    value={ingredient.unit}
    onChange={(e) => handleIngredientChange(index, e)}
    className="text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
    required
  >
    <option value="">Unit</option>
    {ingredient.availableUnits?.map(unit => (
      <option key={unit} value={unit}>{unit}</option>
    ))}
  </select>
      </div>
    </div>
  ))}



                  <button
                    type="button"
                    onClick={addIngredientInput}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Next Ingredient
                  </button>
                </div>

                <div className="text-white shadow-md bg-[#58acbb] p-4 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Instructions</h3>
                   {instructions.map((instruction, index) => (
                    <div key={index} className="mb-2">
                      <label
                        className="block text-grey-darker text-sm font-bold mb-2"
                        htmlFor={`instruction-${index}`}
                      >
                        {`Step ${index + 1}`}
                      </label>
                      <input
                        id={`instruction-${index}`}
                        type="text"
                        value={instruction}
                        onChange={(e) => handleInstructionChange(index, e)}
                        placeholder={`Instruction for step ${index + 1}`}
                        className="text-black w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInstructionInput}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Next Instruction
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-dark text-white font-bold py-2 px-4 rounded"
              >
                Add Recipe
              </button>
            </form>
            {showIngredientModal && (
              <div
                className={`${
                  startFadeOut ? "animate-fade-out" : "animate-fade-in"
                } fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50`}
              >
                <div className="relative bg-white p-6 rounded-lg shadow-lg flex flex-col items-center z-50">
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-0 m-0 right-0 rounded-full p-1"
                    title="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 text-black"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                  <h3>Choose an existing ingredient or add it</h3>

                  {/* Add the search input here */}
                  <input
                    type="text"
                    placeholder="Search Ingredients"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-7 border border-gray-300 p-2 rounded w-full mb-5"
                  />

                  <div className="overflow-y-scroll lg:max-h-[20rem] lg:max-w-[40rem] w-[55vw] h-[40vw]">
                    <ul className="grid grid-cols-2 lg:grid-cols-3 text-center list-none p-0">
                    {masterIngredients
  .filter((ingredientObj) =>
    ingredientObj.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .map((ingredientObj, index) => (
    <li key={index} className="text-lg mb-1">
      <button
        onClick={() => handleIngredientSelection(ingredientObj.name)}
        className="bg-white shadow-md text-black px-4 py-2 rounded hover:bg-gray-100"
      >
        {ingredientObj.name}
      </button>
    </li>
  ))}

                    </ul>
                  </div>
                  <button
                    onClick={() => setAddingNewIngredient(true)}
                    className="mt-10 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    required
                  >
                    Add New Ingredient
                  </button>
                  {addingNewIngredient && (
                    <div
                      className={`${
                        startFadeOut ? "animate-fade-out" : "animate-fade-in"
                      } flex align-center justify-center gap-2 mt-4`}
                    >
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder="New ingredient name"
                        className="border border-gray-300 p-2 rounded w-full"
                      />
                      <button
                        onClick={handleAddIngredient}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showSuccessModal && (
              <div
                className={`${
                  startFadeOut ? "animate-fade-out" : "animate-fade-in"
                } fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center`}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <TickIcon />
                  <p className="text-green-600 mt-4">
                    Recipe added successfully!
                  </p>
                </div>
              </div>
            )}
            
            <button
        className="mt-20 w-1/3 bg-red-500 mt-10 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
          </div>
        )}{" "}
      </div>{" "}
    
    </div>
  );
}
