import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { MdCheckCircle, MdEdit, MdSave } from "react-icons/md"; // Importing icons
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid
import { useNavigate } from "react-router-dom";
import placeholderImg from "../assets/images/placeholderImg.png";
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Example for v2 using an arrow path icon
import Modal from '../components/Modal'; // Adjust the import path according to your file structure



export default function RecipeDetail() {
  let { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

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
  const [editIngredients, setEditIngredients] = useState([{
    name: "",
    quantity: "",
    unit: "",
    availableUnits: [] // Initialize this as an empty array
  }]);

  function convertToAllUnits(quantity, unit, conversionInfo) {
    // Define all supported units dynamically based on conversionInfo
    const units = ['g', 'cups', 'tbsp'];
    if (conversionInfo.each_to_g) {
      units.push('pieces'); // Include 'pieces' only if each_to_g is present
    }
  
    const conversionResult = {};
  
    // Convert quantity to grams first if it's not already in grams
    let quantityInGrams = unit === 'g' ? quantity : convertToGrams(quantity, unit, conversionInfo);
  
    // Store grams conversion
    conversionResult['g'] = quantityInGrams;
  
    // Convert grams to all other units
    units.forEach((targetUnit) => {
      if (targetUnit === 'g') {
        conversionResult[targetUnit] = parseFloat(quantityInGrams).toFixed(1); // Ensure grams are also formatted
      } else {
        conversionResult[targetUnit] = convertFromGrams(quantityInGrams, targetUnit, conversionInfo).toFixed(1);
      }
    });
  
    return conversionResult;
  }
  
  function convertToGrams(quantity, unit, conversionInfo) {
    switch (unit) {
      case 'cups': return quantity * conversionInfo.cup_to_g;
      case 'tbsp': return quantity * conversionInfo.tbsp_to_g;
      case 'pieces': return conversionInfo.each_to_g ? quantity * conversionInfo.each_to_g : quantity;
      default: return quantity; // Return the original quantity if it's already in grams or unsupported unit
    }
  }
  
  function convertFromGrams(quantity, unit, conversionInfo) {
    switch (unit) {
      case 'cups': return quantity / conversionInfo.cup_to_g;
      case 'tbsp': return quantity / conversionInfo.tbsp_to_g;
      case 'pieces': return conversionInfo.each_to_g ? quantity / conversionInfo.each_to_g : quantity;
      default: return quantity; // This case should never be reached since 'g' is filtered out
    }
  }
  
  const [currentUnits, setCurrentUnits] = useState({});
  // Assuming these are the units you want to cycle through
  const switchUnit = (ingredientName) => {
    setRecipe(prevRecipe => {
      const ingredients = prevRecipe.ingredients.map(ingredient => {
        if (ingredient.name === ingredientName) {
          const currentUnitIndex = Object.keys(ingredient.conversions).indexOf(ingredient.currentUnit || ingredient.unit);
          const nextUnitIndex = (currentUnitIndex + 1) % Object.keys(ingredient.conversions).length;
          const nextUnit = Object.keys(ingredient.conversions)[nextUnitIndex];
  
          return {
            ...ingredient,
            currentUnit: nextUnit,
            quantity: ingredient.conversions[nextUnit]
          };
        }
        return ingredient;
      });
  
      return { ...prevRecipe, ingredients };
    });
  };
  
  
const getNextUnit = (currentUnit, conversionInfo) => {
  let units = ['g', 'cups', 'tbsp'];
  if (conversionInfo && conversionInfo.each_to_g) {
    units.push('pieces');
  }
  
  const currentIndex = units.indexOf(currentUnit);
  const nextIndex = (currentIndex + 1) % units.length; // Wrap around to the first unit
  return units[nextIndex];
};

  
// Example function that matches recipe ingredients with master ingredients to append conversion info
const enrichIngredientsWithConversionInfo = (recipeIngredients, masterIngredients) => {
    return recipeIngredients.map(recipeIngredient => {
        // Find the matching master ingredient by name
        const masterIngredient = masterIngredients.find(master => master.name === recipeIngredient.name);

        // If found, append the conversion info to the recipe ingredient
        if (masterIngredient) {
            return {
                ...recipeIngredient,
                conversion_info: masterIngredient.conversion_info,
            };
        }

        // If no matching master ingredient is found, return the original recipe ingredient
        return recipeIngredient;
    });
};

useEffect(() => {
  if (recipe && userIngredients.length > 0) {
      // Perform enrichment only if necessary. This condition should be adjusted to fit your logic.
      // For example, you might check if enrichment has already been done to avoid doing it again.
      if (!recipe.ingredientsEnriched) { // Assume this is a flag you set when enrichment is done
          const enrichedIngredients = enrichIngredientsWithConversionInfo(recipe.ingredients, userIngredients);
          
          console.log(enrichedIngredients);
          setRecipe({
              ...recipe,
              ingredients: enrichedIngredients,
              ingredientsEnriched: true,
          });
          
      }
  }
  // The dependencies array ensures this effect only reruns if `recipe` or `userIngredients` change.
  // Adjust the condition inside the effect to ensure it doesn't run endlessly.
}, [recipe, userIngredients]);


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
  const fetchMasterIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients_master')
        .select('*'); // Adjust if you need specific columns
  
      if (error) throw error;
  
      setUserIngredients(data); // Assuming this state holds the ingredients for selection
    } catch (error) {
      console.error('Error fetching master ingredients:', error);
    }
  };

  fetchMasterIngredients();
}, []);

  
// When a new ingredient is selected, update the available units and reset the unit if necessary.
const handleIngredientSelection = (ingredientName) => {
  const masterIngredient = userIngredients.find(i => i.name === ingredientName);
  const conversionInfo = masterIngredient?.conversion_info;
  
  if (currentIngredientIndex >= 0 && currentIngredientIndex < editIngredients.length) {
    const newUnits = conversionInfo && conversionInfo.each_to_g
      ? ["g", "cups", "tbsp", "pieces"]
      : ["g", "cups", "tbsp"];

    const updatedIngredients = editIngredients.map((ingredient, index) => {
      if (index === currentIngredientIndex) {
        return {
          ...ingredient,
          name: ingredientName,
          availableUnits: newUnits,
          unit: newUnits.includes(ingredient.unit) ? ingredient.unit : newUnits[0]
        };
      }
      return ingredient;
    });
    
    setEditIngredients(updatedIngredients);
    setShowIngredientModal(false);
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
        // Ensure data.ingredients is an array
        const ingredients = typeof data.ingredients === 'string' ? JSON.parse(data.ingredients) : data.ingredients;
  
        const enrichedIngredients = ingredients.map(ingredient => {
          const conversionInfo = userIngredients.find(ui => ui.name === ingredient.name)?.conversion_info;
          if (conversionInfo) {
            return {
              ...ingredient,
              conversions: convertToAllUnits(ingredient.quantity, ingredient.unit, conversionInfo)
            };
          }
          return ingredient;
        });
        let imageUrl;
        if (data.image_url) {
          const { data: imgData, error: imgError } = await supabase.storage
            .from('recipe-pics')
            .getPublicUrl(data.image_url);
  
          imageUrl = imgData && !imgError ? imgData.publicUrl : placeholderImg;
        } else {
          imageUrl = placeholderImg;
        }
  
        setRecipe({ ...data, ingredients: enrichedIngredients, image: imageUrl  });
      }
    };
  
    fetchRecipe();
  }, [recipeId, userIngredients]);





  const enterEditMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsEditing(true);
      setIsTransitioning(false);
    }, 400); // Duration of the fade-out transition

    // Clone the ingredients array and enrich it with availableUnits
 // Enrich the ingredients with available units
 const enrichedIngredients = recipe.ingredients.map(ing => {
  const masterIngredient = userIngredients.find(mi => mi.name === ing.name);
  const conversionInfo = masterIngredient?.conversion_info;
  const availableUnits = conversionInfo && conversionInfo.each_to_g
    ? ["g", "cups", "tbsp", "pieces"]
    : ["g", "cups", "tbsp"];
    
  const unit = availableUnits.includes(ing.unit) ? ing.unit : availableUnits[0];
  setCurrentUnits(prevUnits => ({
    ...prevUnits,
    [ing.name]: unit
  }));

  return {
    ...ing,
    availableUnits: availableUnits,
    unit: unit // Use the updated unit
  };
});
  
    setEditTitle(recipe.title);
    setEditIngredients(enrichedIngredients);


  
    
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
  
    // Initialize imageUrl based on existing condition or fallback to placeholderImg
  let imageUrl = recipe.image_url || placeholderImg;

  if (newImageFile) {
    // If there's an old image URL and it's not the placeholder, attempt to delete it
    if (recipe.image_url && recipe.image_url !== placeholderImg) {
      try {
        const oldFilePath = recipe.image_url;
        await supabase.storage.from("recipe-pics").remove([oldFilePath]);
      } catch (error) {
        console.error("Error deleting old image:", error);
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

      // Successfully uploaded new image, update imageUrl to the new path
      imageUrl = filePath;
    } catch (error) {
      console.error("Error uploading new image:", error);
      // Fallback to placeholder image if upload fails
      imageUrl = placeholderImg;
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
          image_url: imageUrl !== placeholderImg ? imageUrl : null, // Update DB field or set null if using placeholder
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
      image: imageUrl === placeholderImg ? placeholderImg : urlData?.publicUrl,
      });

      setIsTransitioning(true);
      setTimeout(() => {
        setIsEditing(false);
        setIsTransitioning(false);
      }, 200); // Duration of the fade-in transition
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

              <div className="z-0 bg-white z-0 sticky top-[4rem] py-5 right-0 flex gap-2">
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
    hidden
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
                        className="w-2/3 sm:flex-grow bg-white text-black px-10 py-2 rounded hover:bg-gray-200 mb-2 sm:mb-0"
                      >
                        {ingredient.name || "Choose Ingredient"}
                      </button>
      <input
        type="number"
        name="quantity"
        value={ingredient.quantity}
        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
        placeholder="Quantity"
        className="md:w-1/5 text-black p-2 border border-gray-300 rounded w-1/3"
        required
      />
    <select
      name="unit"
      value={ingredient.unit}
      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
      className="md:w-1/5 text-black p-2 border border-gray-300 rounded w-1/3"
      required
    >
      {ingredient.availableUnits && ingredient.availableUnits.map(unit => (
        <option key={unit} value={unit}>{unit}</option>
      ))}
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
  <Modal showModal={showIngredientModal} setShowModal={setShowIngredientModal}>
    <div className="relative max-w-xl mx-auto">
      {/* Modal header */}
      <div className="flex justify-between items-center border-b-2 border-gray-200 mb-4">
        <h3 className="text-xl font-bold text-gray-700 py-2">Choose an ingredient</h3>
        <button onClick={() => setShowIngredientModal(false)} className="text-gray-600 hover:text-gray-900 transition duration-150">
          {/* SVG for close button */}
        </button>
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
        {userIngredients
          .filter(ingredient => ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((ingredient, index) => (
            <button
              key={index}
              onClick={() => handleIngredientSelection(ingredient.name)}
              className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded shadow-sm text-sm transition duration-150"
            >
              {ingredient.name}
            </button>
          ))
        }
      </div>


    </div>
  </Modal>
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
  <h3 className="text-2xl font-semibold text-center mb-2">Ingredients</h3>
  <ul className="max-w-4xl mx-auto">
  {recipe.ingredients.map((ingredient, index) => (
  <li key={index} className="flex justify-between items-center border-b border-gray-200 py-2">
    <span className="text-gray-700">{`${ingredient.name}: ${ingredient.quantity} ${ingredient.currentUnit || ingredient.unit}`}</span>
    <button
      onClick={() => switchUnit(ingredient.name)}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded inline-flex items-center gap-2 text-sm"
    >
      <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
      Switch to {getNextUnit(ingredient.currentUnit || ingredient.unit, ingredient.conversions)}
    </button>
  </li>
))}

  </ul>
</div>






<div className="bg-blue-50 p-4 rounded-lg">
<h3 className="text-2xl font-semibold mb-5">Instructions</h3>
    <div className="space-y-2">
      {recipe.instructions && typeof recipe.instructions === 'string'
        ? recipe.instructions.split("\n").map((step, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input type="checkbox" className="mt-1" />
              <label className="text-gray-700">{ step}</label>
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
