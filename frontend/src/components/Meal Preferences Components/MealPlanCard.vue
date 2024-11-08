<template>
  <div class="meal-plan-card">
    <h3 class="title">This Week's Menu</h3>
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
                :group="{ name: 'recipes', pull: true, put: true }"
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
import { ref } from 'vue';
import Draggable from 'vuedraggable';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore, getDoc } from 'firebase/firestore';

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

auth.onAuthStateChanged((user) => {
  if (user) loadMealPlan();
});
</script>

<style scoped>
.meal-plan-card {
  /* width: 100%;
  height: 100%; */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #DAE2BC;
  border-radius: 2.5rem;
  padding: 20px;
}

.title {
  color: #4A5240;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.scroll-wrapper {
  flex-grow: 1;
  overflow: auto;
  padding: 0 0.5rem;
}

.meal-plan-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(7, 1fr); /* 7 columns for 7 days */
  grid-template-rows: auto;
  overflow-x: auto;
  min-width: min-content;
}

.day-column {
  display: flex;
  flex-direction: column;
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
  color: #FFE5D9;
  margin: auto;
}

.meal-times-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meal-slot {
  background-color: #FFE5D9;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 10px;
  /* Set a fixed height */
  height: 80px; /* Adjust this value as needed */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center the content */
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meal-time-title {
  font-size: 0.75rem;
  margin: 0;
}

.meal-name {
  font-size: 0.75rem;
  margin: 0;
}

.dropdown-toggle {
  background-color: #4A5240;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.625rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-toggle:hover {
  background-color: #5a6350;
}

.meal-item {
  background-color: white;
  border-radius: 0.25rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.meal-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.meal-details {
  flex: 1;
  overflow: hidden;
}

.remove-btn {
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.meal-drop-zone {
  min-height: 40px; /* Keeps a minimum height for empty drop zones */
  height: 100%; /* Ensures the drop zone fills the meal-slot container */
  overflow: hidden; /* Prevents expansion of the container */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.meal-drop-zone:empty {
  padding: 5px;
  border: 1px dashed #ccc;
  border-radius: 0.25rem;
}

.ghost-item {
  opacity: 0.5;
  transform: scale(0.95);
  background: #c8ebfb;
}

.dragging-item {
  cursor: grabbing;
  transform: scale(1.05); /* Slightly larger */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
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
    grid-template-columns: repeat(4, 1fr); /* 4 items per row for medium screens */
  }
}

@media (max-width: 768px) {
  .meal-plan-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 items per row for smaller screens */
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
    min-width: 200px; /* Adjust size for mobile */
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