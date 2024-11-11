<template>
  <div class="meal-plan-card">
    <div class="container header-container">
  <div class="row">
    <div class="col-12 d-flex align-items-center justify-content-between flex-md-row flex-column">
      <h3 class="title col-lg-10 mb-2">Weekly Meal Plan</h3> 
      <div class="d-flex align-items-center">
        <button type="button" class="btn clear-all-btn me-4" @click="clearAllMeals">
          Clear All
        </button>
        <button type="button" class="btn tool-tip" 
          data-bs-toggle="tooltip" data-bs-placement="top"
          data-bs-custom-class="custom-tooltip"
          data-bs-title="Drag and drop from your saved recipes!">
          i
        </button>
      </div>
    </div>
  </div>
</div>

    <div class="scroll-wrapper">
      <div class="meal-plan-grid">
        <div v-for="day in days" :key="day" class="day-column">
          <div class="day-title-wrapper">
            <h3 class="day-title">{{ day }}</h3>
          </div>
          <div class="meal-times-wrapper">
            <div v-for="mealTime in mealTimes" :key="mealTime" class="meal-slot">
              <div class="meal-header">
                <h4 class="meal-time-title">{{ mealTime }}</h4>
                <button 
                  v-if="mealPlan[day][mealTime].length > 1"
                  class="dropdown-toggle"
                  @click="toggleDropdown(day, mealTime)"
                  :class="{ 'is-open': isDropdownOpen(day, mealTime) }"
                >
                  {{ mealPlan[day][mealTime].length }} dishes
                </button>
              </div>
              <Draggable
                v-model="mealPlan[day][mealTime]"
                :group="{ name: 'recipes', pull: true, put: mealPlan[day][mealTime].length === 0 }"
                :sort="true"
                item-key="uri"
                class="meal-drop-zone"
                ghost-class="ghost-item"
                drag-class="dragging-item"
                :animation="400"
                @change="handleDragChange"
              >
                <template #item="{ element, index }">
                  <div
                    v-if="index < 1 || isDropdownOpen(day, mealTime)"
                    class="meal-item"
                    :key="element.id"
                    :class="{ 'in-dropdown': index >= 1 }"
                  >
                    <img :src="element.image" :alt="element.label" class="meal-image" />
                    <div class="meal-details">
                      <p class="meal-name">{{ element.label }}</p>
                    </div>
                    <button @click="removeMeal(day, mealTime, element)" class="remove-btn">&times;</button>
                  </div>
                </template>
              </Draggable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted} from 'vue';
import Draggable from 'vuedraggable';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const db = getFirestore();
const auth = getAuth();

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTimes = ['Breakfast', 'Lunch', 'Dinner'];

const mealPlan = ref(
  days.reduce((acc, day) => {
    acc[day] = mealTimes.reduce((meals, mealTime) => {
      meals[mealTime] = [];
      return meals;
    }, {});
    return acc;
  }, {})
);

const openDropdowns = ref(new Set());

const getDropdownKey = (day, mealTime) => `${day}-${mealTime}`;

const toggleDropdown = (day, mealTime) => {
  const key = getDropdownKey(day, mealTime);
  if (openDropdowns.value.has(key)) {
    openDropdowns.value.delete(key);
  } else {
    openDropdowns.value.add(key);
  }
};

const isDropdownOpen = (day, mealTime) => openDropdowns.value.has(getDropdownKey(day, mealTime));

const removeMeal = async (day, mealTime, meal) => {
  const index = mealPlan.value[day][mealTime].indexOf(meal);
  if (index > -1) {
    mealPlan.value[day][mealTime].splice(index, 1);
    await saveMealPlan();
  }
};

const handleDragChange = async (evt) => {
  if (evt.added) {
    evt.added.element.uri = `${evt.added.element.uri}_${Date.now()}`;
  }
  
  await saveMealPlan();
};

const saveMealPlan = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDoc = doc(db, 'users', user.uid);
    await updateDoc(userDoc, {
      mealPlan: mealPlan.value
    });
  } catch (error) {
    console.error('Error saving meal plan:', error);
  }
};

const loadMealPlan = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDoc = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();
      mealPlan.value = data.mealPlan || mealPlan.value;
    }
  } catch (error) {
    console.error('Error loading meal plan:', error);
  }
};

const clearAllMeals = async () => {
  for (const day in mealPlan.value) {
    for (const mealTime in mealPlan.value[day]) {
      mealPlan.value[day][mealTime] = [];
    }
  }
  await saveMealPlan();
};

onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

auth.onAuthStateChanged((user) => {
  if (user) loadMealPlan();
});
</script>

<style scoped>
.meal-plan-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #DAE2BC;
  border-radius: 2.5rem;
  padding: 40px;
  height: 100%;
}
.clear-all-btn {
  background-color: #f44336;
  color: white;
  font-size: 8px;
}


.tool-tip {
  background-color: #4A5240;
  color: white; 
  border: none;
  border-radius: 50%; 
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
}

.tool-tip:hover {
  background-color: #4CAF50;
  color: #4A5240; 
}

/* .custom-tooltip .tooltip-inner {
  background-color: #4A5240; 
  color: #ffffff; 
  padding: 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); 
}
.custom-tooltip .tooltip-arrow {
  color: #4A5240; 
} */

.title {
  color: #4A5240;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 10px;
}

.scroll-wrapper {
  flex-grow: 1;
  overflow: auto;
  padding: 0 0.5rem;
}

.meal-plan-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(7, minmax(150px, 1fr));
  grid-template-rows: auto;
  overflow-x: auto;
  min-width: min-content;
}

.day-column {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  max-width: 200px;
}

.day-title-wrapper {
  position: sticky;
  top: 0;
  background-color: #4A5240;
  z-index: 10;
  width: 100px;
  border-radius: 15px;
  margin-bottom: 10px;
  margin-top: 5px;
  align-self: center;
}

.day-title {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0;
  text-align: center;
  color: #ffffff;
  margin: auto;
}

.meal-times-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meal-slot {
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 10px;
  height: 80px; /* Fixed height */
  min-height: 80px; /* Ensure minimum height */
  max-height: 80px; /* Enforce maximum height */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent content from expanding the slot */
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  height: 20px; /* Fixed height for header */
  min-height: 20px;
}

.meal-time-title {
  font-size: 0.75rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meal-drop-zone {
  height: 40px !important; /* Fixed height */
  min-height: 40px !important;
  max-height: 40px !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background-color 0.2s ease !important;
  background-color: transparent !important;
}

.meal-drop-zone:empty {
  border: 1px dashed #ccc !important;
  border-radius: 0.25rem !important;
  padding: 5px !important;
  height: 50px !important; /* Adjust for padding */
  min-height: 30px !important;
  max-height: 50px !important;
}
.meal-item {
  background-color: white;
  border-radius: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  box-sizing: border-box;
  height: 40px !important; /* Fixed height */
  min-height: 40px !important;
  max-height: 40px !important;
  overflow: hidden !important;
}

.meal-image {
  width: 32px;
  height: 32px;
  min-width: 32px; /* Prevent image from shrinking */
  object-fit: cover;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.meal-details {
  flex: 1;
  min-width: 0; /* Allow text container to shrink */
  overflow: hidden;
}

.meal-name {
  font-size: 0.75rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.remove-btn {
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  min-width: 18px; /* Prevent button from shrinking */
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.ghost-item {
  opacity: 0.5;
  transform: scale(0.95);
  background: #c8ebfb;
  height: 40px !important;
  max-height: 40px !important;
}

.dragging-item {
  cursor: grabbing;
  transform: scale(1.05);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  height: 40px !important;
  max-height: 40px !important;
}

.meal-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.meal-item.in-dropdown {
  animation: slideDown 0.2s ease;
}

* {
  transition: all 0.2s ease;
}

@media (max-width: 1024px) {
  .meal-plan-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}


@media (max-width: 1024px) {
  .meal-plan-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .meal-plan-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .meal-plan-card {
    width: 100%;
  }

  .scroll-wrapper {
    overflow-x: auto;
  }

  .meal-plan-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: nowrap;
    min-width: max-content;
    overflow-x: auto;
  }

  .day-column {
    min-width: 200px;
  }

  .meal-times-wrapper {
    gap: 0.25rem;
  }

  .meal-image {
    width: 24px;
    height: 24px;
  }

  .remove-btn {
    width: 16px;
    height: 16px;
    font-size: 0.625rem;
  }
}
</style>