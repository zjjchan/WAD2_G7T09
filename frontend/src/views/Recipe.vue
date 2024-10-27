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

  <!-- START: Ignore this chunk Yi Ting, I making the visuals, can leave at the bottom for now -->
  <div>
    <div class="container bg-light border rounded p-3">
      <PieIndivRecipe v-if="recipe" :recipe="recipe" />
    </div>
    <div class="container bg-light border rounded p-3">
      <RadialIndivRecipe v-if="recipe" :recipe="recipe" />
    </div>
  </div>
  <!-- Template for loading visual only after page load -->
  <!-- <componentnamehere v-if="variablename" :variablename="variablename" /> -->

  <!-- END -->

</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import PieIndivRecipe from "@/components/PieIndivRecipe.vue";
import RadialIndivRecipe from "@/components/RadialIndivRecipe.vue";
</script>

<script>
import axios from "axios";
export default {
  data() {
    return {
      recipe: null, // Holds the selected recipe
    };
  },
  async mounted() {
    const { uri } = this.$route.params;
    if (uri) {
      await this.fetchRecipeDetails(decodeURIComponent(uri));
    }
  },
  methods: {
    async fetchRecipeDetails(uri) {
      try {
        const appId = '374ab5b2'; // Replace with actual App ID
        const apiKey = '160b560497690476362bc1fca361165a'; // Replace with actual API Key
        const response = await axios.get(`https://api.edamam.com/search`, {
          params: {
            r: uri,
            app_id: appId,
            app_key: apiKey,
          },
        });
        this.recipe = response.data[0];
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
      }
    },
  },
};
</script>