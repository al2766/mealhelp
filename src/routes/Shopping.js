import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import placeholderImg from "../assets/images/placeholderImg.png";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"; // Import icons for the counter


function Shopping() {
  const [currentUser, setCurrentUser] = useState(null);
  const [recipes, setRecipes] = useState({});
  const [shoppingList, setShoppingList] = useState([]);

  const [masterIngredients, setMasterIngredients] = useState([]);

  // ... other useEffect hooks

  useEffect(() => {
    const fetchMasterIngredients = async () => {
      try {
        let { data, error } = await supabase
          .from('ingredients_master')
          .select('*');
  
        if (error) throw error;
  
        setMasterIngredients(data);
      } catch (error) {
        console.error("Error fetching master ingredients:", error.message);
      }
    };
  
    fetchMasterIngredients();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user);
      if (session?.user) {
        await fetchRecipes(session.user.id);
      }
    };
    fetchUserData();
  }, []);

  const fetchRecipes = async (userId) => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId);
  
    if (error) {
      console.error("Error fetching recipes", error);
      return;
    }
  
    const formattedData = {};
    for (const recipe of data) {
      try {
        let imageUrl = placeholderImg;
        if (recipe.image_url) {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('recipe-pics')
            .getPublicUrl(recipe.image_url);
  
          if (urlData && !urlError) {
            imageUrl = urlData.publicUrl;
          }
        }
  
        formattedData[recipe.id] = { // Using recipe.id as key
          title: recipe.title,
          count: 0,
          ingredients: JSON.parse(recipe.ingredients),
          imageUrl
        };
      } catch (e) {
        console.error(`Error parsing ingredients for recipe ${recipe.title}`, e);
        formattedData[recipe.id] = { title: recipe.title, count: 0, ingredients: [], imageUrl: placeholderImg };
      }
    }
  
    setRecipes(formattedData);
  };
  
  

  
  
  const convertQuantities = (quantity, unit, conversionInfo) => {
    // Initialize converted quantities
    let converted = {
      grams: null,
      cups: null,
      tablespoons: null,
    };
  
    // Validate conversionInfo
    if (conversionInfo && typeof conversionInfo === 'object') {
      // Proceed with conversion based on the unit
      switch (unit) {
        case 'cups':

          converted.cups = quantity  + ' cups';
          converted.grams = (quantity * conversionInfo.cup_to_g).toFixed(1) + ' g';
          converted.tablespoons = (quantity * (conversionInfo.cup_to_g / conversionInfo.tbsp_to_g)).toFixed(1) + ' tbsp';
          break;
        case 'g':
          converted.grams = quantity + ' g';
          converted.cups = (quantity / conversionInfo.cup_to_g).toFixed(1) + ' cups';
          converted.tablespoons = (quantity / conversionInfo.tbsp_to_g).toFixed(1) + ' tbsp';
          break;
        case 'tbsp':
          converted.tablespoons = quantity + ' tbsp';
          converted.grams = (quantity * conversionInfo.tbsp_to_g).toFixed(1) + ' g';
          converted.cups = (quantity * conversionInfo.tbsp_to_g / conversionInfo.cup_to_g).toFixed(1) + ' cups';
          break;
        default:
          console.error('Unit not recognized for conversion');
          return quantity + ' ' + unit; // Return the original quantity and unit if it's not one of the above
      }
    } else {
      console.error('Invalid or missing conversion info');
      return `${quantity} ${unit}`; // Return the original quantity and unit if conversion info is missing
    }
  
    console.log(`Converted Quantities for ${quantity} ${unit}:`, converted);

    // Filter out null values and join the string to form the final converted text
    return Object.values(converted).filter(Boolean).join(', ');

  };
  
  const parseQuantities = (quantitiesText) => {
    const quantities = {
      grams: 0,
      cups: 0,
      tablespoons: 0,
    };
  
    console.log(`Parsing quantities from text: ${quantitiesText}`);
    
    // Extract only the numeric parts with units
    const matches = quantitiesText.match(/(\d+\.?\d*\s*(g|grams?|cups?|tbsp))/gi);
    
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
  // Assuming that both quantities objects have the same structure
  const combined = { ...quantities1 };

  for (const unit in combined) {
    if (quantities2[unit] !== undefined) {
      combined[unit] += quantities2[unit];
    }
  }
  console.log(`Combined Quantities:`, combined);

  return combined;
};

// Helper function to format an object of quantities into a text representation
const formatQuantities = (name, quantities) => {
  // Assuming quantities is an object like { grams: 100, cups: 1, tablespoons: 16 }
  const parts = [];
  if (quantities.grams) parts.push(`${quantities.grams.toFixed(1)} g`);
  if (quantities.cups) parts.push(`${quantities.cups.toFixed(1)} cups`);
  if (quantities.tablespoons) parts.push(`${quantities.tablespoons.toFixed(1)} tbsp`);

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
    <div className="pt-32 pb-8 min-h-screen bg-white-100">
      <h1 className="text-4xl font-bold text-teal-600 mb-14 text-center">Shopping</h1>
      {currentUser ? (
        <div className="container mx-auto px-4">
          <div className=" p-4 rounded-lg mb-14">
            <h2 className="text-2xl font-bold mb-4  border-b-2 border-black-200">Shopping List</h2>
            {Object.values(recipes).some(recipe => recipe.count > 0) ? (
              <>
<ul className="list-none">
  {shoppingList.map((item, index) => (
    <li key={index} className="animate-fade-in flex gap-3 items-center p-2 mb-1">
      {item}
    </li>
  ))}
</ul>



                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-4 border-b-2 border-black-200">Selected Recipes</h3>
                  <ul className="list-none pl-0">
                    {Object.entries(recipes).map(([recipeId, recipe]) =>
                      recipe.count > 0 && (
                        <li key={recipeId} className={`rounded text-center text-white animate-fade-in p-2 mb-2 bg-[#58acbb]`}>{recipe.title}</li>
                      )
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className=" text-teal-700">Please select some recipes.</div>
            )}
          </div>
  
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
  {Object.entries(recipes).map(([recipeId, recipe], index) => (
    <div key={recipeId} 
         className={`relative flex flex-col justify-between p-0 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${recipe.count > 0 ? 'bg-[#58acbb] opacity-100' : 'bg-white opacity-70 hover:opacity-100'}`}>
      <img src={recipe.imageUrl || placeholderImg} alt={recipe.title} className="w-full h-[9rem] object-cover" />
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



        
      

    
      ) : (
        <div className="text-center">Please sign in to view recipes.</div>
      )}
    </div>
  );
                }          export default Shopping;