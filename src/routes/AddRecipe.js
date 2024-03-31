import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid
import Modal from '../components/Modal'; // Adjust the import path according to your file structure
import { toast } from 'react-toastify';
import { MdDelete } from 'react-icons/md';
import { useAuth } from '../AuthProvider'; // Import the hook
import { db } from '../firebase'; // Adjust the import path as needed
import { collection, getDoc, getDocs, query, where, addDoc, doc, setDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";






export default function AddRecipe() {
  const [bulkIngredientsList, setBulkIngredientsList] = useState([]);
  const ingredientListRef = useRef(null);

  const [stepTransition, setStepTransition] = useState('fade-enter'); // Initialize directly with 'fade-enter'
  const [navigationDirection, setNavigationDirection] = useState('forward');
  const { currentUser, signUp, signIn, signOutUser, authError } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);
  const [bulkIngredientsCSV, setBulkIngredientsCSV] = useState('');
  const [ingredientNames, setIngredientNames] = useState([]);
  const [chatGPTPrompt, setChatGPTPrompt] = useState('');
  const [bulkModalStep, setBulkModalStep] = useState(0); // 0: Enter Ingredients, 1: Show Prompt, 2: Add Bulk Ingredients
  const [masterIngredients, setMasterIngredients] = useState([]);
  const fileInputRef = useRef(null);
  const [instructions, setInstructions] = useState([""]);
  const [imageFile, setImageFile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Adjust based on how many questions you have
  const [isIngredientSelected, setisIngredientSelected] = useState(true); // New state for success modal
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startFadeOut, setStartFadeOut] = useState(false);
  const [showNewIngredientModal, setShowNewIngredientModal] = useState(false);
  const [showNewBulkIngredientModal, setShowNewBulkIngredientModal] = useState(false);
  const [newIngredientDetails, setNewIngredientDetails] = useState({
    name: '',
    nutrient_info: {
      fat: '',
      carbs: '',
      protein: '',
      calories: '',
    },
    conversion_info: {
      cup_to_g: '',
      each_to_g: '',
      tbsp_to_g: '',
    },
  });

  // Define the animation classes based on navigation direction and transition state
const animationEnterClass = navigationDirection === 'forward' ? 'fade-enter' : 'fade-enter-reverse';
const animationExitClass = navigationDirection === 'forward' ? 'fade-exit' : 'fade-exit-reverse';

// Choose enter or exit class based on the step transition state
const appliedClass = stepTransition.includes('enter') ? animationEnterClass : animationExitClass;

const toggleForm = () => {
  const direction = isSigningUp ? 'backward' : 'forward'; // Reverse direction based on current form
  setNavigationDirection(direction);
  setStepTransition('fade-exit');

  setTimeout(() => {
    setIsSigningUp(!isSigningUp);
    setStepTransition('fade-enter');
  }, 300); // Delay to match exit animation
};

const moveToPreviousBulkStep = () => {
  if (bulkModalStep > 0) {
    setNavigationDirection('backward');
    setStepTransition('fade-exit-reverse');
    setTimeout(() => {
      setBulkModalStep((prevStep) => prevStep - 1);
      setStepTransition('fade-enter-reverse');
    }, 300); // Match the timing with your CSS animations
  }
};




const handleGeneratePrompt = () => {
  // Animation and Navigation setup
  setNavigationDirection('forward');
  setStepTransition('fade-exit');
  setTimeout(() => {
    // Your existing logic
    const instructions = "Please fill in the following template with accurate measurements for each ingredient listed. you must Include 'cup_to_g' for the conversion from cups to grams, 'tbsp_to_g' for tablespoons to grams and, if applicable, append 'each_to_g' for applicable ingredients, whilst still keeping 'cup_to_g' and 'tbsp_to_g'. with the value for the weight of a standard piece or unit in grams or don't append. Here's an empty template to start with:";
    const ingredientList = ingredientNames.length > 0 ? `${instructions}\n`+ingredientNames.map(name => `Name: ${name}; cup_to_g: 0; tbsp_to_g: 0;`).join("\n") : "Please add ingredients first.";
    const generatedPrompt = `${ingredientList}`;
    setChatGPTPrompt(generatedPrompt);
    setBulkModalStep(1); // Move to the next step
    setStepTransition('fade-enter');
  }, 300); // Adjust timing to match your CSS animations
};

  
const handleCopyPrompt = () => {
  setNavigationDirection('forward');
  setStepTransition('fade-exit');
  setTimeout(() => {
    setBulkModalStep(2); // Move to the next step
    setStepTransition('fade-enter');
  }, 300); // Adjust timing to match your CSS animations
};

  
const handleSubmitBulkIngredients = () => {

  setTimeout(() => {
    handleAddBulkIngredient(); // Your existing logic to add bulk ingredients
    // After adding ingredients, if you want to close the modal with an animation, you could do it here.
    // setShowNewBulkIngredientModal(false); // Optionally reset or close the modal
    // setStepTransition('fade-enter');
  }, 300); // Adjust if you're applying a closing animation
};

const checkAndApplyScrollMask = (elementRef) => {
  const element = elementRef.current;
  if (!element) return;

  const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

  if (atBottom) {
    // If scrolled to the bottom, remove the mask
    element.classList.remove('scrollable-mask');
  } else {
    // If not at the bottom, add the mask if necessary
    const hasOverflowingContent = element.scrollHeight > element.clientHeight;
    if (hasOverflowingContent) {
      element.classList.add('scrollable-mask');
    } else {
      element.classList.remove('scrollable-mask');
    }
  }
};


useEffect(() => {
  // Ensure that the DOM element is available before attaching the event listener
  const listElement = ingredientListRef.current;
  if (!listElement) return; // <- Add this check

  const handleScroll = () => {
    // Call the checkAndApplyScrollMask only if listElement exists
    if (listElement) checkAndApplyScrollMask(ingredientListRef);
  };

  // Add the event listener
  listElement.addEventListener('scroll', handleScroll);

  // Initial check
  checkAndApplyScrollMask(ingredientListRef);

  // Check on window resize
  const handleResize = () => {
    if (listElement) checkAndApplyScrollMask(ingredientListRef);
  };
  window.addEventListener('resize', handleResize);

  // Cleanup function
  return () => {
    if (listElement) {
      // Ensure the listElement exists before removing the event listener
      listElement.removeEventListener('scroll', handleScroll);
    }
    window.removeEventListener('resize', handleResize);
  };
}, [ingredientNames, ingredientListRef]); // Depend on ingredientNames as it affects the content height

  
const handleKeyDown = (e) => {
  // Handle the Enter key, but not when combined with the Shift key (to allow line breaks)
  if (e.key === 'Enter' && !e.shiftKey) {
    const currentValue = e.target.value.trim();
    if (currentValue) {
      // Split the current value by lines
      const lines = currentValue.split('\n');
      // Add each line as a separate ingredient
      setIngredientNames(prev => [...prev, ...lines.filter(line => line.trim() !== '')]);
      // Clear the textarea
      e.target.value = '';
      // Prevent the default action to avoid creating a new line
      e.preventDefault();
    }
  }
};

const handlePaste = (e) => {
  const pastedText = e.clipboardData.getData('text');
  const lines = pastedText.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 0) {
    setIngredientNames(prev => [...prev, ...lines]);
    e.preventDefault(); // Prevent the default paste action
  }
};
 
const removeIngredient = (indexToRemove) => {
  setIngredientNames((currentIngredients) =>
    currentIngredients.filter((_, index) => index !== indexToRemove)
  );
};

  const renderBulkStepContent = () => {

     // Determine the applied classes based on the navigation direction and step transition state
     const animationClass = `${stepTransition} ${
      navigationDirection === 'forward' ? (stepTransition.includes('enter') ? 'fade-enter' : 'fade-exit') : (stepTransition.includes('enter') ? 'fade-enter-reverse' : 'fade-exit-reverse')
  }`;



    switch (bulkModalStep) {
      case 0:
        // Content for entering ingredients
        return (
          <div className={`modal-content ${animationClass}`}>
            <h2 className="text-xl font-semibold mb-4">Input Ingredients</h2>
            <textarea
              className="w-full h-26 p-4 border rounded-md"
              placeholder="Enter ingredients (paste or type and hit Enter)..."
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            ></textarea>
            <div ref={ingredientListRef}  className="flex flex-col mt-4 overflow-auto max-h-[16em] scrollable-mask">
              {ingredientNames.map((name, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-200 p-2 rounded mt-2">
                  <span>{name}</span>
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-xl bg-gray-200 hover:bg-gray-300 transition duration-300 text-black p-1 rounded"
                    aria-label={`Remove ${name}`}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 1:
        // Content for displaying the ChatGPT prompt
        return (
          <div className={`modal-content ${animationClass}`}>
<h2 className="text-xl font-semibold mb-4">ChatGPT Prompt</h2>
    <p className="text-teal-600 mb-5">Copy this prompt into ChatGPT & use the reply in the next screen:</p>
    <textarea
      readOnly
      className="w-full h-36 p-4 border rounded-md mb-4"
      value={chatGPTPrompt}
    ></textarea>
    <div className="flex justify-between items-center">
      <button
        onClick={() => {
          navigator.clipboard.writeText(chatGPTPrompt);
          toast.success("Prompt copied to clipboard!");
        }}
        className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded transition duration-300 hover:bg-[#3e7983]"
      >
        Copy
      </button>
    
    </div>          </div>
        );
      case 2:
        // Content for pasting and processing the ChatGPT response for bulk ingredients
        return (
          <div className={`modal-content ${animationClass}`}>
 <h2 className="text-xl font-semibold mb-4">Add Bulk Ingredients</h2>
    <textarea
      className="w-full h-64 p-4 border rounded-md"
      placeholder={`Example format:
Name: Apple; cup_to_g: 125; tbsp_to_g: 7.81; each_to_g: 182; calories: 52; protein: 0.3; fat: 0.2; carbs: 14
Name: Sugar (Granulated); cup_to_g: 200; tbsp_to_g: 12.5; calories: 387; protein: 0; fat: 0; carbs: 100`}
      value={bulkIngredientsCSV}
      onChange={(e) => setBulkIngredientsCSV(e.target.value)}
    ></textarea>
    <div className="flex justify-end mt-4">
     
    </div>          </div>
        );
      default:
        return null;
    }
  };

  
  
  
  const moveToNextStep = () => {
    if (currentStep < totalSteps) {
      setNavigationDirection('forward');
      setStepTransition('fade-exit');
      setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1);
        setStepTransition('fade-enter');
      }, 300); // Adjust timing as needed
    }
  };
  
  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      setNavigationDirection('backward');
      setStepTransition('fade-exit-reverse');
      setTimeout(() => {
        setCurrentStep((prevStep) => prevStep - 1);
        setStepTransition('fade-enter-reverse');
      }, 300); // Adjust timing as needed
    }
  };
  

  const renderCurrentStepContent = () => {

    switch (currentStep) {
      case 1:
        return (
<div className={`modal-content ${stepTransition} ${navigationDirection === 'forward' ? 'fade-enter' : 'fade-enter-reverse'}`}>

          <div className="flex flex-col items-center gap-4">
          <h2 className="text-gray-600 text-xl font-semibold mb-4">Ingredient Name</h2>
          <div className="py-5">
          <input
            type="text"
            placeholder="Ingredient Name"
            value={newIngredientDetails.name}
            onChange={(e) => setNewIngredientDetails({...newIngredientDetails, name: e.target.value})}
            className="border border-gray-200 text-gray-700 rounded py-2 px-4 w-full" // Use full width for consistency
          />
          </div>
        </div>
        </div>
        
        );
      case 2:
        return (
<div className={`modal-content ${stepTransition} ${navigationDirection === 'forward' ? 'fade-enter' : 'fade-enter-reverse'}`}>

          <div className="flex gap-4 flex-col items-center">
          <h2 className="text-gray-600 text-xl font-semibold mb-4">Grams in 1 Cup</h2>
          <div className="flex items-center justify-between space-x-2 w-full py-5">
            <input
              type="number"
              placeholder="Grams in 1 cup"
              value={newIngredientDetails.conversion_info.cup_to_g}
              onChange={(e) => setNewIngredientDetails({...newIngredientDetails, conversion_info: {...newIngredientDetails.conversion_info, cup_to_g: e.target.value}})}
              className="border border-gray-200 text-gray-700 rounded py-2 px-4 w-3/6"
            />
            <button
              onClick={() => window.open(`https://www.google.com/search?q=how+many+grams+in+one+cup+of+${encodeURIComponent(newIngredientDetails.name)}`, '_blank')}
              className="bg-purple-500 transition duration-300 hover:bg-purple-700 text-white font-bold py-2 w-3/6 rounded inline-flex items-center justify-center"
            >
              Find Out ?
            </button>
          </div>
        </div>
        </div>
       
        
        );
      case 3:
        return (
<div className={`modal-content ${stepTransition} ${navigationDirection === 'forward' ? 'fade-enter' : 'fade-enter-reverse'}`}>

          <div className="flex gap-4 flex-col items-center">
          <h2 className="text-gray-600 text-xl font-semibold mb-4">Grams in 1 Tbsp</h2>
  <div className="flex items-center justify-between space-x-2 w-full py-5">
    <input
      type="number"
      placeholder="Grams in 1 tbsp"
      value={newIngredientDetails.conversion_info.tbsp_to_g}
      onChange={(e) => setNewIngredientDetails({...newIngredientDetails, conversion_info: {...newIngredientDetails.conversion_info, tbsp_to_g: e.target.value}})}
      className="border border-gray-200 text-gray-700 rounded py-2 px-4 w-3/6"
    />
    <button
      onClick={() => window.open(`https://www.google.com/search?q=how+many+grams+in+one+tablespoon+of+${encodeURIComponent(newIngredientDetails.name)}`, '_blank')}
      className="transition duration-300 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 w-3/6 rounded inline-flex items-center justify-center"
    >
      Find Out ?
    </button>
  </div>
</div>
</div>

        );
      case 4:
        return (
<div className={`modal-content ${stepTransition} ${navigationDirection === 'forward' ? 'fade-enter' : 'fade-enter-reverse'}`}>

          <div className="flex gap-2">
          <div className="flex flex-col gap-4 items-center ">
          <h2 className="text-gray-600 text-xl font-semibold mb-4">Grams per piece (optional)</h2>
                         
                         <div className="flex flex-row items-center justify-between space-x-2 py-5 w-full">
  <input
    type="number"
    placeholder="Grams in 1 piece"
    value={newIngredientDetails.conversion_info.each_to_g || ''}
    onChange={(e) => setNewIngredientDetails({...newIngredientDetails, conversion_info: {...newIngredientDetails.conversion_info, each_to_g: e.target.value}})}
    className="border border-gray-200 text-gray-700 rounded py-2 px-4 w-3/6" // Adjusted classes here
  />
  <button
    onClick={() => window.open(`https://www.google.com/search?q=how+many+grams+in+one+piece+of+${encodeURIComponent(newIngredientDetails.name)}`, '_blank')}
    className="transition duration-300 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 w-3/6 rounded inline-flex items-center justify-center"
  >
    Find Out ?
  </button>
</div>

         </div>
         </div>
         </div>
        );
      case 5:
        return (
<div className={`modal-content ${stepTransition} ${navigationDirection === 'forward' ? 'fade-enter' : 'fade-enter-reverse'}`}>

          <div className="flex flex-col items-center justify-center space-y-4 bg-white rounded-lg shadow">
          <h2 className="text-xl text-gray-600 font-semibold mb-4">Confirm Details</h2>
            <div className="text-center p-4 bg-gray-100 rounded-lg w-full">
              <p className="pb-2 border-b border-gray-300"><strong>Name:</strong> {newIngredientDetails.name}</p>
              <p className="py-2 border-b border-gray-300"><strong>Grams in 1 Cup:</strong> {newIngredientDetails.conversion_info.cup_to_g}</p>
              <p className="py-2 border-b border-gray-300"><strong>Grams in 1 Tbsp:</strong> {newIngredientDetails.conversion_info.tbsp_to_g}</p>
              {newIngredientDetails.conversion_info.each_to_g && (
                <p className="pt-2"><strong>Grams per Piece:</strong> {newIngredientDetails.conversion_info.each_to_g}</p>
              )}
            </div>
           
          </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const handleSignUp = () => {
    toast.promise(
      signUp(email, password, confirmPassword),
      {
        pending: 'Signing up...',
        success: 'Sign up successful! Logging you in...',
        error: {
          render({data}) {
            // data is the error message from the promise rejection
            return `Error: ${data}`;
          }
        }
      }
    );
  };
  
  const handleSignIn = () => {
    toast.promise(
      signIn(email, password),
      {
        pending: 'Signing in...',
        success: 'Sign in successful!',
        error: {
          render({data}) {
            return `Error: ${data}`;
          }
        }
      }
    );
  };
  
 // And use it with toast.promise in handleSignOut
const handleSignOut = () => {
  toast.promise(
    signOutUser(),
    {
      pending: 'Signing out...',
      success: 'Signed out successfully!',
      error: {
        render({data}) {
          return `Error: ${data}`;
        }
      }
    }
  );
};

  
 

  const PUBLIC_USER_ID = 'cJdHi6LhyAdlCnUpMlJ0u2KiDJF2'; // Replace with the actual ID of the owner account used for public recipes


  const fetchIngredientsMaster = async () => {
    // Reference to the ingredients_master collection
    const ingredientsMasterRef = collection(db, 'ingredients_master');
  
    let queryConstraints = [];
  
    // Check if there is a logged-in user and if they are not the owner
    if (currentUser && currentUser.uid !== PUBLIC_USER_ID) {
      // Fetch ingredients that are either public or belong to the current user
      queryConstraints = [
        where("user_id", "in", [PUBLIC_USER_ID, currentUser.uid])
      ];
    } else if (!currentUser || currentUser.uid === PUBLIC_USER_ID) {
      // If not logged in or if it is the owner account, fetch only public ingredients
      queryConstraints = [where("user_id", "==", PUBLIC_USER_ID)];
    }
  
    try {
      // Apply the query constraints
      const q = query(ingredientsMasterRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
    
      // Map through documents and format them into an array of ingredients
      const ingredientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    
      // Update your state with the fetched ingredients
      setMasterIngredients(ingredientsList);
    } catch (error) {
      console.error("Error fetching ingredients from Firestore:", error.message);
    }
  };
  
  

  useEffect(() => {
    fetchIngredientsMaster();
  }, [currentUser?.uid]); // React to changes in currentUser.uid
  
  
  

  // ... existing functions

 const resetForm = () => {
  setTitle("");
  setIngredients([{ name: "", quantity: "", unit: "" }]);
  setInstructions([{ text: "" }]);
  setImageFile(null);
  setImagePreview(null); // Also clear the image preview state
  if (fileInputRef.current) {
    fileInputRef.current.value = ""; // Clear the file input visually
  }
};


  const uploadImage = async (imageFile) => {
    if (!imageFile) {
        console.error("No image file provided");
        return null;
    }

    // Ensure that there's a current user with a UID before proceeding
    if (!currentUser || !currentUser.uid) {
        console.error("No current user or user ID unavailable");
        return null;
    }

    const storage = getStorage();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${currentUser.uid}/${uuidv4()}.${fileExtension}`;
    const filePath = `recipeImages/${fileName}`;
    const fileRef = storageRef(storage, filePath);

    try {
        // Upload the file
        await uploadBytes(fileRef, imageFile);

        // Get the URL of the uploaded file
        const url = await getDownloadURL(fileRef);

        // Return the URL of the file
        return url;
    } catch (error) {
        console.error("Error uploading image to storage:", error);
        return null;
    }
};




  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleIngredientChange = (index, e) => {
    const newIngredients = ingredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [e.target.name]: e.target.value };
      }
      return ingredient;
    });
    setIngredients(newIngredients);
  };

  const addIngredientInput = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
    setisIngredientSelected(false);
  };

  const removeIngredientInput = (index) => {
    // Apply fade-out animation
    const ingredientElement = document.getElementById(`ingredient-input-${index}`);
    if (ingredientElement) {
      ingredientElement.classList.add('fade-out-and-collapse');
  
      // Remove the ingredient from state after animation completes
      setTimeout(() => {
        setIngredients(currentIngredients =>
          currentIngredients.filter((_, i) => i !== index)
        );
      }, 100); // Animation duration
    }
  };
  
  
  const removeInstructionInput = (index) => {
    // Apply fade-out animation
    const instructionElement = document.getElementById(`instruction-input-${index}`);
    if (instructionElement) {
      instructionElement.classList.add('fade-out-and-collapse');
      
      // Remove the instruction from state after animation completes
      setTimeout(() => {
        setInstructions(currentInstructions =>
          currentInstructions.filter((_, i) => i !== index)
        );
      }, 100); // Match this with the CSS animation duration
    }
  };
  const handleInstructionChange = (index, e) => {
    const newInstructions = instructions.map((instruction, i) => {
      if (i === index) {
        return e.target.value;
      }
      return instruction;
    });
    setInstructions(newInstructions);
  };

  const addInstructionInput = () => {
    setInstructions([...instructions, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if all ingredients have a name selected
    const allIngredientsFilled = ingredients.every((ingredient) => ingredient.name !== "");
  
    if (!allIngredientsFilled) {
      toast.error("Please fill in all the ingredient names.");
      return; // Prevent form submission if validation fails
    }
  
    // Check if at least one ingredient has a name selected
    const IngredientSelected = ingredients.some((ingredient) => ingredient.name !== "");
  
    if (!IngredientSelected) {
      toast.error("Please select at least one ingredient.");
      return; // Prevent form submission if validation fails
    }
  
    const formattedInstructions = instructions.map((instr, index) => ({
      stepNumber: index + 1,
      text: instr,
    }));

    setIsLoading(true);
    toast.promise(
      async () => {
          let imageUrl = null;
          // If there's an image file, upload it and get the URL
          if (imageFile) {
              imageUrl = await uploadImage(imageFile);
          }

          // Ensure you handle the null case if the image wasn't uploaded
          if (imageFile && !imageUrl) {
              throw new Error("Failed to upload image.");
          }
    
        const userId = currentUser?.uid; // Get UID from the authenticated user
        if (!userId) throw new Error("No user logged in");
    
        // This function adds the recipe to Firestore and needs to be defined
        await addRecipeToFirestore(title, ingredients, formattedInstructions, imageUrl, userId);
      },
      {
        pending: 'Adding recipe...',
        success: 'Recipe added successfully!',
        error: 'Error adding recipe.'
      }
    ).then(() => {
      // Reset form and state variables upon successful recipe addition
      resetForm(); // Implement this function to reset your form fields
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error adding recipe:", error);
      setIsLoading(false);
    });
    
  };
  const sanitizeTitleForId = (title) => {
    return title.replace(/\s+/g, '_').toLowerCase();
  };
  
  

  const addRecipeToFirestore = async (title, ingredients, formattedInstructions, imageUrl, userId) => {

    const sanitizedTitle = sanitizeTitleForId(title);

    try {
      const recipeDocRef = doc(db, "recipes", sanitizedTitle); // Use sanitizedTitle as document ID
      await setDoc(recipeDocRef, {

      title: title,
        ingredients: ingredients,
        instructions: formattedInstructions,
        image_url: imageUrl,
        user_id: userId
      });
      console.log("Document written with ID: ", sanitizedTitle);
      return sanitizedTitle; // This will return the new document's ID
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    fetchIngredientsMaster(); // Initial fetch when component mounts
  }, []); // Empty dependency array ensures this runs only once at mount

  const handleAddIngredient = async () => {
    if (currentUser) {
      const ingredientNameCapitalized = newIngredientDetails.name.replace(/\b\w/g, c => c.toUpperCase());
     // Check if the ingredient name is empty
  if (!newIngredientDetails.name.trim()) {
    toast.error("Please fill in the ingredient name.");
    return; // Exit the function if the name is empty
  }

  const { each_to_g, ...requiredConversionInfo } = newIngredientDetails.conversion_info;


  // Check if any of the nutrient info fields are empty
  const conversionInfoValues = Object.values(requiredConversionInfo);
  if (conversionInfoValues.some(value => !value.trim())) {
    toast.error("Please fill in all conversion information fields.");
    return; // Exit the function if any nutrient info field is empty
  }
      // Define the Firestore collection where you want to add the new ingredient
      const ingredientDocRef = doc(db, "ingredients_master", ingredientNameCapitalized); // Directly referencing the document by name
  
      // Wrap the async operation with toast.promise
      toast.promise(
        (async () => {
          const docSnap = await getDoc(ingredientDocRef);
          if (docSnap.exists()) {
            throw new Error("Ingredient already exists."); // Use throw to trigger the toast.error
          }
  
          let conversionInfo = { ...newIngredientDetails.conversion_info };
          if (!conversionInfo.each_to_g || conversionInfo.each_to_g === '') {
            delete conversionInfo.each_to_g; // Remove 'each_to_g' if it's empty or not provided
          }
  
          const newIngredientData = {
            name: ingredientNameCapitalized,
            nutrient_info: newIngredientDetails.nutrient_info,
            conversion_info: conversionInfo,
            user_id: currentUser.uid, // Use the current user's UID
          };
  
          // Set the new ingredient document with a specific ID (name)
          await setDoc(ingredientDocRef, newIngredientData);
        })(),
        {
          pending: 'Adding new ingredient...',
          success: 'Ingredient added successfully!',
          error: {
            render: ({data}) => {
              // Check if it's the custom error for duplicate ingredient
              if (data.message === "Ingredient already exists.") {
                return data.message;
              }
              // Fallback for other errors
              return "Failed to add ingredient.";
            }
          }
        }
      ).then(() => {
        // Optionally, reset the form fields and close the modal here
        setNewIngredientDetails({
          name: '',
          nutrient_info: {
            fat: '',
            carbs: '',
            protein: '',
            calories: '',
          },
          conversion_info: {
            cup_to_g: '',
            each_to_g: '',
            tbsp_to_g: '',
          },
        });
        setShowNewIngredientModal(false); // Close the modal
        fetchIngredientsMaster(); // Refresh the ingredient list to include the newly added ingredient
        setCurrentStep(1); // Reset to the first step

      }).catch((error) => {
        console.error("Error adding new ingredient:", error);
      });
    } else {
      toast.error("You must be logged in to add ingredients.");
    }
  };
  const handleAddBulkIngredient = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to add ingredients.");
      return;
    }
  
    // Wrap the logic in a promise for toast.promise
    toast.promise(
      new Promise(async (resolve, reject) => {
        const lines = bulkIngredientsCSV.trim().split('\n');
        for (const line of lines) {
          try {
            const details = line.split(';').reduce((acc, current) => {
              const [key, value] = current.split(':').map((el) => el.trim());
              acc[key] = value;
              return acc;
            }, {});
  
            const name = details['Name'];
            if (!name) {
              console.error(`Name is missing for line: ${line}`);
              continue; // Skip this line and process the next one
            }
  
            const ingredientNameCapitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            const ingredientDocRef = doc(db, "ingredients_master", ingredientNameCapitalized.replace(/ /g, '_'));
  
            // Prepare conversion and nutrient info, ensuring data integrity
            const conversionInfo = {
              cup_to_g: parseFloat(details['cup_to_g']),
              tbsp_to_g: parseFloat(details['tbsp_to_g']),
              ...(details['each_to_g'] && {each_to_g: parseFloat(details['each_to_g'])}),
            };
            const nutrientInfo = {
              calories: parseFloat(details['calories']),
              protein: parseFloat(details['protein']),
              fat: parseFloat(details['fat']),
              carbs: parseFloat(details['carbs']),
            };
  
            // Check if ingredient already exists
            const docSnap = await getDoc(ingredientDocRef);
            if (docSnap.exists()) {
              console.log(`${ingredientNameCapitalized} already exists.`);
              continue; // Skip existing ingredients
            }
  
            // Add new ingredient
            await setDoc(ingredientDocRef, {
              name: ingredientNameCapitalized,
              conversion_info: conversionInfo,
              nutrient_info: nutrientInfo,
              user_id: currentUser.uid,
            });
  
            console.log(`${ingredientNameCapitalized} added successfully.`);
          } catch (error) {
            console.error(`Error processing ingredient ${line}:`, error);
            reject(new Error(`Failed to process ingredient. Check format and try again.`));
            return; // Exit the loop and function on error
          }
        }
        // Resolve the promise after all ingredients are processed
        resolve();
      }),
      {
        pending: 'Adding bulk ingredients...',
        success: 'Bulk ingredients added successfully!',
        error: 'Error adding some ingredients. Check console for details.'
      }
    ).then(() => {
      // Reset and close the modal after processing all ingredients
      setBulkIngredientsCSV('');
      setShowNewBulkIngredientModal(false);
      fetchIngredientsMaster();
    }).catch((error) => {
      console.error("Bulk addition error:", error);
      // Additional error handling if needed
    });
  };
  
  


  
  
  const handleIngredientSelection = (ingredientName) => {
    // Find the ingredient info from masterIngredients
    const selectedIngredientInfo = masterIngredients.find(ingredient => ingredient.name === ingredientName);
  
    // Update the ingredients state
    setIngredients(currentIngredients => 
      currentIngredients.map((ingredient, idx) => {
        if (idx === currentIngredientIndex) {
          // Determine available units
          let availableUnits = ['g', 'cups', 'tbsp'];
          if (selectedIngredientInfo.conversion_info?.each_to_g) {
            availableUnits.push('pieces'); // Add 'pieces' if applicable
          }
  
          return {
            ...ingredient,
            name: ingredientName,
            // Ensure existing unit is valid; if not, reset it
            unit: availableUnits.includes(ingredient.unit) ? ingredient.unit : '',
            availableUnits // Store available units for this ingredient
          };
        }
        return ingredient;
      })
    );
  
    // Close the modal after selection
    setShowIngredientModal(false);
  };
  
  
 // Update handleImageChange to set both newImageFile and editImage (for preview)
const handleImageChange = (event) => {
  if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file); // Set the file for uploading
      setImagePreview(URL.createObjectURL(file)); // Set the preview URL
  }
};
  
  const adjustHeight = (e) => {
    e.target.style.height = "inherit"; // Reset height to recalculate
    e.target.style.height = `${e.target.scrollHeight}px`; // Set new height based on content
  };
 
  // JSX
  return (
    <div className="w-full bg-gray-100">
      <div className="max-w-max mx-auto pt-[7rem] p-7">
        {!currentUser ? (
  <div className="space-y-4">
  <h2 className="text-2xl font-bold mb-4">
         {isSigningUp ? "Sign Up" : "Log In"}
       </h2>

       <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
       <div className={`auth-form-content ${appliedClass}`}>
         {/* Email Field */}
         <div className="mb-4">
           <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="email">
             Email
           </label>
           <input
             className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
             id="email"
             type="email"
             placeholder="Email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
           />
         </div>

         {/* Password Field */}
         <div className="mb-6">
           <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="password">
             Password
           </label>
           <input
             className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
             id="password"
             type="password"
             placeholder="Password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
           />
         </div>

         {/* Confirm Password Field (only if signing up) */}
         {isSigningUp && (
           <div className="mb-6">
             <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="confirmPassword">
               Confirm Password
             </label>
             <input
               className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
               id="confirmPassword"
               type="password"
               placeholder="Confirm Password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
             />
           </div>
         )}

         {/* Form Actions */}
         <div className="flex gap-2 items-center justify-between">
           <button
             className="bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
             type="button"
             onClick={isSigningUp ? handleSignUp : handleSignIn}
           >
             {isSigningUp ? "Sign Up" : "Sign In"}
           </button>
           <button
             className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker transition duration-300"
             type="button"
              onClick={toggleForm}
       >
         {isSigningUp
           ? "Already have an account? Log In"
           : "Don't have an account? Sign Up"}
       </button>
     </div>
     </div>
   </div>
   {authError && <p className="text-red-500 text-xs italic">{authError}</p>}
 </div>
        ) : (

          
          <div className=" rounded-lg">
<div className="gap-[1em] flex justify-between items-center border-b-2 py-4">
  <button
    type="button"
    onClick={() => {setShowNewIngredientModal(true)
      setStepTransition('fade-enter'); // Initialize stepTransition for animation
      setNavigationDirection('forward');}}
    className="bg-[#58acbb] text-white px-4 py-2 rounded transition duration-300 hover:bg-[#3e7983] transition duration-300 col-span-1"
  >
    Add New Ingredient
  </button>
  <button
    type="button"
    onClick={() => {setShowNewBulkIngredientModal(true)
      setBulkModalStep(0);
       setStepTransition('fade-enter'); // Initialize stepTransition for animation
      setNavigationDirection('forward'); // Start from entering ingredients
    }}
    
    className="bg-[#58acbb] text-white px-4 py-2 rounded transition duration-300 hover:bg-[#3e7983] transition duration-300 col-span-1"
  >
    Add Bulk Ingredients
  </button>
 


  <button
    type="button"
    onClick={handleSignOut}
    className="bg-red-500 text-white px-4 py-2 rounded transition duration-300 hover:bg-red-700 transition duration-300"
  >
    Sign Out
  </button>
</div>
<h1 className="text-3xl text-center my-10 text-gray-600">Add Recipe</h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
              <div className="flex flex-col">
                <div className="shadow-md shadow-md bg-white p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    Recipe Title
                  </h3>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Recipe Title"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="text-gray-600 shadow-md bg-white p-4 mb-8 rounded-lg">
  <h3 className="text-xl font-semibold">Recipe Image</h3>
  <span className="text-sm">(leave blank for default image)</span>
  <div
    className="mt-4 w-[250px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
    onClick={() => fileInputRef.current && fileInputRef.current.click()}
  >
    {imagePreview ? (
      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
    ) : (
      <div className="text-center">
        <p className="text-gray-400">Click to upload image</p>
      </div>
    )}
  </div>
  <input
    id="imageUpload"
    type="file"
    onChange={handleImageChange}
    accept="image/*"
    ref={fileInputRef}
    className="hidden"
  />
</div>


                <div className="text-gray-600 shadow-md bg-white p-4 mb-8 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Ingredients</h3>
    
  {ingredients.map((ingredient, index) => (
    <div 
    key={index} id={`ingredient-input-${index}`} 
className={`relative flex md:gap-2 md:flex-row flex-col sm:items-center mb-4 ${index !== 0 ? "animate-fade-in" : "animate-fade-out"}`}>
    

      <input
        type="text"
        value={ingredient.name}
        className="bg-transparent w-[0.1rem] h-[0.1rem] ml-[8rem] mt-9 absolute "
        onChange={() => {}} // No-op function for onChange
        readOnly
        required
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
        onChange={(e) => handleIngredientChange(index, e)}
        placeholder="Quantity"
        className="text-gray-600 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
        required
      />
  <select
    name="unit"
    value={ingredient.unit}
    onChange={(e) => handleIngredientChange(index, e)}
    className=" p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:flex-grow sm:ml-2"
    required
  >
    <option disabled value="">Unit</option>
    {ingredient.availableUnits?.map(unit => (
      <option key={unit} value={unit}>{unit}</option>
    ))}
  </select>

      </div>
      {ingredients.length > 1 && (
      <button
        type="button"
        onClick={() => removeIngredientInput(index)}
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
                    onClick={addIngredientInput}
                    className="mt-2 bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
                  >
                    Next Ingredient
                  </button>
                </div>
  

                <div className="text-gray-600 shadow-md bg-white p-4 rounded-lg">
                  <h3 className="text-xl font-semibold  mb-4">Instructions</h3>
                   {instructions.map((instruction, index) => (
                    <div 
    key={index} 
    id={`instruction-input-${index}`} 
    className={`relative mb-4 ${index !== 0 ? "animate-fade-in" : ""}`}
  >  <label
                        className="block text-grey-darker text-sm font-bold mb-2"
                        htmlFor={`instruction-${index}`}
                      >
                        {`Step ${index + 1}`}
                      </label>
                      <textarea
  id={`instruction-${index}`}
  value={instruction.text}
  onChange={(e) => handleInstructionChange(index, e)}
  onInput={adjustHeight}
  placeholder={`Instruction for step ${index + 1}`}
  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none overflow-hidden"
  required
  rows="2" // Start with at least two lines
  style={{ minHeight: '50px' }} // Ensure there's a minimum height if you want
></textarea>
               {index > 0 && (
      <button
        type="button"
        onClick={() => removeInstructionInput(index)}
        className="flex justify-center items-center gap-3 w-full bg-gray-400 transition duration-300 hover:bg-gray-700 text-white font-bold p-2 rounded"
        aria-label="Remove instruction"
      >
          <MdDelete /> Remove

      </button>
    )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInstructionInput}
                    className="mt-2 bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
                  >
                    Next Instruction
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#58acbb] transition duration-300 hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
              >
                Add Recipe
              </button>
            </form>
   

            {showNewIngredientModal && (
  <Modal showModal={showNewIngredientModal} setShowModal={setShowNewIngredientModal}>
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      
      <div className={`modal-content ${appliedClass}`}> {/* Apply the dynamic class here */}
        {renderCurrentStepContent()}
      </div>
      <div className="modal-footer flex justify-between mt-6 space-x-4"> {/* Increased margin top and space between buttons */}
        {currentStep > 1 && (
          <button onClick={moveToPreviousStep} className="transition duration-300 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded">
            Back
          </button>
        )}
        <div className={`${currentStep > 1 ? '' : 'ml-auto'}`}> {/* This line ensures alignment */}
          {currentStep < totalSteps ? (
            <button onClick={moveToNextStep} className="transition duration-300 bg-[#58acbb] hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded">
              Next
            </button>
          ) : (
            <button onClick={handleAddIngredient} className="transition duration-300 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  </Modal>

  
)}



{showNewBulkIngredientModal && (
  <Modal showModal={showNewBulkIngredientModal} setShowModal={setShowNewBulkIngredientModal}>
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
     

      {renderBulkStepContent()}

      <div className="modal-footer flex justify-between mt-6">
  {bulkModalStep > 0 ? (
    <button
    onClick={moveToPreviousBulkStep}
      className="transition duration-300 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
    >
      Back
    </button>
  ) : (
    <div></div> // Empty div to keep the space and maintain layout
  )}
  <div> {/* This div will keep the Next/Submit button aligned to the right */}
    {bulkModalStep === 0 && (
      <button
        onClick={handleGeneratePrompt}
        className="transition duration-300 bg-[#58acbb] hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
      >
        Next
      </button>
    )}
    {bulkModalStep === 1 && (
      <button
        onClick={handleCopyPrompt}
        className="bg-[#58acbb] hover:bg-[#3e7983] text-white font-bold py-2 px-4 rounded"
      >
        Enter Response
      </button>
    )}
    {bulkModalStep === 2 && (
      <button
        onClick={handleSubmitBulkIngredients}
        className="transition duration-300 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Ingredients
      </button>
    )}
  </div>
</div>


    </div>
  </Modal>
)}



{showIngredientModal && (
  <Modal showModal={showIngredientModal} setShowModal={setShowIngredientModal}>
    <div className="relative max-w-xl mx-auto">
      {/* Modal header */}
      <div className="flex justify-between items-center border-b-2 border-gray-200 mb-4">
        <h3 className="text-xl font-bold text-gray-700 py-2">Choose an ingredient</h3>
       
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
        {masterIngredients
          .filter((ingredientObj) =>
            ingredientObj.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((ingredientObj, index) => (
            <button
              key={index}
              onClick={() => handleIngredientSelection(ingredientObj.name)}
              className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 transition duration-300 hover:bg-gray-50 px-3 py-2 rounded shadow-sm text-sm transition duration-300"
            >
              {ingredientObj.name}
            </button>
          ))
        }
      </div>

    
    </div>
  </Modal>
)}




         
          </div>
        )}{" "}
      </div>{" "}
    
    </div>
  );
}
