<template>
  <Navbar />

  <!-- Display loading message while fetching the recipe data -->
  <div v-if="isLoading">
    <p>Loading recipe...</p>
  </div>

  <div v-else-if="recipe">
    <h3>{{ recipe.label }}
      <FavoriteButton :recipe="recipe" />
    </h3>
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
  <div class="row mx-1 my-3">
    <div class="col-sm-12 col-md-6">
      <div id="breakdownmacrostext" class="m-2 p-1">
        <h4 class="text-center" style="color: rgba(0, 100, 0, 1);">Summary of Important Macros</h4>
      </div>
      <div class="container bg-light border rounded border-2 p-1 d-flex justify-content-center">
        <PieIndivRecipe v-if="recipe" :recipe="recipe" />
      </div>
    </div>

    <div class="col-sm-12 col-md-6">
      <div id="fatcomptext" class="m-2 p-1">
        <h4 class="text-center" style="color: rgba(0, 100, 0, 1);">Fat Types Composition</h4>
      </div>
      <div class="container bg-light border rounded border-2 p-1 d-flex justify-content-center">
        <RadialIndivRecipe v-if="recipe" :recipe="recipe" />
      </div>
    </div>
  </div>
  <!-- Template for loading visual only after page load -->
  <!-- <componentnamehere v-if="variablename" :variablename="variablename" /> -->

  <!-- END -->

</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
// for importing doughnut chart
import PieIndivRecipe from "@/components/PieIndivRecipe.vue";
// for importing radar chart
import RadialIndivRecipe from "@/components/RadialIndivRecipe.vue";
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import FavoriteButton from "@/components/FavoriteButton.vue"; // Import the FavoriteButton component


const route = useRoute();

const isActiveLink = (routePath) => {
  return route.path === routePath;
}
const recipe = ref(null);
const isLoading = ref(true);

const auth = getAuth();
const user = ref(null);
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser;

});

const fetchRecipeDetails = async (uri) => {
  try {
    const appId = import.meta.env.VITE_EDAMAM_APP_ID;
    const apiKey = import.meta.env.VITE_EDAMAM_API_KEY;
    const response = await axios.get(`https://api.edamam.com/search`, {
      params: {
        r: uri,
        app_id: appId,
        app_key: apiKey,
      },
    });
    if (response.data && response.data.length > 0) {
      recipe.value = response.data[0];

    } else {
      console.warn("Recipe not found.");
    }
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
  } finally {
    isLoading.value = false;
  }
};


onMounted(async () => {
  const { uri } = route.params;
  console.log("Recipe URI:", uri); // Check if the URI is correctly received
  if (uri) {
    await fetchRecipeDetails(decodeURIComponent(uri));
  } else {
    isLoading.value = false;
  }
});
</script>

<script>

</script>

<style scoped>
/* #breakdownmacrostext,
#fatcomptext {
  background-color: rgba(0, 135, 0, 0.5);
} */
</style>