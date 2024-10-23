<template>
    <div class="home-page">
      <Navbar />
      <div class="container-fluid py-4">
        <div class="row">
          <div class="col-md-8">
            <div class="content-area p-3 bg-light rounded">
              <MealPlanCard />
            </div>
          </div>
          <div class="col-md-4">
            <SavedRecipesCard />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import Navbar from "@/components/Navbar.vue";
  import SavedRecipesCard from "@/components/SavedRecipesCard.vue";
  import MealPlanCard from "@/components/MealPlanCard.vue";
  </script>
  
  <style scoped>
  .home-page {
    font-family: 'Arial', sans-serif;
    background-color: #f0f4f8;
    min-height: 100vh;
  }
  
  h1 {
    color: #333;
    font-size: 2.5rem;
    font-weight: bold;
  }
  
  h2 {
    color: #444;
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .content-area {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .col-md-8, .col-md-4 {
      margin-bottom: 1rem;
    }
  }
  </style>