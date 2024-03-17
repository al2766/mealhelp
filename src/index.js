import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./routes/Footer";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import Shopping from "./routes/Shopping";
import RecipeDetail from './routes/RecipeDetail';
import AddRecipe from './routes/AddRecipe';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthProvider'; // Update this path to the correct one




import "./App.css";

const AppLayout = () => {
  // Create a ref for the Contact component
  const contactRef = useRef();

  // Function to handle the "Contact us" button click and scroll to the Contact component
  const handleContactClick = () => {
    scrollToContact();
  };

  // Function to scroll to the Contact component
  const scrollToContact = () => {
    if (contactRef.current) {
      const contactTop = contactRef.current.offsetTop;
      const scrollY = window.scrollY;

      const distanceToContact = contactTop - scrollY;
      const scrollDuration = 300; // Adjust the scroll duration as needed

      const startTime = performance.now();

      const scrollStep = (timestamp) => {
        const currentTime = timestamp - startTime;
        const progress = Math.min(currentTime / scrollDuration, 1);
        const scrollTo = scrollY + distanceToContact * progress;

        window.scrollTo(0, scrollTo);

        if (currentTime < scrollDuration) {
          requestAnimationFrame(scrollStep);
        }
      };

      requestAnimationFrame(scrollStep);
    }
  };

  return (
    <>
      <Navbar handleContactClick={handleContactClick} />
      <Outlet />
      <div ref={contactRef}>

      </div>
      <ScrollToTop />
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "shopping", element: <Shopping /> },
      { path: "addrecipe", element: <AddRecipe /> },
      { path: "recipes/:recipeId", element: <RecipeDetail /> }, // New route for individual recipes
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <AuthProvider>
 <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      className="toast-position"
      style={{ top: '6em' }}

      />
  <RouterProvider router={router} />
  </AuthProvider>
  </React.StrictMode>
);
