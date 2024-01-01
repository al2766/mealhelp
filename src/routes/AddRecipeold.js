import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { signUpNewUser, signInWithEmail, signOut } from "../supabaseAuth";
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid

export default function AddRecipe() {
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

  const [showSuccessModal, setShowSuccessModal] = useState(false); // New state for success modal
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [addingNewIngredient, setAddingNewIngredient] = useState(false);
  const [uniqueIngredients, setUniqueIngredients] = useState([]);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);

  
  useEffect(() => {
    const fetchUserIngredients = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
  
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_ingredients')
            .select('ingredient_name')
            .eq('user_id', user.id);
  
          if (error) throw error;
  
          const userIngredients = data.map(item => item.ingredient_name);
  
          // Update the state with the fetched user ingredients
          setUserIngredients(userIngredients);
  
          console.log('Fetched ingredients:', userIngredients);
        } catch (error) {
          console.error('Error fetching ingredients:', error);
        }
      }
    };
  
    fetchUserIngredients();
  }, []);
  
  
  
  
  // ... existing functions

  const resetForm = () => {
    setTitle("");
    setIngredients([{ name: "", quantity: "", unit: "" }]);
    setInstructions([""]);
    setImageFile(null);
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
    if (!email || !password) {
      setAuthError("Email and password cannot be empty.");
      return;
    }
    setIsLoading(true);

    const response = await signUpNewUser(email, password);
    setIsLoading(false);

    if (response.error) {
      // If there is an error object, use its message
      setAuthError(
        response.error.message || "An error occurred during sign up."
      );
    } else if (response.data && response.data.user) {
      // Sign-up successful, user automatically logged in
      setIsSignedIn(true);
      // Inform the user to confirm their email
      setAuthError(
        "Sign up successful! Please check your email to confirm your account."
      );
    } else {
      // Handle cases where there's no error and no user (unexpected)
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
    const { error } = await supabase.auth.signInWithOtp({ email });
    setIsLoading(false);

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError("Check your email for the magic link.");
    }
  };

  const handleSignInWithPhone = async () => {
    if (!phone || !password) {
      setAuthError("Phone and password cannot be empty.");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    });
    setIsLoading(false);

    if (error) {
      setAuthError(error.message);
    } else {
      setIsSignedIn(true);
      setAuthError("");
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
    const { data: { session } } = await supabase.auth.getSession();

    // Get the current user
    const user = session?.user;
  
    // Check if the user is logged in
    if (user) {
      try {
        // Insert the new ingredient into the 'user_ingredients' table
        const { data, error } = await supabase
          .from('user_ingredients')
          .insert([{ user_id: user.id, ingredient_name: newIngredient }]);
  
        // Check for errors
        if (error) throw error;
  
        // Update the state
        setUserIngredients([...userIngredients, { ingredient_name: newIngredient }]);
        setNewIngredient('');
        setAddingNewIngredient(false);
      } catch (error) {
        console.error('Error adding new ingredient:', error);
      }
    }
  };
  
  const handleIngredientSelection = (ingredientName) => {
    if (currentIngredientIndex != null) {
      const updatedIngredients = [...ingredients];
      updatedIngredients[currentIngredientIndex] = { 
        ...updatedIngredients[currentIngredientIndex], 
        name: ingredientName 
      };
      setIngredients(updatedIngredients);
    }
    setShowIngredientModal(false);
    setCurrentIngredientIndex(null); // Reset the index
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
          </div>
        ) : (
          <div className=" rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <div className="shadow-md shadow-md bg-[#58acbb] p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">Recipe Title</h3>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Recipe Title"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="text-white shadow-md bg-[#58acbb] p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold">
                    Recipe Image 
                  </h3>
                  <span className="text-sm">(leave blank for default image)</span>
<div>
                  <input
                    id="imageUpload"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="mt-8 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  </div>
                </div>

                <div className="text-white shadow-md bg-[#58acbb] p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Ingredients</h3>
                  {ingredients.map((ingredient, index) => (
  <div key={index} className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
    <button 
      type="button"
      onClick={() => {
        setCurrentIngredientIndex(index);
        setShowIngredientModal(true);
      }}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2 md:mb-0 md:mr-2"
    > {ingredient.name || "Choose Ingredient"}
    </button>


                      <input
                        type="number"
                        name="quantity"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, e)}
                        placeholder="Quantity"
                        className="text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 mb-2 md:mb-0 md:mr-2 md:w-1/4"
                      />
                   <select
  name="unit"
  value={ingredient.unit}
  onChange={(e) => handleIngredientChange(index, e)}
  className="text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 md:w-1/4"
>
  <option value="">Select Unit</option>
  <option value="g">g</option>
  <option value="pieces">pieces</option>
</select>

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
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center z-50">
      <button
        onClick={() => setShowIngredientModal(false)}
        className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Close
      </button>
      <ul className="list-disc list-inside">
        {userIngredients.map((ingredient, index) => (
         
         
         
         <li key={index} className="text-lg mb-1">
          
          
          
            <button
              onClick={() => handleIngredientSelection(ingredient.ingredient_name, index)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {ingredient.ingredient_name}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setAddingNewIngredient(true)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Ingredient
      </button>
      {addingNewIngredient && (
        <div className="mt-4">
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <TickIcon />
                  <p className="text-green-600 mt-4">
                    Recipe added successfully!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}{" "}
       
      </div> <button
          className="w-full bg-red-500 mt-10 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
    </div>
  );
}
