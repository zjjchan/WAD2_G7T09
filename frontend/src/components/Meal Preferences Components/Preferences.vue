<template>
  <WelcomeModal v-if="showModal" @close="showModal = false" @preferencesUpdated="fetchUserData" />
  <div class="preferences-container">
    <h2 class="preferences-title">Your Preferences</h2>
    <div class="selected-preferences">
      <div class="preferences-section">
      <span class="section-title">Diet Type:</span>
      <span class="section-content">{{ selectedDietType?.join(', ') || 'Not selected' }}</span>
    </div>
    
    <div class="preferences-section">
      <span class="section-title">Health Labels:</span>
      <span v-if="selectedLabels?.length" class="section-content">
        {{ selectedLabels.join(', ') }}
      </span>
      <span v-else class="section-content">None</span>
    </div>
    
    <div class="preferences-section">
      <span class="section-title">Cuisines:</span>
      <span v-if="selectedCuisine?.length" class="section-content">
        {{ selectedCuisine.join(', ') }}
      </span>
      <span v-else class="section-content">Not selected</span>
    </div>
    </div>

    
    <button @click="openModal" class="edit-button">Edit Preferences</button>
  </div>
</template>

<script setup>
import WelcomeModal from '@/components/WelcomeModal.vue';
import { ref, onMounted } from 'vue';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const showModal = ref(false);
const auth = getAuth();
const db = getFirestore();
const user = auth.currentUser;

const selectedDietType = ref([]);
const selectedLabels = ref([]);
const selectedCuisine = ref([]);

const fetchUserData = async () => {
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        selectedDietType.value = userDoc.data().healthGoals || [];
        selectedLabels.value = userDoc.data().dietaryPreferences || [];
        selectedCuisine.value = userDoc.data().cuisineTypes || [];
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

<style scoped>

.selected-preferences {
  overflow-y: scroll;
}
.preferences-container {
  background-color: #DAE2BC;
  border-radius: 1.5rem;
  max-width: 750px;
  margin: auto;
  padding: 1.5rem;
  height: 310px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: space-between;
}

.preferences-title {
  color: #4A5240;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.preferences-section {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #4A5240;
}

.section-title {
  font-weight: 600;
  margin-right: 0.5rem;
}

.section-content {
  color: #666;
  text-align: right;
  flex: 1;
}

.edit-button {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: center;
}

.edit-button:hover {
  background-color: #6d7658;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .preferences-container {
    padding: 0.75rem;
  }

  .preferences-title {
    font-size: 1.15rem;
  }

  .preferences-section {
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.85rem;
  }

  .section-title {
    margin-right: 0;
    font-weight: 500;
  }

  .section-content {
    text-align: left;
  }

  .edit-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
