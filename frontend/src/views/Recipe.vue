<template>
  <Navbar />

  <!-- Loading Screen -->
  <div v-if="isLoading">
    <Loading />
  </div>

  <!-- Recipe Content -->
  <div class="container" v-else-if="recipe">

    <!-- Row 1: Image and Charts -->
    <div class="row p-1 mb-3" >
      <div class="col-1">
        <div id="favbutton"> <FavoriteButton :recipe="recipe" /> </div>
      </div>
      <div class="col-11">
        <h3 style="text-shadow: 5px 5px 5px lightgrey;">{{ recipe.label }}</h3>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="image-container mb-5" style="box-shadow: 8px 8px 5px grey;">
          <img :src="recipe.image" alt="Recipe Image" class="recipe-image" />
        </div>
        <!-- Calories Info Block -->
        <div class="caloriesblock my-3">
          <div id="info" class="p-4 c-1">
            <p><strong>Calories:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
            <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
            <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
            <p><strong>Cuisine Type:</strong> {{ recipe.cuisineType.join(', ') }}</p>
            <p><strong>Serving Size:</strong> {{ recipe.yield }}</p>
            <p><strong>Preparation Link:</strong> <a :href="recipe.url" target="_blank">{{ recipe.url }}</a></p>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="mb-3">
          <h4 class="text-center">Summary of Important Macros</h4>
          <div class="chart-container">
            <PieIndivRecipe v-if="recipe" :recipe="recipe" />
          </div>
        </div>

        <div class="mt-3">
          <h4 class="text-center">Fat Types Composition</h4>
          <div class="chart-container">
            <RadialIndivRecipe v-if="recipe" :recipe="recipe"/>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-12  col-sm-12">
        <div class="nutrition-facts p-4">
          <h3>Nutrition Facts</h3>
          <div v-for="(nutrient, index) in recipe.digest" :key="index">
            <p><strong>{{ nutrient.label }}:</strong> {{ nutrient.total.toFixed(2) }} {{ nutrient.unit }}</p>
            <div v-if="nutrient.sub" style="margin-left: 20px;">
              <div v-for="(subItem, subIndex) in nutrient.sub" :key="subIndex">
                <p><strong>{{ subItem.label }}:</strong> {{ subItem.total.toFixed(2) }} {{ subItem.unit }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Recipe not found. Please go back and try again.</p>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import PieIndivRecipe from "@/components/PieIndivRecipe.vue";
import RadialIndivRecipe from "@/components/RadialIndivRecipe.vue";
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FavoriteButton from "@/components/FavoriteButton.vue";
import Loading from "@/components/Loading.vue";

const route = useRoute();
const recipe = ref(null);
const isLoading = ref(true);

const fetchRecipeDetails = async (uri) => {
  try {
    const appId = import.meta.env.VITE_EDAMAM_APP_ID;
    const apiKey = import.meta.env.VITE_EDAMAM_API_KEY;
    const response = await axios.get(`https://api.edamam.com/search`, {
      params: { r: uri, app_id: appId, app_key: apiKey },
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
  if (uri) {
    await fetchRecipeDetails(decodeURIComponent(uri));
  } else {
    isLoading.value = false;
  }
});
</script>

<style scoped>

.recipe-image {
  width: 100%;
  border-radius: 8px;
}

#info,
.nutrition-facts {
  background-color: rgb(193, 225, 187);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #ddd;
}

#info {
  overflow-wrap: break-word;
  /* Wraps long words or URLs to the next line */
  word-break: break-word;
  /* Adds breaks within words if necessary */
  white-space: normal;
  /* Ensures text wraps within the container */
  padding: 15px;
  /* Keeps consistent padding */
  box-sizing: border-box;
  /* Includes padding and border in element's total width */
}

/* Ensure chart container adapts to different screen sizes */
.chart-container {
  padding: 10px;
  text-align: center;
  width: 100%;  /* Ensure the container takes full width */
  max-height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

</style>