import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { db } from "../firebase"; // Adjust the import path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from '../AuthProvider'; // Import your auth provider if you have one
import placeholderImg from "../assets/images/placeholderImg.png";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const { currentUser } = useAuth(); // This assumes you're using an AuthProvider to manage user state

  useEffect(() => {
    if (currentUser?.uid) { // Ensure we have the current user's ID
      fetchRecipes(currentUser.uid);
    }
  }, [currentUser]);

  const fetchRecipes = async (userId) => {
    try {
      const recipesColRef = collection(db, 'recipes');
      const q = query(recipesColRef, where("user_id", "==", userId));
      const querySnapshot = await getDocs(q);
      const recipesList = [];

      querySnapshot.forEach((doc) => {
        let recipe = doc.data();
        recipe.id = doc.id; // Include the document ID (recipe ID) in the recipe object
        recipe.image_url = recipe.image_url ? recipe.image_url : placeholderImg; // Use placeholder if no image URL
        recipesList.push(recipe);
      });

      setRecipes(recipesList);
    } catch (error) {
      console.error("Error fetching recipes", error);
    }
  };

  return (
    <div className="pt-32 bg-gray-100 pb-8 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-teal-600 mb-14 text-center">Recipes</h1>
        {currentUser ? (
          recipes.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {recipes.map((recipe, index) => (
              <li
                key={recipe.id}
                className={`rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out animate-fadeInUp`}
                style={{
                  animationDelay: `${index * 100}ms`, // Apply delay directly
                  opacity: 0 // Start with item invisible to see animation
                }}
              >
                <div className="relative">
                  <Link to={`/recipes/${recipe.id}`} className="block">
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-[10rem] object-cover" />
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-green-800 mb-2">{recipe.title}</h2>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          
          
          
          
          ) : (
            <div className="text-center">Please add some recipes.</div>
          )
        ) : (
          <div className="text-center">Please sign in to view recipes.</div>
        )}
      </div>
    </div>
  );
}

export default Home;
