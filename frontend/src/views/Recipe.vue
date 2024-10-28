<template>
  <Navbar />

  <!-- Display loading message while fetching the recipe data -->
  <div v-if="isLoading">
    <p>Loading recipe...</p>
  </div>
  <div v-else-if="recipe">
    <h1>{{ recipe.label }}</h1>
    <img :src="recipe.image" alt="Recipe Image" />
    <p><strong>Calories:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
    <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
    <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
    <p><strong>Cuisine Type:</strong> {{ recipe.cuisineType.join(', ') }}</p>
    <button @click="saveRecipe" class="btn btn-primary mt-3">Save to Favorites</button>
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
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
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

const saveRecipe = async () => {
  if (!user.value) {
    alert("You need to sign in to save recipes.");
    return;
  }

  try {
    const userDoc = doc(db, "users", user.value.uid);
    await updateDoc(userDoc, {
      favoritedRecipes: arrayUnion({
        label: recipe.value.label,
        uri: recipe.value.uri,
        image: recipe.value.image,
      })
    });
    alert("Recipe saved to favorites!");
  } catch (error) {
    console.error("Failed to save recipe:", error);
  }
};
const fetchRecipeDetails = async (uri) => {
  try {
    const appId = '374ab5b2';
    const apiKey = '160b560497690476362bc1fca361165a';
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