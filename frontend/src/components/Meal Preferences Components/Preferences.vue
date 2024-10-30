<template>
  <WelcomeModal v-if="showModal" @close="showModal = false" />
  <div class="preferences-container">
    <h2>Your Preferences</h2>
    <p>
      Selected Diet Type(s):
      {{ selectedDietType }}
    </p>
    <p>
      Health Labels
      {{ selectedLabels }}
    </p>
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

const fetchUserData = async () => {
  if (user) {
    const userRef = doc(db, 'users', user.uid); 
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        // Access user data here
        selectedDietType.value = userDoc.data().healthGoals;
        selectedLabels.value = userDoc.data().dietaryPreferences;
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
