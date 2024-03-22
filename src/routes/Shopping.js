import React, { useState, useEffect } from "react";
import placeholderImg from "../assets/images/placeholderImg.png";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"; // Import icons for the counter
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Example for v2 using an arrow path icon
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from '../AuthProvider'; // Ensure this path is correct



function Shopping() {
  const { currentUser } = useAuth();

  
  const [recipes, setRecipes] = useState({});
  const [shoppingList, setShoppingList] = useState([]);

  const [masterIngredients, setMasterIngredients] = useState([]);

  const [currentUnitIndex, setCurrentUnitIndex] = useState({});

  // Function to cycle through available units for an ingredient
  const cycleUnit = (ingredientName, availableUnits) => {
    const currentIndex = currentUnitIndex[ingredientName] || 0;
    const nextIndex = (currentIndex + 1) % availableUnits.length;
    setCurrentUnitIndex(prevIndices => ({
      ...prevIndices,
      [ingredientName]: nextIndex,
    }));
  };



  const parseQuantityString = (quantityString) => {
    // Define an object to hold the parsed quantities
    const parsedQuantities = {
      name: "",
      grams: "0 g",
      cups: "0 cups",
      tablespoons: "0 tbsp",
      pieces: "0 pieces",
    };
  
    // Extract the name
    const nameMatch = quantityString.match(/^(.*?):/);
    if (nameMatch) {
      parsedQuantities.name = nameMatch[1];
    }
  
    // Use regex to find all numbers followed by a space and any word character (unit)
    const quantityMatches = quantityString.match(/(\d+(\.\d+)?)( g| cups| tbsp| pieces)/g);
  
    if (quantityMatches) {
      quantityMatches.forEach((match) => {
        if (match.includes("g")) parsedQuantities.grams = match;
        else if (match.includes("cups")) parsedQuantities.cups = match;
        else if (match.includes("tbsp")) parsedQuantities.tablespoons = match;
        else if (match.includes("pieces")) parsedQuantities.pieces = match;
      });
    }
  
    return parsedQuantities;
  };
  
  
  useEffect(() => {
    const fetchMasterIngredients = async () => {
      const ingredientsRef = collection(db, "ingredients_master");
      // Example query - adjust according to your needs
      const q = query(ingredientsRef);

      try {
        const querySnapshot = await getDocs(q);
        const fetchedIngredients = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMasterIngredients(fetchedIngredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchMasterIngredients();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!currentUser) return;
      const q = query(collection(db, "recipes"), where("user_id", "==", currentUser.uid));

      try {
        const querySnapshot = await getDocs(q);
        const formattedData = {};
        querySnapshot.forEach((doc) => {
          let recipe = doc.data();
          recipe.id = doc.id;
          let imageUrl = recipe.image_url || placeholderImg;

          formattedData[recipe.id] = {
            title: recipe.title,
            count: 0,
            ingredients: recipe.ingredients,
            imageUrl: imageUrl
          };
        });

        setRecipes(formattedData);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, [currentUser]);
  
  
  

  
  
  const convertQuantities = (quantity, unit, conversionInfo) => {
    // Initialize converted quantities
    let converted = {
      grams: null,
      cups: null,
      tablespoons: null,
      pieces: null, 
    };
  
    // Validate conversionInfo
    if (conversionInfo && typeof conversionInfo === 'object') {
      // Proceed with conversion based on the unit
      switch (unit) {
        case 'cups':
            // Direct conversion from cups to grams
            converted.cups = `${quantity} cups`;
            converted.grams = (quantity * conversionInfo.cup_to_g).toFixed(1) + ' g';
            // Assuming conversion from grams to pieces if each_to_g is available
            if (conversionInfo.each_to_g) {
              let grams = quantity * conversionInfo.cup_to_g;
                converted.pieces = (grams / conversionInfo.each_to_g).toFixed(1) + ' pieces';
            }
            converted.tablespoons = (quantity * conversionInfo.cup_to_g / conversionInfo.tbsp_to_g).toFixed(1) + ' tbsp';
            break;
        case 'g':
            // Direct conversion for grams
            converted.grams = `${quantity} g`;
            // Conversion from grams to pieces if each_to_g is available
            if (conversionInfo.each_to_g) {
                converted.pieces = (quantity / conversionInfo.each_to_g).toFixed(1) + ' pieces';
            }
            // Conversions to cups and tablespoons
            converted.cups = (quantity / conversionInfo.cup_to_g).toFixed(1) + ' cups';
            converted.tablespoons = (quantity / conversionInfo.tbsp_to_g).toFixed(1) + ' tbsp';
            break;
        case 'tbsp':
            // Direct conversion from tablespoons to grams
            converted.tablespoons = `${quantity} tbsp`;
            converted.grams = (quantity * conversionInfo.tbsp_to_g).toFixed(1) + ' g';

            // Conversion from grams to pieces if each_to_g is available
            if (conversionInfo.each_to_g) {
              let grams = quantity * conversionInfo.tbsp_to_g;
                converted.pieces = (grams / conversionInfo.each_to_g).toFixed(1) + ' pieces';
             
              }
            converted.cups = (quantity * conversionInfo.tbsp_to_g / conversionInfo.cup_to_g).toFixed(1) + ' cups';
            break;
            case 'pieces':
              if (conversionInfo.each_to_g) {
                  converted.pieces = `${quantity} pieces`;
                  let grams = quantity * conversionInfo.each_to_g;
                  converted.grams = grams.toFixed(1) + ' g';
                  // Ensure conversion from grams to cups and tablespoons is only applied if relevant
                  if (conversionInfo.cup_to_g) {
                      converted.cups = (grams / conversionInfo.cup_to_g).toFixed(1) + ' cups';
                  }
                  if (conversionInfo.tbsp_to_g) {
                      converted.tablespoons = (grams / conversionInfo.tbsp_to_g).toFixed(1) + ' tbsp';
                  }
              } else {
                  console.error("Missing each_to_g conversion for pieces.");
                  return quantity + ' pieces'; // Fallback if no each_to_g conversion is available
              }
              break;
          
        default:
            console.error('Unit not recognized for conversion');
            return `${quantity} ${unit}`; // Return the original quantity and unit if it's not one of the above
    }
    
    // Combine the converted values, filtering out any "N/A" values
    return Object.values(converted).filter(val => val !== "N/A").join(', ');
  }    

  };
  
  const parseQuantities = (quantitiesText) => {
    const quantities = {
      grams: 0,
      cups: 0,
      tablespoons: 0,
      pieces:0
    };
  
    console.log(`Parsing quantities from text: ${quantitiesText}`);
    
    // Extract only the numeric parts with units
    const matches = quantitiesText.match(/(\d+\.?\d*\s*(g|grams?|cups?|tbsp|pieces))/gi);
    
    if (matches) {
      matches.forEach(match => {
        const parts = match.trim().split(/\s+/);
        
        if (parts.length === 2) {
          const [valueStr, unit] = parts;
          const value = parseFloat(valueStr);
  
          if (!isNaN(value)) {
            if (unit.match(/^g(ram(s)?)?$/i)) {
              quantities.grams += value;
            } else if (unit.match(/^cup(s)?$/i)) {
              quantities.cups += value;
            } else if (unit.match(/^tbsp$/i)) {
              quantities.tablespoons += value;
            }   else if (unit.match(/^(pieces)$/i)) {
              quantities.pieces += value; // Handle pieces or each
            } else {
              console.error(`Unrecognized unit: ${unit}`);
            }
          } else {
            console.error(`Invalid value for unit ${unit}: ${valueStr}`);
          }
        } else {
          console.error(`Incorrect format for quantities: ${match}`);
        }
      });
    } else {
      console.error(`No valid quantity-unit pairs found in text: ${quantitiesText}`);
    }
  
    console.log(`Parsed Quantities:`, quantities);
  
    return quantities;
  };
  
  
  
  

// Helper function to combine two objects of quantities
const combineQuantities = (quantities1, quantities2) => {
  const combined = { ...quantities1 };

  // Loop through quantities2 and add them to combined, initializing if necessary
  for (const unit of Object.keys(quantities2)) {
      if (combined[unit] !== undefined) {
          combined[unit] += quantities2[unit];
      } else {
          // Initialize if this unit wasn't in quantities1
          combined[unit] = quantities2[unit];
      }
  }

  return combined;
};


// Helper function to format an object of quantities into a text representation
const formatQuantities = (name, quantities) => {
  // Assuming quantities is an object like { grams: 100, cups: 1, tablespoons: 16 }
  const parts = [];
  if (quantities.grams) parts.push(`${quantities.grams.toFixed(1)} g`);
  if (quantities.cups) parts.push(`${quantities.cups.toFixed(1)} cups`);
  if (quantities.tablespoons) parts.push(`${quantities.tablespoons.toFixed(1)} tbsp`);
  if (quantities.pieces) parts.push(`${quantities.pieces.toFixed(1)} pieces`); // Include pieces in output

  console.log(`Formatted Quantities for ${name}:`, parts.join(', '));

  return `${name}: ${parts.join(', ')}`;
};

  
  const updateShoppingList = () => {
    let list = {};
  
    // Iterate through each recipe
    Object.keys(recipes).forEach((recipeId) => {
      const recipe = recipes[recipeId];
  
      // Only process recipes that have been selected
      if (recipe.count > 0) {
  
        // Iterate through each ingredient in the recipe
        recipe.ingredients.forEach((ingredient) => {
          const masterIngredient = masterIngredients.find((mi) => mi.name === ingredient.name);
  
          // Skip if there's no matching master ingredient
          if (!masterIngredient) return;
  
        // Inside updateShoppingList
// ...
if (typeof masterIngredient.conversion_info === 'string') {
  try {
    masterIngredient.conversion_info = JSON.parse(masterIngredient.conversion_info);
  } catch (e) {
    console.error('Error parsing conversion info:', e);
    return; // Skip this ingredient if conversion info is invalid
  }
}
// Calculate the total quantity needed for this recipe
const totalQuantity = ingredient.quantity * recipe.count;
// Ensure conversion_info is an object before attempting to use it
if (!masterIngredient.conversion_info || typeof masterIngredient.conversion_info !== 'object') {
  console.error('Conversion info is not an object:', masterIngredient.conversion_info);
  return; // Skip this ingredient if conversion info is not an object
}

// Now it's safe to use masterIngredient.conversion_info
const convertedQuantities = convertQuantities(totalQuantity, ingredient.unit, masterIngredient.conversion_info);



          // Construct the text representation of the ingredient
          const ingredientText = `${ingredient.name}: ${convertedQuantities}`;
  
           // Check if we already have this ingredient in the list
        if (list[ingredient.name]) {
          // Parse the existing quantities and the new quantities
          const existingQuantities = parseQuantities(list[ingredient.name].text);
          const newQuantities = parseQuantities(convertedQuantities);
          console.log(`Existing Quantities for ${ingredient.name}:`, existingQuantities);
          console.log(`New Quantities for ${ingredient.name}:`, newQuantities);
          // Combine the existing and new quantities
          const combinedQuantities = combineQuantities(existingQuantities, newQuantities);
          console.log(`Combined Quantities for ${ingredient.name}:`, combinedQuantities);

          // Update the text representation with combined quantities
          list[ingredient.name].text = formatQuantities(ingredient.name, combinedQuantities);
        } else {
          // If it's the first time this ingredient is being added, just set it
          list[ingredient.name] = { text: ingredientText };
        }



        console.log(`Converted Quantities Text for ${ingredient.name}:`, ingredientText);
      });

      
    }
  });
  
    // Combine entries with the same name and sum their quantities
    const combinedList = Object.values(list).reduce((acc, item) => {
      const existing = acc.find(entry => entry.name === item.name);
      if (existing) {
        existing.text += `; ${item.text}`;
      } else {
        acc.push({ ...item, name: item.name });
      }
      return acc;
    }, []);

    console.log(`Final Shopping List:`, Object.values(list).map(item => item.text));


    // Set the shopping list state with the combined and processed list
    setShoppingList(Object.values(list).map(item => item.text));
  };


  
  
  useEffect(() => {
    updateShoppingList();
  }, [recipes, masterIngredients]);
  
  
  
  
  


  const handleIncrement = (recipeId) => {
    setRecipes((prevRecipes) => ({
      ...prevRecipes,
      [recipeId]: {
        ...prevRecipes[recipeId],
        count: prevRecipes[recipeId].count + 1,
      },
    }));
  };
  
  const handleDecrement = (recipeId) => {
    setRecipes((prevRecipes) => ({
      ...prevRecipes,
      [recipeId]: {
        ...prevRecipes[recipeId],
        count: Math.max(prevRecipes[recipeId].count - 1, 0),
      },
    }));
  };
  

  

  return (
    <div className="text-[#616161] pt-32 pb-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-teal-600 mb-14 text-center">Shopping</h1>
      {currentUser ? (
        <div className="container mx-auto px-4">
          <div className="md:flex flex-row-reverse justify-between p-4">
    <div className="md:mx-10 w-full md:w-[25em] flex flex-col md:flex-row md:space-x-4">
  <div className="flex-1">
    <div className="p-4 bg-white  rounded-lg shadow-lg">
    {
  Object.values(recipes).some(recipe => recipe.count > 0) ? (
    <h4 className="text-teal-700 text-lg font-semibold mb-4 border-b-2 border-black-200">
      Selected Recipes
    </h4>
  ) : null
}
      <div className="flex-grow">
      <ul className="list-none pl-0 mb-4">
  {Object.entries(recipes).map(([recipeId, recipe]) =>
   recipe.count > 0 && (
    <li key={recipeId} className="rounded animate-fade-in p-2 mb-2 flex items-center gap-2 bg-gray-100">
      <span className="bg-gray-500 text-white py-1 px-2 rounded">
        x{recipe.count}
      </span>
      <span className="font-bold">
        {recipe.title}
      </span>
    </li>
  )
  
  )}
</ul>

        <h2 className="text-2xl text-teal-700 font-bold mb-4 border-b-2 border-black-200">Shopping List</h2>
        {Object.values(recipes).some(recipe => recipe.count > 0) ? (
          <ul className=" max-h-[25em] overflow-auto list-none">
    {shoppingList.map((itemString, index) => {
  const { name, grams, cups, tablespoons, pieces } = parseQuantityString(itemString);
  // Filter available units based on their existence and value
  const availableUnits = [
    { unit: 'grams', value: grams },
    { unit: 'cups', value: cups },
    { unit: 'tablespoons', value: tablespoons },
  ].concat(pieces && pieces !== "0 pieces" ? [{ unit: 'pieces', value: pieces }] : [])
   .map(item => item.unit);

  const currentIndex = currentUnitIndex[name] || 0;
  const currentUnit = availableUnits[currentIndex];
  const unitValue = { grams, cups, tablespoons, pieces }[currentUnit];
  const nextUnit = availableUnits[(currentIndex + 1) % availableUnits.length];

  return (
    <li key={index} className="animate-fade-in flex justify-between gap-3 items-center p-2 mb-1 bg-gray-100 rounded">
      <span className="font-bold">{name}: {unitValue}</span>
      <button 
        onClick={() => cycleUnit(name, availableUnits)}
        className="py-1 px-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
        {nextUnit.charAt(0).toUpperCase() + nextUnit.slice(1)}
      </button>
    </li>
  );
})}


    
          </ul>
        ) : (
          <div>Please select some recipes.</div>
        )}
      </div>
    </div>
  </div>
</div>



  

  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 py-5 md:p-4 bg-gray-50 rounded-lg md:shadow-lg">  {Object.entries(recipes).map(([recipeId, recipe], index) => (
    <div key={recipeId} 
         className={`relative flex flex-col justify-between p-0 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${recipe.count > 0 ? 'bg-[#58acbb] opacity-100' : 'bg-white opacity-70 hover:opacity-100'}`}>
      <img src={recipe.imageUrl || placeholderImg} alt={recipe.title} className="w-full h-[7rem] md:h-[10em] object-cover" />
      <div className="px-3 py-[0.4rem] py-0 flex-grow">
        <h2 className={`${recipe.count > 0 ? 'text-white' : 'text-green-800'} text-lg font-semibold mb-2`}>
          {recipe.title}
        </h2>
      </div>
      <div className="p-3 flex items-center justify-between">
        {recipe.count > 0 && (<>
          <button onClick={() => handleDecrement(recipeId)}
                  className="text-white p-1 rounded-full bg-[#58acbb] hover:bg-[#478a9b] transition-colors duration-300">
            <AiOutlineMinus className="h-6 w-6" />
          </button>        <span className={`text-lg ${recipe.count > 0 ? 'text-white' : 'text-black'}`}>{recipe.count}</span>
          </>
        )}
        {recipe.count < 1 && (
<span></span>)}
        <button onClick={() => handleIncrement(recipeId)}
                className="text-white p-1 right-0 rounded-full bg-[#58acbb] hover:bg-[#478a9b] transition-colors duration-300">
          <AiOutlinePlus className="h-6 w-6" />
        </button>
      </div>
    </div>
  ))}
</div>
</div>
</div>



        
      

    
      ) : (
        <div className="text-center">Please sign in to view recipes.</div>
      )}
    </div>
  );
                }          export default Shopping;