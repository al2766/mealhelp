import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import placeholderImg from "../assets/images/placeholderImg.png";



function Home() {
  const [recipes, setRecipes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  


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
      .from('recipes')
      .select('*')
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching recipes", error);
      return;
    }

    const recipesWithImages = await Promise.all(data.map(async (recipe) => {
      let imageUrl = placeholderImg;      if (recipe.image_url) {
        const { data: imgData, error: imgError } = await supabase.storage
          .from('recipe-pics') // Replace with your actual Supabase storage bucket name
          .getPublicUrl(recipe.image_url);

        if (imgData && !imgError) {
          imageUrl = imgData.publicUrl;
        }
      }
      return { ...recipe, image_url: imageUrl };
    }));

    setRecipes(recipesWithImages);
  };

  return (
    <div className="pt-32 pb-8 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-teal-600 mb-14 text-center">Recipes</h1>
        {currentUser ? (
          recipes.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {recipes.map(recipe => (
                <li key={recipe.id} className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
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