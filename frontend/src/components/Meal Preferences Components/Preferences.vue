<template>
  <WelcomeModal v-if="showModal" @close="showModal = false" @preferencesUpdated="fetchUserData" />
  <div class="preferences-container">
    <h2>Your Preferences</h2>
    <div>
      Selected Diet Type(s):
      {{ selectedDietType }}
    </div>
    <div>
      Health Label(s):
      <ul>
      <li v-for="label of selectedLabels">
        {{ label }}
      </li>
    </ul>
    </div>
    <div>
      Cuisine(s):
      <ul>
      <li v-for="cuisine of selectedCuisine">
        {{ cuisine }}
      </li>
    </ul>
    </div>
    <button @click="openModal">Edit Preferences</button>
  </div>
</template>

<script setup>
import WelcomeModal from '@/components/WelcomeModal.vue';
import { ref, onMounted } from 'vue';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const showModal = ref(false);
const auth = getAuth();
const userId = ref(null);   
const db = getFirestore();
const user = auth.currentUser; 
const selectedDietType = ref(null); 
const selectedLabels = ref(null); 
const selectedCuisine = ref(null);

const fetchUserData = async () => {
  if (user) {
    const userRef = doc(db, 'users', user.uid); 
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        selectedDietType.value = userDoc.data().healthGoals;
        selectedLabels.value = userDoc.data().dietaryPreferences;
        selectedCuisine.value = userDoc.data().cuisineTypes;
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  } else {
    console.log('User not authenticated');
  }
};

onMounted(fetchUserData); 
const openModal = () => {
  showModal.value = true;
};

</script>

<style>
/* Add your styles here */
</style>
