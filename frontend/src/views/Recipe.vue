<template>
  <Navbar />

  <!-- Display loading message while fetching the recipe data -->
  <div v-if="isLoading">
    <p>Loading recipe...</p>
  </div>

  <!-- Notification component -->
  
  <div v-else-if="recipe">
    <h3>{{ recipe.label }}
      <svg @click="toggleFavorite" class="btn" id="bookmark" xmlns="http://www.w3.org/2000/svg" width="70" height="70"
        :fill="isFavorited ? 'black' : 'white'" stroke="black" viewBox="0 0 24 24">
        <path d="M6 2a2 2 0 0 0-2 2v18l8-4.5 8 4.5V4a2 2 0 0 0-2-2H6z" />
      </svg>
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
  <div class="row">
    <div class="col-sm-12 col-md-6">
      <div id="breakdownmacrostext" class="m-2 p-1 border rounded">
        <h4 class="text-center">Summary of Important Macros</h4>
      </div>
      <div class="container bg-light border rounded p-1 d-flex justify-content-center">
        <PieIndivRecipe v-if="recipe" :recipe="recipe" />
      </div>
    </div>

    <div class="col-sm-12 col-md-6">
      <div id="fatcomptext" class="m-2 p-1 border rounded">
        <h4 class="text-center">Fat Types Composition</h4>
      </div>
      <div class="container bg-light border rounded p-1 d-flex justify-content-center">
        <RadialIndivRecipe v-if="recipe" :recipe="recipe" />
      </div>
    </div>
  </div>
  <!-- Template for loading visual only after page load -->
  <!-- <componentnamehere v-if="variablename" :variablename="variablename" /> -->

  <!-- END -->
  <Notification v-if="showNotification" :message="notificationMessage" :show="showNotification"
  @update:show="showNotification = $event" />
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
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import Notification from "@/components/Notification.vue"; // Import the notification component

const route = useRoute();

const isActiveLink = (routePath) => {
  return route.path === routePath;
}
const recipe = ref(null);
const isLoading = ref(true);
const isFavorited = ref(false);
const auth = getAuth();
const user = ref(null);
// Notification state
const showNotification = ref(false);
const notificationMessage = ref("");
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser;
  if (user.value && recipe.value) {
    checkIfFavorited();
  }
});

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
      if (user.value) {
        checkIfFavorited();
      }
    } else {
      console.warn("Recipe not found.");
    }
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
  } finally {
    isLoading.value = false;
  }
};
const checkIfFavorited = async () => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.value.uid));
    const favoritedRecipes = userDoc.data().favoritedRecipes || [];
    // Check if the recipe's URI exists in the user's favoritedRecipes
    isFavorited.value = favoritedRecipes.some((item) => item.uri === recipe.value.uri);
  } catch (error) {
    console.error("Failed to check if recipe is favorited:", error);
  }
};
const toggleFavorite = async () => {
  if (!user.value) {
    showNotificationMessage("You need to sign in to save recipes.");
    return;
  }

  try {
    const userDoc = doc(db, "users", user.value.uid);
    if (isFavorited.value) {
      await updateDoc(userDoc, {
        favoritedRecipes: arrayRemove({
          label: recipe.value.label,
          uri: recipe.value.uri,
          image: recipe.value.image,
        }),
      });
      isFavorited.value = false;
      showNotificationMessage("Recipe removed from favorites.");
    } else {
      await updateDoc(userDoc, {
        favoritedRecipes: arrayUnion({
          label: recipe.value.label,
          uri: recipe.value.uri,
          image: recipe.value.image,
        }),
      });
      isFavorited.value = true;
      showNotificationMessage("Recipe saved to favorites!");
    }
  } catch (error) {
    console.error("Failed to update favorites:", error);
  }
};
const showNotificationMessage = (message) => {
  notificationMessage.value = message;
  showNotification.value = true;
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
#breakdownmacrostext,
#fatcomptext {
  background-color: rgba(0, 135, 0, 0.5);
}
</style>