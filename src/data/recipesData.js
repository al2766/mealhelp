import prawnRisottoImage from "../assets/images/prawnrisotto.png";
import pepperCornTacoImage from "../assets/images/peppercorntaco.png";
import sharbaLibyaImage from "../assets/images/sharbalibya.png";
import prawnLinguineImage from "../assets/images/prawnlinguine.png";
import chickenLinguineImage from "../assets/images/chickenlinguine.png";
import bamiaImage from "../assets/images/bamia.png";
import lambRiceImage from "../assets/images/lambrice.png";
import haloumiBurgerImage from "../assets/images/haloumiburger.png";
import beefTeriyakiNoodlesImage from "../assets/images/beefteriyakinoodles.png";
import lasagneImage from "../assets/images/lasagne.png";
import chilliConCarneImage from "../assets/images/chilliconcarne.png";
import spicyCreamyCajunChickenPastaImage from "../assets/images/chickenpasta.png";
import thaiGreenCurryImage from "../assets/images/thaigreencurry.png";
import sweetChickenNoodlesImage from "../assets/images/sweetchickennoodles.png";
import homemadeBurgerFriesImage from "../assets/images/burgerandfries.png";
import macAndCheeseImage from "../assets/images/macandcheese.png";
import stuffedVineLeavesImage from "../assets/images/stuffedvineleaves.png";
import kabsaImage from "../assets/images/kabsa.png";
import roganJoshImage from "../assets/images/roganjosh.png";
import rishdaImage from "../assets/images/rishda.png";
import tagineImage from "../assets/images/tagine.png";
import tikkaMasalaImage from "../assets/images/tikkaMasala.png";
import maqlubaImage from "../assets/images/maqlooba.png";
import chickenBurgerCheeseBitesImage from "../assets/images/burgerandbites.png";
import shepherdsPieImage from "../assets/images/shepherdspie.png";
import kimchiNoodlesImage from "../assets/images/kimchinoodles.png";
import biryaniImage from "../assets/images/biryani.png";
// ... Add imports for other images in a similar way

const recipesData = [
  {
    id: "biryani",
    title: "Biryani",
    image: biryaniImage,
    ingredients: [
      "Basmati Rice (300g)",
      "Chicken (400g)",
      "Greek Yoghurt (150g)",
      "Ginger and Garlic Paste (2tbsp)",
      "Ghee (30g)",
      "Coriander (handful)",
      "Mint (handful)",
      "Chilli Powder (3tsp)",
      "Garam Masala Powder (2tsp)",
      "Turmeric Powder (2tsp)",
      "Onion (2)",
      "Cashew Nuts (handful)",
      "Tomatoes (3)",
      "Saffron (10g)",
    ],
    instructions: `Step 1: Wash the rice in cold water and soak for 10-15 mins. Heat a pan of salted water, add the rice and simmer for 10 mins.\nStep 2: Marinate the chicken with yogurt, ginger-garlic paste, spices, and let it sit for 20 mins.\nStep 3: Fry onions and cashews until golden. Reserve oil.\nStep 4: Fry the marinated chicken with tomatoes, adding reserved oil, until cooked.\nStep 5: Layer the cooked chicken and rice in a pot, adding fried onions, mint, and saffron water.\nStep 6: Seal the pot with foil and a lid. Cook on low heat for 15-20 mins. Serve hot. Step 1: Wash the rice in cold water and soak for 10-15 mins. Heat a pan of salted water, add the rice and simmer for 10 mins.\nStep 2: Marinate the chicken with yogurt, ginger-garlic paste, spices, and let it sit for 20 mins.\nStep 3: Fry onions and cashews until golden. Reserve oil.\nStep 4: Fry the marinated chicken with tomatoes, adding reserved oil, until cooked.\nStep 5: Layer the cooked chicken and rice in a pot, adding fried onions, mint, and saffron water.\nStep 6: Seal the pot with foil and a lid. Cook on low heat for 15-20 mins. Serve hot.`,
  },
  {
    id: "prawn-risotto",
    title: "Prawn Risotto",
    image: prawnRisottoImage, // Ensure this image is correctly imported
    ingredients: [
      "Leek (2)",
      "Parsley (handful)",
      "Garlic (4 cloves)",
      "Rice (400g)",
      "Cider Vinegar (60ml)",
      "Tomato Puree (4 tbsp)",
      "Prawns (450 g)",
      "Veg stock (20g)",
      "Water for stock (1500ml)",
      "Grated cheese (100g)",
    ],
    instructions: `Step 1: Heat some oil in a deep saucepan and add the rice with half the water (750ml boiling) and half the veg-stock (10g) and let the rice cook in low heat approx 10 mins.\nStep 2: Cut the leek into small pieces. Grate the garlic and chop the chilli & parsley and set aside.\nStep 3: Fry leek in oil for 4-5 mins till soft, then add the garlic and tomato puree and fry for 1 min. Then add the cooked rice and vinegar and mix very well.\nStep 4: In a separate saucepan, boil the other half of the water (750ml) with the rest of the veg-stock (10g) and slowly add the water with a ladle to the rice mix and stir till absorbed and repeat with all the water.\nStep 5: Once you add the last ladle of water into the rice mix add the prawns in too and simmer till cooked 5-6 mins (or you can precook the prawns to save time).\nStep 6: Then turn off the heat and mix in the cheese, parsley and a knob of butter and serve!`,
  },

  {
    id: "pepper-corn-taco",
    title: "Pepper & Corn Taco",
    image: pepperCornTacoImage, // Ensure this image is correctly imported
    ingredients: [
      "Pepper (2)",
      "Grated cheese (120g)",
      "Lime (1)",
      "Greek cheese (100g)",
      "Soured cream",
      "Taco tortilla (8)",
      "Sweetcorn (200g)",
      "Paprika",
      "Onion Powder",
      "Cayenne",
      "Oregano",
    ],
    instructions: `Step 1: Preheat your oven to 240°C/220°C. Drain the sweetcorn in a sieve. Chop the pepper into 1cm pieces. Heat oil in a pan and fry the pepper and corn until softened and starting to char, 5-6 mins.\nStep 2: Meanwhile, grate the Cheddar cheese. Crumble the Greek style salad cheese. Zest and halve the lime and add to a bowl.\nStep 3: Once the veg is cooked, remove from the heat and stir through salt, pepper and the rest of the spices, and add the cheeses and lime zest. Mix together well.\nStep 4: Lay the tortillas onto a baking tray and spoon the cheesy veg filling onto one half of each one. Fold the other side over, rub a little oil and bake till golden and crunchy 5-7 mins. Serve with sour cream or yoghurt as a dip.`,
  },

  {
    id: "sharba-libya",
    title: "Sharba Libya",
    image: sharbaLibyaImage, // Ensure this image is correctly imported
    ingredients: [
      "Onion (1)",
      "Lamb (500g)",
      "Tomatoes (3)",
      "Tomato puree (2 tbsp/35g)",
      "Orzo pasta/Spaghetti (100g)",
      "Clove (1.5 tsp/4g)",
      "Nutmeg (0.5 tsp/1.5g)",
      "Cinnamon (0.5 tsp/1.5g)",
      "Cumin (0.5 tsp/1.5g)",
      "Ginger (1 tsp/3g)",
      "Paprika (0.5 tsp/1.5g)",
      "Turmeric (1 tsp/3g)",
      "Parsley (handful)",
      "Mint (handful)",
    ],
    instructions: `Step 1: Cut and chop the lamb, tomatoes, parsley, and onion into small pieces.\nStep 2: In a pan, add 60ml of oil or butter, fry the lamb in oil with 1 big tsp each of clove, ginger, turmeric and salt, for a few minutes, then add the onion and continue frying for 3-4 minutes.\nStep 3: Meanwhile, prepare your spice mix. In a bowl, mix half a teaspoon each of black pepper, cinnamon, clove, cumin, nutmeg, and paprika.\nStep 4: Stir in the parsley, tomatoes, tomato purée, salt and the spice mix into the pan. Fry for about 4 minutes, stirring constantly, then add just enough water to cover the contents of the pan (400-700ml).\nStep 5: Reduce the heat and simmer for about 20-30 mins, or until the meat is nearly cooked.\nStep 6: Add more water, if you like, then stir in the orzo pasta and cook on low heat until the pasta is soft (8-12 mins). Add some lemon juice and the mint, then enjoy.`,
  },

  {
    id: "prawn-linguine",
    title: "Prawn Linguine",
    image: prawnLinguineImage, // Ensure this image is correctly imported
    ingredients: [
      "Lemon (1)",
      "Shallot (2)",
      "Linguine (500g)",
      "Prawns (450g)",
      "Peas (250g)",
      "Creme fraiche (200g)",
      "Parsley (handful)",
      "Garlic (2 cloves)",
      "Veg-stock (20g)",
    ],
    instructions: `Step 1: Boil water in a saucepan with 1/2 tsp salt for the linguine. Zest and halve the lemon. Chop the parsley, cut the shallot into small pieces and grate the garlic.\nStep 2: Whilst the linguine is cooking, heat oil in a pan and cook the shallot for 4-5 mins. Then add the garlic and fry for 1 min more.\nStep 3: Once the linguine is cooked drain and preserve the pasta water. Then add the pasta water with the veg-stock to the shallot and garlic, bring to a boil and simmer for 3-4 mins.\nStep 4: Meanwhile, pre-cook the prawns, with 1 tbsp salt, in some oil in a separate pan 3-4 mins till just cooked. Stir the cooked prawns and peas into the sauce and cook for another 2-3 mins.\nStep 5: Once the prawns are cooked, stir the creme fraiche and lemon zest into the sauce. Bring back to the boil, then remove from the heat. Season with pepper, then stir through the cooked pasta and half the parsley.`,
  },

  {
    id: "chicken-linguine",
    title: "Chicken Linguine",
    image: chickenLinguineImage, // Ensure this image is correctly imported
    ingredients: [
      "Lemon (1)",
      "Shallot (2)",
      "Linguine (500g)",
      "Chicken (500g)",
      "Peas (250g)",
      "Creme fraiche (200g)",
      "Parsley (handful)",
      "Garlic (2 cloves)",
      "Veg-stock (20g)",
    ],
    instructions: `Step 1: Boil water in a saucepan with 1/2 tsp salt for the linguine. Zest and halve the lemon. Chop the parsley, cut the shallot into small pieces and grate the garlic.\nStep 2: Whilst the linguine is cooking, heat oil in a pan and cook the shallot for 4-5 mins. Then add the garlic and fry for 1 min more.\nStep 3: Once the linguine is cooked drain and preserve the pasta water. Then add the pasta water with the veg-stock to the shallot and garlic, bring to a boil and simmer for 3-4 mins.\nStep 4: Meanwhile, pre-cook the chicken, with 1 tbsp salt and pepper, in some oil in a separate pan 4-7 mins till just cooked. Then add the cooked chicken and peas into the sauce and cook for another 2-3 mins.\nStep 5: Stir the creme fraiche and lemon zest into the sauce. Bring back to the boil, then remove from the heat. Season with pepper, then stir through the cooked pasta and half the parsley.`,
  },

  {
    id: "bamia",
    title: "Bamia",
    image: bamiaImage, // Ensure this image is correctly imported
    ingredients: [
      "Rice (400g)",
      "Okra (500g)",
      "Onion (4)",
      "Lamb (500g)",
      "Tomato Puree (8 tblsp)",
      "Cumin (1 tsp)",
      "Coriander (1 tsp)",
      "Garlic (4 cloves)",
    ],
    instructions: `Step 1: Heat a bit of oil in a deep saucepan and add the rice with 3 cups boiling water, 1 tsp of salt, and simmer for 10-15 mins till cooked.\nStep 2: Meanwhile, dice the onions and fry in oil on medium heat for 1-2 mins, then add the meat and fry for 3-4 mins till the redness goes.\nStep 3: Add the tomato puree and a bit of water (half a cup), along with the seasoning (cumin & coriander) and salt, then simmer for 20-25 mins until the meat is cooked.\nStep 4: Grate the garlic and set aside. Cut both edges of the okra. Once the meat is cooked, add the okra and increase the heat for a few mins then simmer for 15 mins till the okra is soft.\nStep 5: Once the okra is soft, add the garlic and more seasoning again, then after 1 min turn the heat off. Pour onto the rice and serve!`,
  },

  {
    id: "lamb-rice",
    title: "Lamb Rice",
    image: lambRiceImage, // Ensure this image is correctly imported
    ingredients: ["Rice (400g)", "Lamb (500g)", "Black Pepper", "Turmeric"],
    instructions: `Step 1: Simmer bones in boiling water to use later to cook the rice with, for at least a few hours.\nStep 2: Use the stock water to cook the rice, leave in low heat with a tbsp of salt for approx 15 mins.\nStep 3: Once the rice is nearly done add more salt and turmeric.\nStep 4: Cook the lamb in the air fryer at 190°C for 15 mins.\nStep 5: Place the lamb onto the cooked rice and serve.`,
  },

  {
    id: "haloumi-burger",
    title: "Haloumi Burger",
    image: haloumiBurgerImage, // Ensure this image is correctly imported
    ingredients: [
      "Pepper (2)",
      "Haloumi cheese (2 blocks)",
      "Burger buns (8)",
      "Sweet chilli sauce",
    ],
    instructions: `Step 1: Deseed the pepper then slice in half and in half again to make 4 equal slices of pepper. Do this with both peppers for a total of 8 slices.\nStep 2: Drizzle some oil onto the pepper slices and season with salt and pepper. Then pop into the air fryer at 200°C for 10 mins.\nStep 3: Meanwhile, cut the haloumi cheese into 8 slices, heat oil in a pan and fry the haloumi cheese slices till golden, 4-8 mins, flipping every few mins.\nStep 4: Add the burger buns into the air fryer for a few mins till toasted.\nStep 5: For each burger bun, add a slice of pepper, a slice of haloumi, some sweet chilli sauce and ketchup, and serve.`,
  },

  {
    id: "beef-teriyaki-noodles",
    title: "Beef Teriyaki Noodles",
    image: beefTeriyakiNoodlesImage, // Ensure this image is correctly imported
    ingredients: [
      "Beef (400g)",
      "Garlic (2 cloves)",
      "Green beans (150g)",
      "Udon noodles (500g)",
      "Coriander (handful)",
      "Chinese leaf/Cabbage (240g)",
      "Ginger puree (60g)",
      "Teriyaki sauce/BBQ Jerk sauce (300g)",
    ],
    instructions: `Step 1: Chop the Chinese leaf or cabbage into thin 2cm pieces, trim the green beans into thirds, peel and grate the garlic, and roughly chop the coriander.\nStep 2: Add some oil to a large saucepan, then add the noodles with 1/4 tsp salt, the green beans, and enough boiling water to cover, then simmer till done (6-10 mins). Meanwhile, heat a drizzle of oil in a large frying pan on medium-high heat. Add the Chinese leaf or cabbage and stir-fry until soft, 3-4 mins.\nStep 3: Add the meat, stir in the ginger puree and garlic, then stir-fry till the meat is cooked. Then pour in the teriyaki or BBQ sauce, and stir to coat.\nStep 4: Add the cooked noodles and green beans to the pan, then stir-fry until everything is well coated, 1-2 mins.\nStep 5: Taste and season if needed. Add a splash of water if it's a little thick. Top with as much coriander, chili, and peanuts as you'd like.`,
  },

  {
    id: "lasagne",
    title: "Lasagne",
    image: lasagneImage, // Ensure this image is correctly imported
    ingredients: [
      "Dried lasagne sheets (12 sheets)",
      "Ground beef (500g)",
      "Onion (1, finely chopped)",
      "Garlic cloves (2, minced)",
      "Canned crushed tomatoes (400g)",
      "Tomato paste (2 tbsp)",
      "Dried oregano (1 tsp)",
      "Dried basil (1 tsp)",
      "Salt and pepper to taste",
      "Olive oil (2 tbsp)",
      "Ricotta or cottage cheese (250g)",
      "Egg (1, beaten)",
      "Grated mozzarella cheese (200g)",
      "Grated Parmesan cheese (50g)",
    ],
    instructions: `Step 1: Heat olive oil in a large skillet over medium heat. Add the chopped onion and garlic, sauté until soft. Add the ground beef and cook until browned. Drain excess grease.\nStep 2: Stir in crushed tomatoes, tomato paste, oregano, basil, salt, and pepper. Bring to a simmer and cook for 20 minutes, stirring occasionally.\nStep 3: Preheat the oven to 180°C (350°F). In a bowl, mix together the ricotta or cottage cheese, beaten egg, and a pinch of salt and pepper.\nStep 4: In a baking dish, spread a layer of the meat sauce. Place a layer of lasagne sheets over the sauce. Spread a portion of the cheese mixture over the sheets, then sprinkle some mozzarella and Parmesan. Repeat the layers, finishing with a layer of meat sauce, and sprinkle the remaining mozzarella and Parmesan on top.\nStep 5: Cover with aluminum foil and bake in the preheated oven for 25 minutes. Remove the foil and bake for another 25 minutes, or until the top is golden and bubbly. Allow to cool for 10 minutes before serving.`,
  },

  {
    id: "chilli-con-carne",
    title: "Chilli Con Carne",
    image: chilliConCarneImage, // Ensure this image is correctly imported
    ingredients: [
      "Rice (400g)",
      "Beef mince (500g)",
      "Onion (1.5)",
      "Pepper (1)",
      "Coriander (garnish)",
      "Chopped tomatoes (400g)",
      "Tomato Puree (3 tbsp)",
      "Red Kidney beans (400g)",
      "Cumin",
      "Paprika",
      "Oregano",
      "Garlic (2 cloves)",
    ],
    instructions: `Step 1: Heat oil in a pan and fry the mince meat till brown and just about cooked, season with salt and pepper as it's cooking, then set aside in a bowl.\nStep 2: Add the rice onto some oil in a deep saucepan with 3 cups boiling water, 2 tbsp salt and simmer till cooked, about 10-15 mins.\nStep 3: Chop and dice the onions, pepper, and chilli and grate the garlic. Fry all the vegetables in the same pan in some oil until soft, about 4-5 mins.\nStep 4: Add the tomato puree, 1 tsp of cumin, 1 tsp of dried oregano, and 1.5 tsp of smoked paprika. Mix and fry for 2-3 mins.\nStep 5: Add the beef mince back in and the chopped tomatoes in the mix and simmer for 45-50 mins till thick and glossy.\nStep 6: Add the kidney beans and season with salt and pepper and cook for another 4-5 mins. Garnish with coriander, pour onto the rice & serve!`,
  },

  {
    id: "spicy-creamy-cajun-chicken-pasta",
    title: "Spicy Creamy Cajun Chicken Pasta",
    image: spicyCreamyCajunChickenPastaImage, // Ensure this image is correctly imported
    ingredients: [
      "Chicken (500g)",
      "Onion (1.5 pieces)",
      "Tomato Sauce (400ml)",
      "Grated Cheese (100g)",
      "Cajun spice mix",
      "Water for sauce (200ml)",
      "Chicken Stock (20g)",
      "Penne Pasta (500g)",
      "Creme Fraishe (150ml)",
      "Garlic (2 cloves)",
      "Spinach (200g)",
    ],
    instructions: `Step 1: Bring a saucepan of water to boil with 1/2 tsp salt for the pasta. Cook the penne until tender, 12 mins, then drain and drizzle with oil to prevent sticking.\nStep 2: Peel and grate the garlic. Halve, peel, and thinly slice the shallot.\nStep 3: Heat oil in a frying pan on medium-high heat. Add the chicken, season with salt and pepper, and fry until golden, 5-6 mins. Add the shallot and cook until soft, 3-4 mins.\nStep 4: Add the garlic and Cajun spice mix, cook for 1 min. Add the water for the sauce, tomato sauce, and chicken stock paste. Simmer until thickened, 10-12 mins.\nStep 5: Add the spinach to the sauce, stirring until wilted. Stir through half the cheese and creme fraiche, bring to a boil, then remove from heat. Season to taste.\nStep 6: Mix the drained pasta with the sauce. Serve in bowls, sprinkled with remaining cheese.`,
  },

  {
    id: "thai-green-curry",
    title: "Thai Green Curry",
    image: thaiGreenCurryImage, // Ensure this image is correctly imported
    ingredients: [
      "Green Beans (100g)",
      "Chicken (500g)",
      "Rice (400g)",
      "Coconut Milk (400ml)",
      "Thai Green Curry Paste (40g)",
      "Pepper (2 pieces)",
      "Soy Sauce (30ml)",
      "Coriander (handful)",
    ],
    instructions: `Step 1: Trim the green beans and chop into thirds. Halve the pepper, discard the core and seeds, and slice into thin strips. Roughly chop the coriander (stalks and all).\nStep 2: Heat a bit of oil in a deep saucepan, add the rice with 3 cups of boiling water and 1 tbsp of salt, and simmer for approximately 15 mins until cooked.\nStep 3: Meanwhile, heat a splash of oil in a large frying pan on medium-high heat. Add the chicken and stir-fry until starting to brown, 3-4 mins. Add the pepper and green beans and stir-fry for another minute.\nStep 4: Stir in the Thai green curry paste and cook for 30 seconds. Pour in the coconut milk, stir to dissolve the paste, lower the heat to medium, cover, and simmer until the chicken is cooked through, 8-10 mins, and the vegetables are tender.\nStep 5: Once the curry is cooked, add yogurt or flour to thicken if desired. Remove from heat and stir through the soy sauce. Season to taste with salt and pepper, add lime if preferred.\nStep 6: Serve the rice topped with the curry and a sprinkling of coriander. Enjoy!`,
  },

  {
    id: "sweet-chicken-noodles",
    title: "Sweet Chicken Noodles",
    image: sweetChickenNoodlesImage, // Ensure this image is correctly imported
    ingredients: [
      "Udon Noodles (400g)",
      "Chicken (500g)",
      "Garlic (2 cloves)",
      "Garlic Powder (1.5 tbsp)",
      "Soy Sauce (5 tbsp/70 ml)",
      "Spring Onion (200g)",
      "Honey Syrup (3 tbsp)",
      "Flour (3 tbsp/20g)",
      "Pepper (2 pieces)",
      "Vinegar (2 tbsp/25ml)",
    ],
    instructions: `Step 1: Add udon noodles to a large pot with oil, then add just enough water to barely cover the noodles and simmer until nearly cooked, 3-5 mins.\nStep 2: Drain and cook in oil with spices, minced garlic, 2 tbsp of soy sauce, and 2 tbsp sweet chilli sauce.\nStep 3: Chop spring onions and pepper into small pieces and grate the garlic. Prepare the chicken sauce by mixing soy sauce, vinegar, and golden syrup in a bowl.\nStep 4: Coat chicken in flour, season with salt and pepper, and fry in oil until golden.\nStep 5: Add butter and garlic powder to chicken, fry for 1 min, then add honey-soy mixture, stir and cook until chicken is cooked and sauce has thickened.\nStep 6: Heat oil in a separate pan, fry vegetables until cooked, 3-4 mins. Add cooked vegetables to noodles. Serve noodles with sweet saucy chicken.`,
  },

  {
    id: "homemade-burger-fries",
    title: "Home-made Burger & Fries",
    image: homemadeBurgerFriesImage, // Ensure this image is correctly imported
    ingredients: [
      "Beef mince (500g)",
      "Onion (1/2 piece)",
      "Burger buns (8)",
      "Cheese (4 slices)",
      "Egg (2)",
      "Potato (900g)",
      "Iceberg lettuce (100g)",
      "Mayonnaise",
      "Ketchup",
      "Worcestershire sauce",
    ],
    instructions: `Step 1: Peel the potato and cut into evenly sized wedges (2cm). Boil in high heat with water for 6-8 mins until fluffy.\nStep 2: Drain and place in an oven dish. Coat with olive oil, bake at 230°C for 60-75 mins, flipping halfway.\nStep 3: Grate the onion and mix with mayo, ketchup, and Worcestershire sauce for the special sauce.\nStep 4: Mix beef mince and egg, season with salt and pepper. Form into even-sized balls.\nStep 5: Heat oil in a pan, squish mince balls to make burger shape, fry until cooked, 10-12 mins, flipping every 3 mins. Add special sauce and cheese in the last minutes.\nStep 6: Toast buttered burger buns. Assemble burger with special sauce, lettuce, and patty. Serve with fries.`,
  },

  {
    id: "mac-and-cheese",
    title: "Mac and Cheese",
    image: macAndCheeseImage, // Ensure this image is correctly imported
    ingredients: [
      "Grated Cheese (120g)",
      "Blue Cheese (60g)",
      "Breadcrumbs (50g)",
      "Macaroni (400g)",
      "Flour (45g/3tbsp)",
      "Olive oil (40ml/3tbsp)",
      "Cauliflower (400g)",
      "Water for sauce (500ml)",
      "Creme Fraishe (300ml)",
      "Veg stock (30g)",
      "Spinach (200g)",
    ],
    instructions: `Step 1: Boil water in a deep pan, add macaroni and simmer until tender, drain and drizzle with oil.\nStep 2: Preheat oven to 220°C/200°C fan/gas mark 7. Grate Cheddar cheese and set aside. Mix blue cheese with breadcrumbs, season, add olive oil, and set aside.\nStep 3: Halve large cauliflower florets, place in ovenproof dish, drizzle with oil, season, and roast until tender.\nStep 4: Make a roux with oil and flour, add water and veg stock, boil and simmer until thickened. Add creme fraiche, then remove from heat.\nStep 5: Melt Cheddar cheese in sauce, season, add spinach until wilted, mix with cauliflower and pasta, pour into dish.\nStep 6: Sprinkle with blue cheese crumb mix, grill until golden. Serve and enjoy!`,
  },

  {
    id: "stuffed-vine-leaves",
    title: "Stuffed Vine Leaves",
    image: stuffedVineLeavesImage, // Ensure this image is correctly imported
    ingredients: [
      "Vine Leaves (200g)",
      "Rice (400g)",
      "Onion (1 large, finely chopped)",
      "Pine Nuts (3 tbsp)",
      "Currants (2 tbsp)",
      "Fresh Mint (chopped, 2 tbsp)",
      "Fresh Dill (chopped, 2 tbsp)",
      "Olive Oil (4 tbsp)",
      "Lemon Juice (2 lemons)",
      "Salt and Pepper (to taste)",
    ],
    instructions: `Step 1: Blanch the vine leaves in boiling water for 2-3 minutes, then refresh in cold water. Drain and set aside.\nStep 2: Cook the rice in boiling water until half done. Drain and set aside.\nStep 3: In a pan, heat some olive oil and sauté the onions until translucent. Add pine nuts, currants, half-cooked rice, mint, dill, salt, and pepper. Cook for a few minutes.\nStep 4: Lay out a vine leaf, shiny side down. Place a teaspoon of the rice mixture near the stem end. Fold in the sides and roll up tightly.\nStep 5: Place the rolls seam-side down in a heavy-bottomed pot. Drizzle with olive oil and lemon juice. Add enough water to just cover the rolls.\nStep 6: Place a plate on top of the rolls to keep them submerged, then bring to a simmer. Cook for about 40-50 minutes or until the leaves are tender. Serve warm or at room temperature.`,
  },

  {
    id: "kabsa",
    title: "Kabsa",
    image: kabsaImage, // Ensure this image is correctly imported
    ingredients: [
      "Carrot (2)",
      "Tomatoes (5, around 400g)",
      "Rice (400g)",
      "Garlic (6 cloves)",
      "Chicken legs with skin (1kg)",
      "Tomato puree (70g, around 5 tbsp)",
      "Onion (2)",
      "Chicken stock (1 cube)",
      "Raisins (70g)",
      "Black pepper (1 tsp)",
      "Cardamom (1 tsp)",
      "Turmeric (2 tsp)",
      "Paprika (2 tsp)",
      "Ginger powder (1 tbsp)",
      "Cinnamon (2 tsp)",
      "Coriander powder (1 tsp)",
      "Vinegar (1 tbsp)",
    ],
    instructions: `Step 1: Finely chop the onions and 3 tomatoes. Grate the carrot and 4 garlic cloves. Heat oil in a pan, add the onion and garlic, and fry for 3-4 mins.\nStep 2: Add the chicken, season with salt and all spices, then add tomatoes, grated carrot, and 2 tbsp tomato puree. Fry for 4-5 mins.\nStep 3: Add 600ml boiling water and simmer until the chicken is cooked.\nStep 4: Remove the chicken, mix a ladle of sauce with 1 tbsp tomato puree and glaze the chicken. Bake for 8-10 mins. Add rice to the saucepan, add more water and chicken stock if needed, boil for 1 min, then simmer until rice is cooked (10-15 mins).\nStep 5: Blend 2 tomatoes and the pepper into a thick sauce. In another pan, heat oil, add remaining garlic, fry for 1 min, add vinegar, 1 tsp paprika, 2 tbsp tomato puree, and the blended mix. Simmer for 5 mins.\nStep 6: Serve rice with raisins, top with chicken, and the blended sauce as a dip.`,
  },
  {
    id: "rogan-josh",
    title: "Rogan Josh Curry",
    image: roganJoshImage, // Make sure this image is correctly imported
    ingredients: [
      "Ghee (50g/4tbsp)",
      "Cinnamon stick (1)",
      "Green Cardamom (6)",
      "Cloves (6)",
      "Onion (3)",
      "Garlic (4 cloves)",
      "Tomato Sauce (80ml/6tbsp)",
      "Grated ginger (15g/2tbsp)",
      "Chicken pieces (500g)",
      "Chicken stock (12g)",
      "Water for stock (700ml)",
      "Garlic naan (4 pieces)",
      "Paprika (14g/2 tbsp)",
      "Chilli (3g/0.75 tbsp)",
      "Coriander (30g/4 tbsp)",
      "Cumin (30g/4 tbsp)",
      "Turmeric (14g/2 tbsp)",
      "Nutmeg (1g/0.25 tbsp)",
      "Garam Masala (10g/1.5 tbsp)",
    ],
    instructions: `Step 1: Bash the green cardamom to break the shells, and grate the ginger. Melt ghee over medium heat in a large pot. Add cinnamon, cardamom, and cloves, cook for one minute. Add onion, cook for 7 minutes until golden.\nStep 2: Add garlic and ginger, cook for another minute. Stir in spices, cook for 30 seconds. Mix in tomato puree and salt, then add stock. Add chicken, stir, bring to a simmer.\nStep 3: Cook for 1 hour 45 minutes, stirring occasionally, until chicken is tender. Check tenderness with forks.\nStep 4: Remove lid, cook another 15 minutes to reduce sauce. Add yogurt (optional), extra garam masala, and fennel. Cook for a few more minutes.\nStep 5: Serve with naan bread, garnished with coriander leaves.`,
  },
  {
    id: "rishda",
    title: "Rishda",
    image: rishdaImage, // Make sure this image is correctly imported
    ingredients: [
      "Chickpeas (1 cup)",
      "Lamb (600g)",
      "Tomato Puree (4 tbsp/74g)",
      "Onions (5)",
      "Angel hair pasta (400g)",
      "Water for sauce (1 litre)",
      "Cinnamon (1 tbsp/4g)",
      "Chilli powder (1 tbsp/4g)",
      "Turmeric (1 tbsp/4g)",
      "Ginger (1 tbsp/4g)",
      "Clove (1 tbsp/4g)",
    ],
    instructions: `Step 1: Soak chickpeas overnight. Cut one onion into small pieces, four into thin slices. Cover pasta in oil, then cook in boiling water until done (7-10 mins). In a pan, cook 1 small piece onion, add tomato puree, cook a few mins.\nStep 2: Add meat, salt, spices, and 1 tbsp water. Cook on low heat, stirring. Add about 1 litre boiling water, simmer until meat is cooked (20-40 mins).\nStep 3: In another pan, cook 4 sliced onions. Add 1 tbsp turmeric, chickpeas, and simmer. Add a spoon of butter, 3-5 ladles meat sauce, 1 tbsp cinnamon, simmer a few mins.\nStep 4: Drain cooked pasta, add some meat sauce, mix thoroughly. Serve pasta with meat sauce over it, then chickpeas sauce. Enjoy!`,
  },
  {
    id: "tagine",
    title: "Lamb Tagine",
    image: tagineImage, // Ensure this image is correctly imported
    ingredients: [
      "Onions (4)",
      "Peas (160g)",
      "Lamb (600g)",
      "Carrot (1)",
      "Garlic (3 cloves)",
      "Potato (1)",
      "Tomato (3)",
      "Pepper (1)",
      "Paprika (1 Tbsp)",
      "Ginger (1 Tbsp)",
      "Turmeric (1 Tbsp)",
      "Parsley (Handful)",
    ],
    instructions: `Step 1: Marinate the meat with salt and lemon juice, refrigerate for a few hours. Mix spices, salt, black pepper, grated garlic with 2 tbsp water.\nStep 2: Marinate the meat in the spice mix for 10 mins. Chop tomatoes, onions, carrot, pepper, and potato.\nStep 3: Fry the meat in a clay tagine pan until golden. Layer vegetables over the meat in the order of onions, tomatoes, peas, carrot, potato, and pepper.\nStep 4: Pour remaining spice mix on top, sprinkle with salt, and simmer on low heat for 1 hour, basting every 10 mins. Garnish with parsley. Serve with Arabic bread or garlic naan.`,
  },
  {
    id: "tikka-masala",
    title: "Chicken Tikka Masala",
    image: tikkaMasalaImage, // Ensure this image is correctly imported
    ingredients: [
      "Chicken pieces (500g)",
      "Yoghurt (240ml)",
      "2 tbsp lemon juice",
      "2 tsp garam masala",
      "1 tsp cumin powder",
      "1 tsp coriander powder",
      "1 tsp turmeric powder",
      "1 tsp cayenne pepper (or more to taste)",
      "1 tsp salt",
      "3 tbsp vegetable oil",
      "1 onion, finely chopped",
      "3 cloves of garlic, minced",
      "1 inch ginger, minced",
      "1 can (400g) diced tomatoes",
      "Heavy cream (250ml)",
      "1 tsp kasoori methi (dried fenugreek leaves)",
      "1 tsp sugar",
      "Fresh cilantro for garnish",
    ],
    instructions: `Step 1: In a large bowl, mix together yogurt, lemon juice, garam masala, cumin powder, coriander powder, turmeric powder, cayenne pepper, and salt. Add chicken pieces and marinate for at least 2 hours, or overnight in the refrigerator.\nStep 2: Heat oil in a large pan over medium heat. Add onions, garlic, and ginger and sauté until the onions are golden brown.\nStep 3: Add the diced tomatoes, heavy cream, kasoori methi, and sugar. Bring the mixture to a simmer and cook for 5 minutes.\nStep 4: Add the marinated chicken to the pan and bring to a simmer. Cover and cook for 15-20 minutes, or until the chicken is cooked through.\nStep 5: Garnish with fresh cilantro and serve over rice or with naan bread.`,
  },
  {
    id: "maqluba",
    title: "Maqluba",
    image: maqlubaImage, // Ensure this image is correctly imported
    ingredients: [
      "Aubergine (2) sliced",
      "Potatoes (2) sliced",
      "Chicken (600g) pieces",
      "Rice (400g)",
      "Onion (2) finely chopped",
      "Tomatoes (4) diced",
      "Tomato paste (4 tbsp)",
      "Garlic (8 cloves) minced",
      "Chicken stock (4 cups)",
      "Cumin (1 tbsp)",
      "Turmeric (1 tbsp)",
    ],
    instructions: `Step 1: Peel and slice the potato and aubergine. Fry the potato slices in a pan with oil for about 5 minutes or until golden brown. Remove from pan and set aside. Then, fry the aubergine slices in the same pan for about 5 minutes or until golden brown. Remove from pan and set aside.\nStep 2: In a large pot, add the chicken and fry it with some oil until golden brown. Add the chopped onions and fry for another 3-4 minutes. Add in the tomatoes, tomato paste, garlic, and spices (cumin, cinnamon, turmeric, and salt) and fry for a few minutes until the tomatoes are softened.\nStep 3: Add the rice to the pot and mix well with the chicken mixture. Then add enough water to cover the ingredients in the pot. Bring it to a boil, then reduce the heat to low and cover the pot. Cook for about 15-20 minutes or until the rice is cooked and the water is absorbed.\nStep 4: In a large oven-proof dish, layer the rice mixture at the bottom. Place the fried potato slices on top of the rice, followed by the fried aubergine slices. Repeat the layering process until all the ingredients are used up.\nStep 5: Cover the dish with foil and bake in the preheated oven for about 20-25 minutes or until the top layer is golden brown and crispy. Serve hot with yoghurt on top if desired.`,
  },
  {
    id: "chicken-burger-cheese-bites",
    title: "Chicken burger & Cheese bites",
    image: chickenBurgerCheeseBitesImage, // Ensure this image is correctly imported
    ingredients: [
      "Chicken breast (2)",
      "Salt (1 tsp)",
      "Pepper (1 tsp)",
      "Garlic powder (1 tsp)",
      "Onion powder (1 tsp)",
      "Breadcrumbs (1/2 cup)",
      "Egg (3)",
      "Buns (4)",
      "Jalapeño peppers slices",
      "Cream cheese (8 oz)",
      "Shredded cheddar cheese (1 cup)",
      "All-purpose flour (1/2 cup)",
      "Panko breadcrumbs (1/2 cup)",
    ],
    instructions: `Step 1: Chicken Burgers\n1.1 Preheat a pan or griddle to medium-high heat.\n1.2 Mix together garlic powder, onion powder, and flour in a shallow dish.\n1.3 Beat 1 egg in another shallow dish.\n1.4 Place breadcrumbs in a third shallow dish.\n1.5 Slice each chicken breast into 2 slices to make 4 in total, then dip into the flour mixture, then the egg mixture, and then the breadcrumbs.\n1.6 Cook the coated chicken breasts on the preheated pan or griddle for 6-7 minutes on each side, or until cooked through.\n1.7 Serve each chicken breast on a burger bun with your favorite toppings.\n\nStep 2: Jalapeno Cheese Bites\n2.1 Mix together grated cheese, cream cheese, and onion powder in a bowl.\n2.2 Take a small round slice of jalapeno and place a small spoonful of the cheese mixture on top.\n2.3 Roll the cheese mixture and jalapeno slice into a ball and repeat with remaining slices and cheese mixture.\n2.4 Mix together flour and onion powder in a shallow dish.\n2.5 Beat 1 egg in another shallow dish.\n2.6 Place breadcrumbs in a third shallow dish.\n2.7 Dip each cheese ball into the flour mixture, then the egg mixture, and then the breadcrumbs.\n2.8 Cook the coated cheese balls on the preheated pan or griddle for 2-3 minutes on each side, or until golden brown.\nServe hot and enjoy!`,
  },
  {
    id: "shepherds-pie",
    title: "Shepherd’s Pie",
    image: shepherdsPieImage, // Ensure this image is correctly imported
    ingredients: [
      "1 lb (450g) ground lamb or beef",
      "1 onion, diced",
      "2 cloves of garlic, minced",
      "1 cup (240ml) beef or chicken broth",
      "1 cup (240ml) frozen peas",
      "1 cup (240ml) frozen corn",
      "1 teaspoon (5ml) thyme",
      "1 teaspoon (5ml) rosemary",
      "1 teaspoon (5ml) Worcestershire sauce",
      "Salt and pepper, to taste",
      "4 cups (960ml) mashed potatoes",
      "1 cup (240ml) grated cheddar cheese",
    ],
    instructions: `Step 1: Preheat oven to 400°F (200°C). Cook the ground lamb or beef over medium heat until browned. Add diced onion and minced garlic, cooking until onion is soft (about 5 minutes).\nStep 2: Add broth, peas, corn, thyme, rosemary, Worcestershire sauce, salt, and pepper. Simmer for 10 minutes.\nStep 3: Prepare mashed potatoes. Boil diced potatoes until tender, then mash with milk, butter, salt, and pepper to taste.\nStep 4: Grease a 9x13 inch baking dish. Pour meat mixture into the dish, top with mashed potatoes, and sprinkle with cheddar cheese.\nStep 5: Bake for 25-30 minutes until cheese melts and potatoes are lightly browned. Let cool before serving.`,
  },
  {
    id: "kimchi-noodles",
    title: "Kimchi Noodles",
    image: kimchiNoodlesImage, // Ensure this image is correctly imported
    ingredients: [
      "Onions (2)",
      "Garlic (2 cloves)",
      "Tomato sauce (4 tbsp)",
      "Harissa (1 tbsp)",
      "Sardines (2 tins)",
      "Kimchi (1 Pot)",
      "Angel hair pasta (500g)",
      "Boiling water (1L)",
    ],
    instructions: `Step 1: Heat oil in a pan over medium heat. Add chopped onions and garlic cloves and fry until softened.\nStep 2: Properly wash the sardines with cold water in a sieve.\nStep 3: Add tomato sauce, harissa, kimchi, and sardines to the pan and mix well.\nStep 4: Add 1 litre of boiling water, with salt, to the pan and stir. Cook for 5 minutes.\nStep 5: Add the desired amount of angel hair pasta to the pan and stir. Cook until pasta is fully cooked.`,
  },
  // ... Continue this pattern for the rest of the recipes
];

export default recipesData;
