<template>
  <Navbar />
  <div class="container-fluid">
    Recipe
  </div>
  <div v-if="recipe">
    <h1>{{ recipe.label }}</h1>
    <img :src="recipe.image" alt="Recipe Image" />
    <p><strong>Calories:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
    <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
    <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
    <p><strong>Cuisine Type:</strong> {{ recipe.cuisineType.join(', ') }}</p>
    <h3>Nutrition Facts</h3>
    <div v-for="(nutrient, index) in recipe.digest" :key="index">
      <p>
        <strong>{{ nutrient.label }}:</strong>
        {{ nutrient.total.toFixed(2) }} {{ nutrient.unit }}
      </p>

      <!-- Sub-labels for the digest items -->
      <div v-if="nutrient.sub" style="margin-left: 20px;">
        <h5>Sub-labels:</h5>
        <div v-for="(subItem, subIndex) in nutrient.sub" :key="subIndex">
          <p>
            <strong>{{ subItem.label }}:</strong>
            {{ subItem.total.toFixed(2) }} {{ subItem.unit }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Recipe not found. Please go back and try again.</p>
  </div>

  <!-- Yi Ting you can ignore this just don't delete, it's supposed to be the visuals for each recipe nutrients-->
  <!-- <IndivRecipeVisual :recipe="recipe" /> -->
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import IndivRecipeVisual from "@/components/IndivRecipeVisual.vue";
</script>

<script>
export default {
  data() {
    return {
      recipe: null, // Holds the selected recipe
    };
  },
  mounted() {
    // Retrieve the recipe from localStorage or any state management solution (e.g., Vuex)
    const savedRecipe = localStorage.getItem('selectedRecipe');
    if (savedRecipe) {
      this.recipe = JSON.parse(savedRecipe);
      console.log(this.recipe);
    }
  }
};
</script>