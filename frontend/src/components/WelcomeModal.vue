<template>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal" ref="modalOverlay">
      <div class="modal-content" ref="modalContent">
        <div v-if="currentStep === 'welcome'" class="welcome-screen" ref="welcomeScreen">
          <h2 class="text-3xl font-bold mb-4">Welcome to MealMate!</h2>
          <p class="text-lg mb-8">Let's get your meal preferences set up.</p>
          <button 
            @click="goToPreferences"
            class="get-started-btn"
            ref="getStartedBtn"
          >
            Get Started
            <span class="btn-shine"></span>
          </button>
        </div>
  
        <div v-if="currentStep === 'preferences'" class="preferences-screen" ref="preferencesScreen">
          <h2 class="text-2xl font-bold mb-4">Set Your Dietary Preferences</h2>
          
          <!-- Diet Type Section -->
          <div class="diet-type-section mb-8" ref="dietTypeSection">
            <h3 class="text-xl font-semibold mb-4">Diet Type</h3>
            <div class="diet-type-container">
              <label 
                v-for="(type, index) in dietTypes" 
                :key="'diet-' + index" 
                class="diet-type-label"
                :ref="el => { if (el) dietTypeRefs[index] = el }"
              >
                <input 
                  type="radio" 
                  :value="type" 
                  v-model="selectedDietType"
                  name="dietType"
                  class="diet-type-radio"
                />
                <span class="diet-type-text">{{ type }}</span>
              </label>
            </div>
          </div>
  
          <!-- Health Labels Section -->
          <h3 class="text-xl font-semibold mb-4">Health Labels</h3>
          <p class="text-lg mb-6">Select all that apply:</p>
  
          <div class="checkbox-container" ref="checkboxContainer">
            <label 
              v-for="(label, index) in healthLabels" 
              :key="index" 
              class="checkbox-label"
              :ref="el => { if (el) checkboxRefs[index] = el }"
            >
              <div class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  :value="label" 
                  v-model="selectedLabels"
                  class="custom-checkbox"
                />
                <span class="checkmark"></span>
              </div>
              <span class="label-text">{{ label }}</span>
            </label>
          </div>

          <h3 class="text-xl font-semibold mb-4">Cuisine Types</h3>
          <p class="text-lg mb-6">Choose your favourite cuisines:</p>
          <div class="checkbox-container" ref="checkboxContainer">
            <label 
              v-for="(label, index) in cuisineTypes" 
              :key="index" 
              class="checkbox-label"
              :ref="el => { if (el) checkboxRefs[index] = el }"
            >
              <div class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  :value="label" 
                  v-model="selectedCuisine"
                  class="custom-checkbox"
                />
                <span class="checkmark"></span>
              </div>
              <span class="label-text">{{ label }}</span>
            </label>
          </div>
  
          <div class="modal-buttons" ref="buttonContainer">
            <button 
              class="modal-button secondary" 
              @click="goBack"
              ref="backBtn"
            >
              Back
            </button>
            <button 
              class="modal-button primary" 
              @click="submitPreferences"
              ref="submitBtn"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, nextTick, defineEmits } from 'vue';
  import gsap from 'gsap';
  import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  

  
  const emit = defineEmits(['preferencesUpdated']);
  const auth = getAuth();
  const userId = ref(null);   

  const db = getFirestore();
  
  const showModal = ref(true);
  const currentStep = ref('welcome');
  const modalContent = ref(null);
  const modalOverlay = ref(null);
  const getStartedBtn = ref(null);
  const checkboxContainer = ref(null);
  const checkboxRefs = ref([]);
  const dietTypeRefs = ref([]);
  const buttonContainer = ref(null);
  const welcomeScreen = ref(null);
  const preferencesScreen = ref(null);
  const dietTypeSection = ref(null);
  const user = auth.currentUser; 
  
  const dietTypes = [
    'Balanced',
    'High-Fiber',
    'High-Protein',
    'Low-Carb',
    'Low-Fat',
    'Low-Sodium',
    'None'
  ];
  
  const healthLabels = [
    'Alcohol-Cocktail', 'Alcohol-Free', 'Celery-Free', 'Crustacean-Free',
    'Dairy-Free', 'DASH', 'Egg-Free', 'Fish-Free', 'Fodmap-Free',
    'Gluten-Free', 'Immuno-Supportive', 'Keto-Friendly', 'Kidney-Friendly',
    'Kosher', 'Low-Fat-Abs', 'Low-Potassium', 'Low-Sugar', 'Lupine-Free',
    'Mediterranean', 'Mollusk-Free', 'Mustard-Free', 'No-oil-added',
    'Paleo', 'Peanut-Free', 'Pescatarian', 'Pork-Free', 'Red-Meat-Free',
    'Sesame-Free', 'Shellfish-Free', 'Soy-Free', 'Sugar-Conscious',
    'Sulfite-Free', 'Tree-Nut-Free', 'Vegan', 'Vegetarian', 'Wheat-Free'
  ];
  
  const cuisineTypes = [
  'American',
  'Asian',
  'British',
  'Caribbean',
  'Central Europe',
  'Chinese',
  'Eastern Europe',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Kosher',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Nordic',
  'South American',
  'South East Asian',
    ]

  const selectedLabels = ref([]);
  const selectedDietType = ref('Balanced');
  const selectedCuisine = ref([]);
  
  const fetchUserData = async () => {
  if (user) {
    const userRef = doc(db, 'users', user.uid); 
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Update reactive fields with data from Firestore
        selectedDietType.value = data.healthGoals || ['Balanced']; // Default to 'Balanced' if not set
        selectedLabels.value = data.dietaryPreferences || [];
        selectedCuisine.value = data.cuisineTypes || [];
        
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
  
  onMounted(() => {
    fetchUserData()

    gsap.from(modalOverlay.value, {
      duration: 0.3,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      ease: 'power2.inOut'
    });
  
    gsap.from(modalContent.value, {
      duration: 0.5,
      y: 50,
      opacity: 0,
      ease: 'back.out(1.2)'
    });
  });
  
  const goToPreferences = () => {
    // Animate button click
    gsap.to(getStartedBtn.value, {
      duration: 0.1,
      scale: 0.95,
      yoyo: true,
      repeat: 1
    });
  
    // Transition to preferences screen
    gsap.to(welcomeScreen.value, {
      duration: 0.3,
      opacity: 0,
      x: -50,
      onComplete: () => {
        currentStep.value = 'preferences';
        nextTick(() => {
          // Animate preferences screen elements
          gsap.from(preferencesScreen.value, {
            duration: 0.3,
            opacity: 0,
            x: 50
          });
  
          // Animate diet type options
          gsap.from(dietTypeRefs.value, {
            duration: 0.5,
            opacity: 0,
            y: 20,
            stagger: 0.02,
            ease: 'power2.out'
          });
  
          // Animate checkboxes
          gsap.from(checkboxRefs.value, {
            duration: 0.5,
            opacity: 0,
            y: 20,
            stagger: 0.02,
            ease: 'power2.out',
            delay: 0.2
          });
        });
      }
    });
  };
  
  const goBack = () => {
    gsap.to(preferencesScreen.value, {
      duration: 0.3,
      opacity: 0,
      x: 50,
      onComplete: () => {
        currentStep.value = 'welcome';
        nextTick(() => {
          gsap.from(welcomeScreen.value, {
            duration: 0.3,
            opacity: 0,
            x: -50
          });
        });
      }
    });
  };

  
  const submitPreferences = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        healthGoals: selectedDietType.value,
        dietaryPreferences: selectedLabels.value,
        cuisineTypes: selectedCuisine.value
      });
      emit('preferencesUpdated');
      closeModal();
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
  }
};

  
  const closeModal = () => {
    gsap.to(modalOverlay.value, {
      duration: 0.3,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      onComplete: () => {
        showModal.value = false;
      }
    });
  };
  </script>
  
  <style scoped>
  .preferences-screen {
    height: 100%;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    background: white;
    padding: 2.5rem; /* Reduced padding */
    border-radius: 12px; /* Slightly reduced border radius */
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .diet-type-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* Smaller min-width */
    gap: 0.5rem; /* Reduced gap */
    margin-bottom: 0.5rem; /* Reduced margin */
    height: 10vh;
    overflow-y: auto;
  }

  .diet-type-label {
    display: flex;
    align-items: center;
    padding: 0.5rem; /* Reduced padding */
    border: 1px solid #4CAF50;
    border-radius: 6px;
    font-size: 0.9rem; /* Smaller font size */
  }

  
  .diet-type-label:hover {
    background-color: rgba(76, 175, 80, 0.1);
    }

  .diet-type-radio {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .diet-type-text {
    font-weight: 500;
    color: #333;
  }

  
  .diet-type-radio:checked + .diet-type-text {
    color: #4CAF50;
  }
  
  .diet-type-radio:checked ~ .diet-type-label {
    background-color: rgba(76, 175, 80, 0.1);
    border-color: #4CAF50;
  }
  
  .diet-type-label, .diet-type-radio:checked + .diet-type-text {
    box-shadow: none;
    background-image: none;
}


  .get-started-btn {
    position: relative;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: bold;
    color: white;
    background: #4CAF50;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.3s;
  }
  
  .get-started-btn:hover {
    transform: translateY(-2px);
  }
  
  .btn-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(45deg);
    animation: shine 3s infinite;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }
  
  .checkbox-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Smaller min-width */
    gap: 0.5rem; /* Reduced gap */
    max-height: 15vh;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  
  .checkbox-label {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    font-size: 0.85rem;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  
  .checkbox-label:hover {
    background-color: rgba(76, 175, 80, 0.1);
  }
  
  .checkbox-wrapper {
    position: relative;
    width: 24px;
    height: 24px;
    margin-right: 0.75rem;
  }
  
  .custom-checkbox {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    background-color: #fff;
    border: 2px solid #4CAF50;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .custom-checkbox:checked ~ .checkmark {
    background-color: #4CAF50;
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 8px;
    top: 4px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .custom-checkbox:checked ~ .checkmark:after {
    display: block;
  }
  
  .modal-buttons {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem; /* Reduced gap */
    margin-top: 1rem; /* Reduced margin */
  }
  
  .modal-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .modal-button.primary {
    background: #4CAF50;
    color: white;
  }
  
  .modal-button.primary:hover {
    background: #45a049;
    transform: translateY(-2px);
  }
  
  .modal-button.secondary {
    background: #f5f5f5;
    color: #333;
  }
  
  .modal-button.secondary:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    .modal-content {
      padding: 1rem;
      width: 95%;
    }
  
    .checkbox-container {
      grid-template-columns: 1fr;
    }
  
    .diet-type-container {
      grid-template-columns: 1fr;
    }
  
    .modal-buttons {
      flex-direction: column;
    }
  
    .modal-button {
      width: 100%;
    }
  }
  
  /* Custom scrollbar */
  .checkbox-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .checkbox-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .checkbox-container::-webkit-scrollbar-thumb {
    background: #4CAF50;
    border-radius: 4px;
  }
  
  .diet-type-container::-webkit-scrollbar-thumb:hover {
    background: #45a049;
  }

  .diet-type-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .diet-type-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .diet-type-container::-webkit-scrollbar-thumb {
    background: #4CAF50;
    border-radius: 4px;
  }
  
  .diet-type-container::-webkit-scrollbar-thumb:hover {
    background: #45a049;
  }
  </style>

