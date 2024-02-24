import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import placeholderImg from "../assets/images/placeholderImg.png";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"; // Import icons for the counter


function Shopping() {
  const [currentUser, setCurrentUser] = useState(null);
  const [recipes, setRecipes] = useState({});
  const [shoppingList, setShoppingList] = useState([]);

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
  
  

  const updateShoppingList = () => {
    let list = {};
    Object.keys(recipes).forEach((recipeTitle) => {
      const recipe = recipes[recipeTitle];
      if (recipe.count > 0) {
        recipe.ingredients.forEach((ingredient) => {
          if (list[ingredient.name]) {
            list[ingredient.name].quantity +=
              ingredient.quantity * recipe.count;
          } else {
            list[ingredient.name] = {
              ...ingredient,
              quantity: ingredient.quantity * recipe.count,
            };
          }
        });
      }
    });
    setShoppingList(Object.values(list));
  };

  useEffect(() => {
    updateShoppingList();
  }, [recipes]);

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
                    <li key={item.name} className={`animate-fade-in flex gap-3 items-center p-2 mb-1  `}>
                      <span className="text-teal-700">{item.name}</span>
                      <strong className="text-teal-900">{item.quantity} {item.unit}</strong>
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