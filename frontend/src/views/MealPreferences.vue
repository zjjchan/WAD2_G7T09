<template>
  <Navbar />
  <div class="row">
    <div class="col-lg-1 col-md-1 col-sm-0"></div>
  <div class="col-lg-10 col-md-10 col-sm-12">
    <div class="home-page">
    
  <div class="components-wrapper">
    <div class="mx-4 my-4">
    <MealPlanCard />
  </div>
  <!-- Second row with Saved Recipes and Preferences -->
  <div class="row mx-4">
    <div class="col-lg-6 col-md-12">
      <div class="saved-recipes-section m-1">
        <SavedRecipesCard />
      </div>
    </div>
    <div class="col-lg-6 col-md-12">
      <div class="preferences-section m-1">
        <Preferences />
      </div>
    </div>
    <div class="sign-out-container col-12 pb-2">
        <button @click="handleSignOut" class="btn sign-out-btn">
          Sign Out
        </button>
    </div>
  </div>
  </div>
  </div>
  </div>
  <div class="col-lg-1 col-md-1 col-sm-0"></div>
  </div>

  
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import SavedRecipesCard from "@/components/Meal Preferences Components/SavedRecipesCard.vue";
import MealPlanCard from "@/components/Meal Preferences Components/MealPlanCard.vue";
import Preferences from "@/components/Meal Preferences Components/Preferences.vue";
import { onMounted } from 'vue';
import { gsap } from "gsap";
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';



const router = useRouter();
const auth = getAuth();

// onMounted(() => {
//   // gsap.to(".components-wrapper", { duration: 1, y: -20 });
//   const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
//   tooltipTriggerList.forEach(tooltipTriggerEl => {
//     new bootstrap.Tooltip(tooltipTriggerEl);
//   });
// });

const handleSignOut = async () => {
  try {
    await signOut(auth);
    router.push('/auth');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};


</script>

<style scoped>
body {
  overflow-x: hidden;
}

.home-page {
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

/* .container-wrapper {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 64px);
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
} */
/* 
.layout-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  height: auto;
} */
/* 
.meal-plan-section {
  background-color: #DAE2BC;
  border-radius: 2.5rem;
} */

/* .saved-recipes-section {
  grid-column: 1;
  grid-row: 2;
}

.preferences-section {
  grid-column: 2;
  grid-row: 2;

} */

.sign-out-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.sign-out-btn {
  background-color: #f44336;
  color: white;
}

  /* .container-wrapper {
    height: auto;
  } */

  /* .layout-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  } */
</style>