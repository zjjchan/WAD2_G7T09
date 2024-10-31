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
              :animation="200"
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

// Handle drag changes and save to Firestore
const handleDragChange = async (evt) => {
  if (evt.added) {
    evt.added.element.uri = `${evt.added.element.uri}_${Date.now()}`;
  }
  
  await saveMealPlan();
};

// Save meal plan to Firestore
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
  width: 100%;
  box-sizing: border-box;
}
.title {
  color: #4A5240;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 1rem;
}
.scroll-wrapper {
  width: 100%;
  height: 60vh;
  overflow-x: auto;
  padding: 0 1rem;
}
.meal-plan-grid {
  display: flex;
  gap: 1rem;
  padding-bottom: 6rem;
}
.day-column {
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
}
.day-title-wrapper {
  position: sticky;
  top: 0;
  background-color: #4A5240;
  z-index: 10;
  width: 120px;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: 10px;
  margin-left:74px;
}
.day-title {
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
  text-align: center;
  color: #FFE5D9;
  margin:auto;
}
.meal-times-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}
.meal-slot {
  background-color: #FFE5D9;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom:20px;
}
.meal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.meal-time-title {
  font-size: 0.875rem;
}
.meal-name {
  font-size: 10px;
}
.dropdown-toggle {
  background-color: #4A5240;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.dropdown-toggle:hover {
  background-color: #5a6350;
}
.dropdown-toggle .arrow {
  font-size: 0.625rem;
  transition: transform 0.2s;
}
.dropdown-toggle.is-open .arrow {
  transform: rotate(180deg);
}
.meal-item {
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}
.meal-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 0.5rem;
}
.meal-details {
  flex: 1;
}
.remove-btn {
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.meal-item.in-dropdown {
  animation: slideDown 0.3s ease;
}
.meal-drop-zone {
  min-height: 60px;
  transition: background-color 0.2s ease;
}
.meal-drop-zone:empty {
  padding: 10px;
  border: 2px dashed #ccc;
  border-radius: 0.5rem;
}
.ghost-item {
  opacity: 0.5;
  background: #c8ebfb;
}
.dragging-item {
  cursor: grabbing;
  transform: scale(0.2); 
  height: auto; 
  transition: transform 0.2s ease; 
}

.meal-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

* {
  transition: all 0.2s ease;
}
</style>
