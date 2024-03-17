import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { MdCheckCircle, MdEdit, MdSave } from "react-icons/md"; // Importing icons
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid
import { useNavigate } from "react-router-dom";
import placeholderImg from "../assets/images/placeholderImg.png";
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Example for v2 using an arrow path icon
import Modal from '../components/Modal'; // Adjust the import path according to your file structure
import { useAuth } from '../AuthProvider'; // Import the hook

import { db } from "../firebase"; // Adjust the import path as needed
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";






export default function RecipeDetail() {
  const { currentUser } = useAuth();
  const [ingredientsVersion, setIngredientsVersion] = useState(0);

  let { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const [editInstructions, setEditInstructions] = useState([]);
  const [editImage, setEditImage] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);
  const [addingNewIngredient, setAddingNewIngredient] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editIngredients, setEditIngredients] = useState([{
    name: "",
    quantity: "",
    unit: "",
    availableUnits: [] // Initialize this as an empty array
  }]);

  

  
  // Assuming these are the units you want to cycle through
  const switchUnit = (ingredientName) => {
    setRecipe((prevRecipe) => {
      const ingredients = prevRecipe.ingredients.map((ingredient) => {
        if (ingredient.name === ingredientName) {
          // Get a list of all units from the conversions object
          const availableUnits = Object.keys(ingredient.conversions);
          const currentUnitIndex = availableUnits.indexOf(ingredient.unit);
          const nextUnitIndex = (currentUnitIndex + 1) % availableUnits.length;
          const nextUnit = availableUnits[nextUnitIndex];
  
          return {
            ...ingredient,
            unit: nextUnit, // Update to the next unit
            quantity: ingredient.conversions[nextUnit], // Use the pre-calculated quantity for the next unit
          };
        }
        return ingredient;
      });
  
      return { ...prevRecipe, ingredients };
    });
  };
  
  
  


  


  
// Example function that matches recipe ingredients with master ingredients to append conversion info
function enrichIngredientsWithConversionInfo(recipeIngredients, masterIngredients) {
  return recipeIngredients.map(recipeIngredient => {
    // Find the matching master ingredient by name
    const masterIngredient = masterIngredients.find(master => master.name === recipeIngredient.name);

    // Proceed if a matching master ingredient with conversion info is found
    if (masterIngredient && masterIngredient.conversion_info) {
      // Prepare conversions object to store calculated quantities for all units
      const conversions = calculateConversions(recipeIngredient.quantity, masterIngredient.conversion_info);

      // Return the ingredient with the conversions object, including calculated quantities for all units
      return {
        ...recipeIngredient,
        conversions: conversions,
      };
    }

    // If no matching master ingredient is found, return the original recipe ingredient
    return recipeIngredient;
  });
}

function calculateConversions(quantity, conversionInfo) {
  const quantityInGrams = parseFloat(quantity); // Assuming the initial quantity is always in grams
  const conversions = {};

  // Calculate for cups and tbsp, if conversion rates are available
  if (conversionInfo.cup_to_g) {
    conversions.cups = (quantityInGrams / conversionInfo.cup_to_g).toFixed(1);
  }
  if (conversionInfo.tbsp_to_g) {
    conversions.tbsp = (quantityInGrams / conversionInfo.tbsp_to_g).toFixed(1);
  }

  // Calculate for 'pieces', if each_to_g conversion exists
  if (conversionInfo.each_to_g) {
    conversions.pieces = (quantityInGrams / conversionInfo.each_to_g).toFixed(1);
  }

  // Always include the grams conversion
  conversions.g = quantityInGrams.toFixed(1);
console.log(conversions)
  return conversions;
}



useEffect(() => {
  if (recipe && userIngredients.length > 0) {
      // Perform enrichment only if necessary. This condition should be adjusted to fit your logic.
      // For example, you might check if enrichment has already been done to avoid doing it again.
      if (!recipe.ingredientsEnriched) { // Assume this is a flag you set when enrichment is done
          const enrichedIngredients = enrichIngredientsWithConversionInfo(recipe.ingredients, userIngredients);
          console.log(enrichedIngredients)
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

const handleInstructionChange = (index, event) => {
  const updatedInstructions = editInstructions.map((instruction, i) => {
    if (i === index) {
      return { ...instruction, text: event.target.value }; // Correctly update the text property
    }
    return instruction;
  });
  setEditInstructions(updatedInstructions);
};


  const addInstructionInput = () => {
    setEditInstructions([...editInstructions, ""]);
  };
  


  
  const addNewIngredient = () => {
    setEditIngredients([...editIngredients, { name: "", quantity: "", unit: "g" }]);
};


useEffect(() => {
  const fetchMasterIngredients = async () => {
    const userId = currentUser?.uid;
    const ingredientsRef = collection(db, "ingredients_master");
    const q = query(ingredientsRef, where("user_id", "in", [userId, "public"]));

    try {
      const querySnapshot = await getDocs(q);
      const fetchedIngredients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserIngredients(fetchedIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  if (currentUser) {
    fetchMasterIngredients();
  }
}, [currentUser, ingredientsVersion]); // Depend on currentUser to refetch when user changes


  
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


  
  

  useEffect(() => {
    const fetchRecipe = async () => {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        let data = docSnap.data();
        data.id = docSnap.id; // Include the document ID
        
     
          // Transform instructions from the object format to an array format
          const instructionsArray = Object.keys(data.instructions).map(key => ({
            stepNumber: data.instructions[key].stepNumber,
            text: data.instructions[key].text,
          }));
        
          data.instructions = instructionsArray;
        
      console.log(data)
  
        setRecipe(data);
      } else {
        console.log("No such document!");
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
  
    // Prepare the ingredients
    const enrichedIngredients = recipe.ingredients.map(ingredient => {
      const masterIngredient = userIngredients.find(mi => mi.name === ingredient.name);
      const conversionInfo = masterIngredient?.conversion_info;
      const availableUnits = conversionInfo && conversionInfo.each_to_g
        ? ["g", "cups", "tbsp", "pieces"]
        : ["g", "cups", "tbsp"];
        
      const unit = availableUnits.includes(ingredient.unit) ? ingredient.unit : availableUnits[0];
      return {
        ...ingredient,
        availableUnits: availableUnits,
        unit: unit // Use the updated unit
      };
    });
  
    setEditTitle(recipe.title);
    setEditIngredients(enrichedIngredients);
  
    // Adjusted to use recipe.instructions directly if it's already in the correct format
    setEditInstructions(recipe.instructions || []);
  
    setEditImage(recipe.image_url);
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
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (confirmDelete) {
      try {
        // Use Firestore's deleteDoc method
        await deleteDoc(doc(db, "recipes", recipeId));
  
        alert("Recipe deleted successfully.");
  
        // Optionally, you can refresh the recipes list or navigate to another page
        navigate("/"); // Navigate back to the home page or another relevant page
      } catch (error) {
        console.error("Error deleting recipe", error);
        alert("Failed to delete recipe.");
      }
    }
  };
  

  const handleSave = async () => {
    setIsTransitioning(true); // Start transition
    let imageUrl = recipe.image_url; // Default to existing image URL

    if (newImageFile) {
      const storage = getStorage();
      const storagePath = `recipeImages/${newImageFile.name}_${Date.now()}`;
      const imageRef = storageRef(storage, storagePath);

      try {
        const snapshot = await uploadBytes(imageRef, newImageFile);
        const uploadedImageUrl = await getDownloadURL(snapshot.ref);
        imageUrl = uploadedImageUrl; // Update the imageUrl with the newly uploaded image URL
      } catch (error) {
        console.error("Failed to upload image: ", error);
        // Optionally, handle the error (e.g., show a message to the user)
      }
    }

    // Prepare instructions for Firestore
    const instructionsUpdate = editInstructions.map((instruction, index) => ({
      stepNumber: index + 1,
      text: instruction.text || "",
    }));

    const updatePayload = {
      title: editTitle || "",
      ingredients: editIngredients,
      instructions: instructionsUpdate,
      image_url: imageUrl || null, // Use the new or existing image URL, fallback to null
    };

    try {
      await updateDoc(doc(db, "recipes", recipeId), updatePayload);
      setRecipe(prev => ({ ...prev, ...updatePayload }));
      setIsEditing(false); // Exit editing mode
      setNewImageFile(null); // Clear the new image file state
    } catch (error) {
      console.error("Error updating recipe:", error);
      // Optionally, handle the error (e.g., show a message to the user)
    } finally {
      setIsTransitioning(false); // End transition
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
    setIngredientsVersion(curr => curr + 1); // Trigger the refetching and re-enriching

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
  editInstructions.map((instruction, index) => (
    <div key={index} className="mb-2">
      <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor={`instruction-${index}`}>
        Step {index + 1}
      </label>
      <input
        id={`instruction-${index}`}
        type="text"
        value={instruction.text} // Correctly display the text property
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
    src={recipe.image_url}
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
    <span className="text-gray-700">{`${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`}</span>
    <button
      onClick={() => switchUnit(ingredient.name)}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded inline-flex items-center gap-2 text-sm"
    >
      <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
      Switch Unit
    </button>
  </li>
))}


  </ul>
</div>






<div className="bg-blue-50 p-4 rounded-lg">
  <h3 className="text-2xl font-semibold mb-5">Instructions</h3>
  <div className="space-y-2">
  {recipe.instructions.map((instruction, index) => (
    <div key={index} className="flex gap-3 items-start">
      <span>{`Step ${index + 1}: ${instruction.text}`}</span>
    </div>
  ))}
</div>

</div>


          </div>

        </div>
      )}
    </div>

  );
}
