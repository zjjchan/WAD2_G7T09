<template>
  <div class="home-page">
    <Navbar />
    <div class="container-wrapper">
      <div class="layout-container">
        <div class="meal-plan-section">
          <MealPlanCard />
        </div>
        <div class="saved-recipes-section">
          <SavedRecipesCard />
        </div>
        <div class="preferences-section">
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
import Preferences from "@/components/Meal Preferences Components/Preferences.vue";
import { onMounted } from 'vue';
import { gsap } from "gsap";

onMounted(() => {
  gsap.to(".container-wrapper", { duration: 1, y: 20 });
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
  padding: 1rem;
  box-sizing: border-box;
}

.layout-container {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  grid-template-rows: auto auto; 
  gap: 1.5rem;
}

.meal-plan-section {
  grid-column: 1 / span 2; 
  grid-row: 1; 
  background-color: #DAE2BC;
  border-radius: 2.5rem;
  padding: 1.5rem;
  box-sizing: border-box;
}

.saved-recipes-section {
  grid-column: 1; 
  grid-row: 2;
  background-color: #DAE2BC;
  border-radius: 2.5rem;
  padding: 1.5rem;
  box-sizing: border-box;
}

.preferences-section {
  grid-column: 2;
  grid-row: 2;
  background-color: #DAE2BC;
  border-radius: 2.5rem;
  padding: 1.5rem;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .layout-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
