import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MdEdit, MdSave } from "react-icons/md"; // Importing icons
import { useNavigate } from "react-router-dom";
import placeholderImg from "../assets/images/placeholderImg.png";
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Example for v2 using an arrow path icon
import Modal from '../components/Modal'; // Adjust the import path according to your file structure
import { useAuth } from '../AuthProvider'; // Import the hook
import { db } from "../firebase"; // Adjust the import path as needed
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { MdDelete } from 'react-icons/md';






export default function RecipeDetail() {
  const { currentUser } = useAuth();
  const [ingredientsVersion, setIngredientsVersion] = useState(0);
  const ingredientsListRef = useRef(null);

  let { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const [editInstructions, setEditInstructions] = useState([]);
  const [editImage, setEditImage] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editIngredients, setEditIngredients] = useState([{
    name: "",
    quantity: "",
    unit: "",
    availableUnits: [] // Initialize this as an empty array
  }]);

  
  const checkAndApplyScrollMask = (element) => {
    if (!element) return;
  
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    console.log('At Bottom:', atBottom); // Debugging log
  
    if (atBottom) {
      element.classList.remove('scrollable-mask');
    } else {
      element.classList.add('scrollable-mask');
    }
  };
  
  useEffect(() => {
    const element = ingredientsListRef.current;
    if (!element) return;
  
    // Define a handler that applies the mask based on the scroll position
    const onScroll = () => {
      checkAndApplyScrollMask(element);
    };
  
   
  
    // Add the scroll event listener
    element.addEventListener('scroll', onScroll);

     // Apply the mask initially
     checkAndApplyScrollMask(element);
  
  
    // Cleanup function to remove the event listener and observer
    return () => {
      if (element) { 
      element.removeEventListener('scroll', onScroll);
      }
    };
  }, [recipe]); // Dependency array to re-run when recipe changes
  
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
      const conversions = calculateConversions(recipeIngredient.quantity, masterIngredient.conversion_info, recipeIngredient.unit);
      // Return the ingredient with the conversions object, including calculated quantities for all units
      return {
        ...recipeIngredient,
        conversions: conversions,
      };
    }
console.log(recipeIngredient);
    // If no matching master ingredient is found, return the original recipe ingredient
    return recipeIngredient;
  });
}

function calculateConversions(initialQuantity, conversionInfo, initialUnit) {
  // Convert initial quantity to grams based on the initial unit
  let quantityInGrams;
  switch (initialUnit) {
    case 'cups':
      quantityInGrams = initialQuantity * conversionInfo.cup_to_g;
      break;
    case 'tbsp':
      quantityInGrams = initialQuantity * conversionInfo.tbsp_to_g;
      break;
    case 'pieces':
      quantityInGrams = initialQuantity * conversionInfo.each_to_g;
      break;
    case 'g':
    default:
      quantityInGrams = initialQuantity;
      break;
  }

  const conversions = {};
  console.log(conversions)

  // Check and calculate conversions for all units from grams
  if (conversionInfo.cup_to_g && conversionInfo.cup_to_g != 'N/A') {
    conversions.cups = (quantityInGrams / conversionInfo.cup_to_g).toFixed(1);
  }
  if (conversionInfo.tbsp_to_g && conversionInfo.tbsp_to_g != 'N/A') {
    conversions.tbsp = (quantityInGrams / conversionInfo.tbsp_to_g).toFixed(1);
  }
  if (conversionInfo.each_to_g && conversionInfo.each_to_g != 'N/A') {
    conversions.pieces = (quantityInGrams / conversionInfo.each_to_g).toFixed(1);
  }

  // Always include the grams conversion
  conversions.g = parseFloat(quantityInGrams).toFixed(1);

  return conversions;
}



function enrichIngredients() {
  if (recipe && userIngredients.length > 0) {
      // Perform enrichment only if necessary. This condition should be adjusted to fit your logic.
      // For example, you might check if enrichment has already been done to avoid doing it again.
      if (!recipe.ingredientsEnriched) { // Assume this is a flag you set when enrichment is done
          const enrichedIngredients = enrichIngredientsWithConversionInfo(recipe.ingredients, userIngredients);
          setRecipe({
              ...recipe,
              ingredients: enrichedIngredients,
              ingredientsEnriched: true,
          });
          
      }
  }
}

  useEffect(() => {
enrichIngredients()
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
    // Initialize with 'g' since it's always present
    let newUnits = ['g'];

    // Dynamically add units based on the availability and validity of conversion info
    if (conversionInfo?.each_to_g && conversionInfo.each_to_g !== 'N/A') {
      newUnits.push('pieces');
    }
    if (conversionInfo?.cup_to_g && conversionInfo.cup_to_g !== 'N/A') {
      newUnits.push('cups');
    }
    if (conversionInfo?.tbsp_to_g && conversionInfo.tbsp_to_g !== 'N/A') {
      newUnits.push('tbsp');
    }
    // Add more checks here if there are more units

    const updatedIngredients = editIngredients.map((ingredient, index) => {
      if (index === currentIngredientIndex) {
        return {
          ...ingredient,
          name: ingredientName,
          availableUnits: newUnits,
          // If the current unit is not in the newUnits list, default to the first available unit
          unit: newUnits.includes(ingredient.unit) ? ingredient.unit : newUnits[0]
        };
      }
      return ingredient;
    });

    setEditIngredients(updatedIngredients);
    setShowIngredientModal(false);
  }
};


  
  


    const fetchRecipe = async () => {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        let data = docSnap.data();
        data.id = docSnap.id; // Include the document ID
        
        data.image_url = data.image_url || placeholderImg; // Fallback to placeholder image if no image URL

          // Transform instructions from the object format to an array format
          const instructionsArray = Object.keys(data.instructions).map(key => ({
            stepNumber: data.instructions[key].stepNumber,
            text: data.instructions[key].text,
          }));
        
          data.instructions = instructionsArray;
        
  
        setRecipe(data);
      } else {
        console.log("No such document!");
      }
    };
  
    useEffect(() => {
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
      fetchRecipe();
      enrichIngredients();
    } catch (error) {
      console.error("Error updating recipe:", error);
      // Optionally, handle the error (e.g., show a message to the user)
    } finally {
      setIsTransitioning(false); // End transition
    }
  };

  const removeIngredient = (index) => {
    const element = document.getElementById(`ingredient-${index}`);
    if (element) {
      element.classList.add('fade-out-and-collapse');
  
      setTimeout(() => {
        setEditIngredients((currentIngredients) =>
          currentIngredients.filter((_, i) => i !== index)
        );
      }, 500); // The timeout should match your animation duration
    }
  };
  
  
  // Similarly, you can do the same for instructions:
  const removeInstruction = (instructionId) => {
    const element = document.getElementById(`instruction-${instructionId}`)
    if (element) {
      element.classList.add('fade-out-and-collapse');
    
    setTimeout(() => {
      setEditInstructions((currentInstructions) =>
        currentInstructions.filter(instruction => instruction.id !== instructionId)
      );
    }, 500); // Match the duration of the animation
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

const handleTextAreaInput = (e, index) => {
  // Call your existing handleInstructionChange
  handleInstructionChange(index, e);

  // Automatically adjust the height
  e.target.style.height = "inherit"; // Reset height to recalculate
  e.target.style.height = `${e.target.scrollHeight}px`; // Set new height
};




  return (


    <div className={`pt-[7rem] p-6 bg-gray-100 rounded-lg shadow-lg mx-auto transition-opacity duration-300`}>
 {isEditing ? (
  // Edit mode
  <div className="container text-gray-600 mx-auto px-4 max-w-3xl"> {/* Adjust max-width as needed */}

  <div className={`transition-opacity duration-300 ease-in-out ${!isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
  <form onSubmit={handleFormSubmit}> {/* Wrap in form and handle on submit */}

              <div className="z-10 bg-gray-100 z-0 sticky top-[4rem] py-5 right-0 flex gap-2">
  <button
  type="submit"
  className="flex flex-row align-center justify-center items-center gap-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
>

      <MdSave /><span>Save</span>
    </button>
  
  </div>


    <div className="bg-white shadow-md text-gray-600 p-4 rounded-lg my-7 animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
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
    <div className="bg-white text-gray-600 shadow-md p-4 rounded-lg mb-4 flex justify-center items-center animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
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


    <div className="text-gray-600 shadow-md bg-white p-4 rounded-lg mb-4 animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
  <h3 className="text-2xl font-semibold text-center mb-2">Ingredients</h3>
  {editIngredients.map((ingredient, index) => (
  <div key={index} id={`ingredient-${index}`}
  className={`relative flex md:flex-row flex-col sm:items-center mb-4 md:gap-2 ${index !== 0 ? "animate-fade-in" : "animate-fade-out"}`}>
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
        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
        placeholder="Quantity"
        className="text-gray-600 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
        required
      />
    <select
      name="unit"
      value={ingredient.unit}
      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
      className=" p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
      required
    >
          <option disabled value="">Unit</option>

      {ingredient.availableUnits && ingredient.availableUnits.map(unit => (
        <option key={unit} value={unit}>{unit}</option>
      ))}
    </select>
    </div>
    
    {editIngredients.length > 1 && ( // Only show the delete button if there is more than one ingredient
        <button
          type="button"
          onClick={() => removeIngredient(index)}
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
              onClick={addNewIngredient}
              className="mt-2 bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
            >
              Next Ingredient
            </button>
</div>

<div className="text-gray-600 shadow-md bg-white p-4 rounded-lg animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
      <h3 className="text-2xl font-semibold text-center mb-2">
        Instructions
      </h3>
      {
  editInstructions.map((instruction, index) => (
    <div 
    key={index} 
    id={`edit-instruction-input-${index}`} 
    className={`relative mb-4 ${index !== 0 ? "animate-fade-in" : ""}`}
  >      <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor={`instruction-${index}`}>
        Step {index + 1}
      </label>
      <textarea
  id={`instruction-${index}`}
  value={instruction.text}
  onChange={(e) => handleTextAreaInput(e, index)} // Updated to use handleTextAreaInput
  placeholder={`Instruction for step ${index + 1}`}
  className="textarea textarea-bordered w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
  required
  style={{ minHeight: "75px" }} // Ensure there's a minimum height
></textarea>
      {editInstructions.length > 1 && ( // Only show the delete button if there's more than one instruction
          <button
            type="button"
            onClick={() => removeInstruction(index)}
            className="flex justify-center items-center gap-3 w-full bg-gray-400 transition duration-300 hover:bg-gray-700 text-white font-bold p-2 rounded"
            aria-label="Remove instruction"
          >
            <MdDelete /> Remove
          </button>
        )}
    </div>
  ))
}



      <button
        type="button"
        onClick={addInstructionInput}
        className="mt-2 bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
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
      <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-64 scrollable-mask">
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
  </div>
) : (
 
        // View mode
        <div className={`transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
  <div className="container text-gray-600 mx-auto px-4 max-w-3xl"> {/* Adjust max-width as needed */}

<div className=" z-10 sticky top-[4rem] bg-gray-100 py-5 right-0 flex gap-2">
    <button
      onClick={enterEditMode}
      className="bg-gray-500 transition duration-300 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      title="Edit Recipe"
    >
      <MdEdit />
    </button>
    <button
      onClick={() => deleteRecipe(recipe.id)}
      className="bg-red-500 transition duration-300 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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
<div className="my-4 border-b-2 animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
          <h2 className="text-3xl font-bold text-center mb-4">
    {recipe.title}
  </h2>
</div>
          <div className="flex justify-center mb-6 animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
          <img 
    src={recipe.image_url}
    alt={recipe.title} 
    className="w-[18rem] h-[18rem] object-cover rounded-lg"
/>

          </div>
          <div className="grid gap-4 mb-6">
     

          <div className="bg-white shadow-md p-4 rounded-lg animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
  <h3 className="text-2xl font-semibold text-center mb-2">Ingredients</h3>
  
  <div   className="grid max-h-[20em] md:max-h-[40em] overflow-auto md:grid-cols-2 gap-4 scrollable-mask" 
  ref={ingredientsListRef}>
 
    {recipe.ingredients.map((ingredient, index) => (
      <div key={index} className="flex items-center border-b border-gray-200 py-2">
        <div className="flex-grow">
          <div className="text-gray-700">{`${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`}</div>
        </div>
        <button
          onClick={() => switchUnit(ingredient.name)}
          className="ml-2 bg-[#58acbb] hover:bg-[#3e7983] text-white font-bold py-1 px-3 rounded text-sm"
          title="Switch Unit" // Adding a title for accessibility
          >
            
             <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>
    ))}
  </div>
</div>





<div className="bg-white shadow-md p-4 rounded-lg animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
  <h3 className="text-2xl font-semibold mb-5">Instructions</h3>
  <div className="space-y-2">
    {recipe.instructions.map((instruction, index) => (
      <div key={index} className="flex flex-col gap-1">
        <strong className="text-teal-700 font-extrabold">{`Step ${index + 1}:`}</strong>
        <span className="whitespace-pre-wrap mb-5 text-gray-600">{instruction.text}</span>
      </div>
    ))}
  </div>
</div>




          </div>

        </div>
        </div>
      )}
    </div>

  );
}
