import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { MdCheckCircle, MdEdit, MdSave } from "react-icons/md"; // Importing icons
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid
import { useNavigate } from "react-router-dom";
import placeholderImg from "../assets/images/placeholderImg.png";


export default function RecipeDetail() {
  let { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIngredients, setEditIngredients] = useState([]);
  const [editInstructions, setEditInstructions] = useState([]);
  const [editImage, setEditImage] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);
  const [addingNewIngredient, setAddingNewIngredient] = useState(false);
  const [startFadeOut, setStartFadeOut] = useState(false);
  const [emptyFields, setEmptyFields] = useState([]);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [inEditMode, setInEditMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  

  // ... other useEffects and functions

  const handleInstructionChange = (index, e) => {
    const newInstructions = editInstructions.map((instruction, i) => {
      if (i === index) {
        return e.target.value;
      }
      return instruction;
    });
    setEditInstructions(newInstructions);
  };

  const addInstructionInput = () => {
    setEditInstructions([...editInstructions, ""]);
  };
  

  // Modify the click handler for closing the modal
  const handleCloseModal = () => {
    setStartFadeOut(true);
    setTimeout(() => {
      setShowIngredientModal(false);
      setStartFadeOut(false); // Reset fade-out state
    }, 350); // duration of the fade-out animation
  };

  
  const addNewIngredient = () => {
    setEditIngredients([...editIngredients, { name: "", quantity: "", unit: "g" }]);
};


  useEffect(() => {
    const fetchUserIngredients = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
  
        if (user) {
          const { data, error } = await supabase
            .from('user_ingredients')
            .select('ingredient_name')
            .eq('user_id', user.id);
  
          if (error) {
            throw error;
          }
  
          const userIngredients = data.map(item => item.ingredient_name);
  
          // Log fetched data for debugging
          console.log('Fetched ingredients:', userIngredients);
  
          // Update the state with the fetched user ingredients
          setUserIngredients(userIngredients);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };
  
    fetchUserIngredients();
  }, []);
  
  const handleIngredientSelection = (ingredientName) => {
    if (currentIngredientIndex >= 0 && currentIngredientIndex < editIngredients.length) {
        const updatedIngredients = [...editIngredients];
        updatedIngredients[currentIngredientIndex] = {
            ...updatedIngredients[currentIngredientIndex],
            name: ingredientName,
        };
        setEditIngredients(updatedIngredients);
        setStartFadeOut(true);
        setTimeout(() => {
          setShowIngredientModal(false);
          setStartFadeOut(false); // Reset fade-out state
        }, 350); // duration of the fade-out animation
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
        setUserIngredients([...userIngredients, newIngredient]);
        setNewIngredient('');
        setAddingNewIngredient(false);
      } catch (error) {
        console.error('Error adding new ingredient:', error);
      }
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();
  
      if (error) {
        console.error("Error fetching recipe", error);
        return;
      }
  
      if (data) {
        // Check if instructions are an array and convert to string if needed
        if (Array.isArray(data.instructions)) {
          data.instructions = data.instructions
            .map((instr, index) => `Step ${index + 1}: ${instr}`)
            .join("\n");
        }
  
        try {
          data.ingredients = JSON.parse(data.ingredients);
        } catch (e) {
          console.error("Error parsing ingredients", e);
          data.ingredients = [];
        }
  
        let imageUrl;
        if (data.image_url) {
          const { data: imgData, error: imgError } = await supabase.storage
            .from('recipe-pics')
            .getPublicUrl(data.image_url);
  
          imageUrl = imgData && !imgError ? imgData.publicUrl : placeholderImg;
        } else {
          imageUrl = placeholderImg;
        }
  
        setRecipe({ ...data, image: imageUrl });
      }
    };
  
    fetchRecipe();
}, [recipeId]);





  const enterEditMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsEditing(true);
      setIsTransitioning(false);
    }, 400); // Duration of the fade-out transition
  
    setEditTitle(recipe.title);
    setEditIngredients(recipe.ingredients.map((ing) => ({ ...ing }))); // Clone the ingredients array


  
    
    if (typeof recipe.instructions === 'string') {
        setEditInstructions(recipe.instructions.split("\n"));
      } else {
        setEditInstructions([]);
      }

    setEditImage(recipe.image);
    setTimeout(() => {
    setIsEditing(true);
  }, 200);
  };
  
  

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewImageFile(file);
  
      // Create a URL for the selected file
      const fileUrl = URL.createObjectURL(file);
      setEditImage(fileUrl); // Update editImage state to display the selected image
    }
  };
  

  const navigate = useNavigate();

  const deleteRecipe = async (recipeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from("recipes")
          .delete()
          .match({ id: recipeId });

        if (error) {
          throw error;
        }

        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
        alert("Recipe deleted successfully.");

        // Navigate back to the home page after successful deletion
        navigate("/");
      } catch (error) {
        console.error("Error deleting recipe", error);
        alert("Failed to delete recipe.");
      }
    }
  };

  const handleSave = async () => {
    // Join the instructions array into a single string
    const instructionsString = editInstructions.join("\n");
  
    let imageUrl = recipe.image_url; // Default to the current image URL in the database
  
    if (newImageFile) {
      // Check and delete old image if it exists
      if (recipe.image_url) {
        try {
          const oldFilePath = recipe.image_url;
          await supabase.storage.from("recipe-pics").remove([oldFilePath]);
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Handle the error appropriately
        }
      }
  
      // Handle new image file upload
      const fileExtension = newImageFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `recipeImages/${fileName}`;
  
      try {
        const { error: uploadError } = await supabase.storage
          .from("recipe-pics")
          .upload(filePath, newImageFile);
  
        if (uploadError) throw uploadError;
  
        imageUrl = filePath; // Update imageUrl to the path of the new image
      } catch (error) {
        console.error("Error uploading new image:", error);
        return;
      }
    }
  
    // Proceed with updating the recipe in the database
    try {
      const { error } = await supabase
        .from("recipes")
        .update({
          title: editTitle,
          ingredients: JSON.stringify(editIngredients),
          instructions: instructionsString, // Use the joined string of instructions
          image_url: imageUrl, // Update with the new image file path or existing path
        })
        .eq("id", recipeId);
  
      if (error) throw error;
  
      // Fetch the updated image URL for display
      const { data: urlData } = await supabase.storage
        .from("recipe-pics")
        .getPublicUrl(imageUrl);
  
      setRecipe({
        ...recipe,
        title: editTitle,
        ingredients: editIngredients,
        instructions: instructionsString, // Update the state with the new instructions string
        image_url: imageUrl,
        image: urlData?.publicUrl, // Update local state with new image URL for display
      });

      setIsTransitioning(true);
      setTimeout(() => {
        setIsEditing(false);
        setIsTransitioning(false);
      }, 400); // Duration of the fade-in transition
      setTimeout(() => {
      setIsEditing(false);
    }, 200); // Duration of the fade-in transition
      setNewImageFile(null);
    } catch (error) {
      console.error("Error updating recipe", error);
    }
  };
  

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = editIngredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    setEditIngredients(updatedIngredients);
  };

  if (!recipe) {
    return <div className="text-center text-xl mt-5">Recipe not found</div>;
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    await handleSave(); // Call your existing save logic
};


  return (


    <div className={`pt-[7rem] p-6 bg-white rounded-lg shadow-lg mx-auto transition-opacity duration-300`}>
 {isEditing ? (
  // Edit mode
  <div className={`transition-opacity duration-300 ease-in-out ${!isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
  <form onSubmit={handleFormSubmit}> {/* Wrap in form and handle on submit */}

              <div className="bg-white z-10 sticky top-[4rem] py-5 right-0 flex gap-2">
  <button
  type="submit"
  className="flex flex-row align-center justify-center items-center gap-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
>

      <MdSave /><span>Save</span>
    </button>
  
  </div>


    <div className="bg-gray-100 p-4 rounded-lg my-7">
      <label
        htmlFor="title"
        className="text-center block text-2xl font-bold mb-2"
      >
        Title
      </label>
      <input
        id="title"
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        
      />
    </div>
    <div className="bg-green-50 p-4 rounded-lg mb-4 flex justify-center items-center">
  <label htmlFor="imageUpload" className="block w-[18rem] h-[18rem] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer flex justify-center items-center">
    <div className="text-center">
      {editImage ? (
        <img src={editImage} alt="Selected" className="w-[18rem] h-[18rem] object-cover rounded-lg"/>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 012-2h8a2 2 0 012 2v4h-3.5a2.5 2.5 0 00-2.5 2.5V14H4V3zm9 7a1.5 1.5 0 113 0v4a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 14V10a1.5 1.5 0 113 0v1.5a.5.5 0 001 0V10z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-500">Upload Image</p>
          <p className="text-sm text-gray-500">(Leave blank for default)</p>
        </>
      )}
    </div>
    <input id="imageUpload" type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
  </label>
</div>


    <div className="bg-green-50 p-4 rounded-lg mb-4">
  <h3 className="text-2xl font-semibold text-center mb-2">Ingredients</h3>
  {editIngredients.map((ingredient, index) => (
  <div key={index} className="mb-4">
    <div className="flex space-x-2 relative">
    <input
                        type="text"
                        value={ingredient.name}
                        required
                        className="bg-transparent w-[0.1rem] h-[0.1rem] ml-[8rem] mt-9 absolute "
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
      <input
        type="number"
        name="quantity"
        value={ingredient.quantity}
        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
        placeholder="Quantity"
        className="text-black p-2 border border-gray-300 rounded w-1/5"
        required
      />
      <select
        name="unit"
        value={ingredient.unit}
        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
        className="text-black p-2 border border-gray-300 rounded w-1/5"
        required
      >
        <option value="g">g</option>
        <option value="pieces">pieces</option>
      </select>
    </div>
  </div>
))}

   <button
   type="button"
              onClick={addNewIngredient}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add New Ingredient
            </button>
</div>

<div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-2xl font-semibold text-center mb-2">
        Instructions
      </h3>
      {
  Array.isArray(editInstructions) &&
    editInstructions.map((instruction, index) => (
      // Your mapping logic here

  <div key={index} className="mb-2">
    <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor={`instruction-${index}`}>
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
    ))
}


      <button
        type="button"
        onClick={addInstructionInput}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Next Instruction
      </button>
    </div>
    {showIngredientModal && (
  <div className={`${startFadeOut ? 'animate-fade-out' : 'animate-fade-in'} fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50`}>
    <div className="relative bg-white p-6 rounded-lg shadow-lg flex flex-col items-center z-50">
    <button 
    type="button"
        onClick={handleCloseModal}

  className="absolute top-0 m-0 right-0 rounded-full p-1"
  title="Close"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" viewBox="0 0 20 20" fill="currentColor">
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
        {userIngredients
  .filter(ingredient => ingredient.toLowerCase().includes(searchQuery.toLowerCase()))
  .map((ingredient, index) => (
      <li key={index} className="text-lg mb-1">
          <button
            type="button"
            onClick={() => handleIngredientSelection(ingredient)}
            className="bg-white shadow-md text-black px-4 py-2 rounded hover:bg-gray-100"
          >
            {ingredient}
          </button>
      </li>
  ))
}
        </ul>
      </div>
      <button
      type="button"
        onClick={() => setAddingNewIngredient(true)}
        className="mt-10 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        required
      >
        Add New Ingredient
      </button>
      {addingNewIngredient && (
        <div className={`${startFadeOut ? 'animate-fade-out' : 'animate-fade-in'} flex align-center justify-center gap-2 mt-4`}>
          <input 
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="New ingredient name"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
          type="button"
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
</form>
  </div>
) : (
 
        // View mode
        <div className={`transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

<div className=" z-10 sticky top-[4rem] bg-white py-5 right-0 flex gap-2">
    <button
      onClick={enterEditMode}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      title="Edit Recipe"
    >
      <MdEdit />
    </button>
    <button
      onClick={() => deleteRecipe(recipe.id)}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      title="Delete Recipe"
    >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a2 2 0 012-2h10a2 2 0 012 2V6h2a1 1 0 010 2h-1v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8H2a1 1 0 010-2h2V4zm7 10a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1zm-2-8a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <h2 className="text-3xl font-bold text-teal-600 text-center mb-4">
    {recipe.title}
  </h2>

          <div className="flex justify-center mb-6">
          <img 
    src={recipe.image}
    alt={recipe.title} 
    className="w-[18rem] h-[18rem] object-cover rounded-lg"
/>

          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
  <h3 className="text-2xl font-semibold text-center mb-2">
    Ingredients
  </h3>
  <div className="text-center grid grid-cols-2 gap-x-4 gap-y-2 max-w-4xl mx-auto">
    {recipe.ingredients.map((ing, index) => (
      <li key={index} className="mb-2 list-none	">
        {`${ing.name} (${ing.quantity} ${ing.unit})`}
      </li>
    ))}
  </div>
</div>



<div className="bg-blue-50 p-4 rounded-lg">
<h3 className="text-2xl font-semibold mb-5">Instructions</h3>
    <div className="space-y-2">
      {recipe.instructions && typeof recipe.instructions === 'string'
        ? recipe.instructions.split("\n").map((step, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input type="checkbox" className="mt-1" />
              <label className="text-gray-700">{`Step ${index + 1}: ${step}`}</label>
            </div>
          ))
        : null}
  </div>
</div>

          </div>

        </div>
      )}
    </div>

  );
}
