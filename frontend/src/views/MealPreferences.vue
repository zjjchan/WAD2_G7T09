<template>
    <div class="home-page">
      <Navbar />
      <div class="container-wrapper">
        <div class="grid-layout logo">
          <div class="saved-recipes-section">
            <SavedRecipesCard />
          </div>
  
          <div class="menu-section">
            <MealPlanCard />
          </div>
          <div class="grocery-section">
            <GroceryListCard />
          </div>
  
          <div class="nutrition-section">
            <Preferences />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import Navbar from "@/components/Navbar.vue";
  import SavedRecipesCard from "@/components/Meal Preferences Components/SavedRecipesCard.vue";
  import MealPlanCard from "@/components/Meal Preferences Components/MealPlanCard.vue";
  import GroceryListCard from "@/components/Meal Preferences Components/GroceryListCard.vue";
  import Preferences from "@/components/Meal Preferences Components/Preferences.vue";
  import { onMounted } from 'vue';
  import { gsap } from "gsap";
  
  onMounted(() => {
    gsap.to(".logo", { duration: 1, y: 20});
  });
  
  </script>
  
  <style scoped>
  .home-page {
    min-height: 100vh;
    background-color: #ffffff;
    font-family: 'Poppins', sans-serif;
    width: 100%;
    min-width: 320px; 
    overflow-x: hidden; 
  }
  
  .container-wrapper {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem 1rem 1rem;
    box-sizing: border-box;
  }
  
  .grid-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 1.5rem;
    width: 100%;
  }
  
  .saved-recipes-section,
  .menu-section,
  .grocery-section,
  .nutrition-section {
    background-color: #DAE2BC;
    border-radius: 2.5rem;
    padding: 1.5rem;
    min-width: 0; 
    width: 100%;
    box-sizing: border-box;
  }
  
  .grocery-section,
  .nutrition-section {
    background-color: #FFE5D9;
  }
  
  h2 {
    color: #4A5240;
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 1024px) {
    .container-wrapper {
      padding: 0.75rem;
    }
    
    .grid-layout {
      gap: 1rem;
    }
  }
  
  @media (max-width: px) {
    .grid-layout {
      grid-template-columns: 1fr;
    }
    
    .saved-recipes-section,
    .menu-section,
    .grocery-section,
    .nutrition-section {
      padding: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .container-wrapper {
      padding: 0.5rem;
    }
    
    .grid-layout {
      gap: 0.75rem;
    }
  }
  </style>