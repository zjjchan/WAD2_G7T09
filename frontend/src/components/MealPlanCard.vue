<template>

      <h3 class="title">Weekly Meal Plan</h3>
      <div class="scroll-container">
        <div class="meal-plan-grid">
          <div v-for="day in days" :key="day" class="day-column">
            <h3 class="day-title">{{ day }}</h3>
            <div v-for="mealTime in mealTimes" :key="mealTime" class="meal-slot">
              <h4 class="meal-time-title">{{ mealTime }}</h4>
              <Draggable
                v-model="mealPlan[day][mealTime]"
                :group="{ name: 'recipes', pull: true, put: true }"
                :sort="false"
                item-key="id"
                class="meal-drop-zone"
              >
                <template #item="{ element }">
                  <div class="meal-item">
                    <img :src="element.image" :alt="element.name" class="meal-image" />
                    <div class="meal-details">
                      <h5>{{ element.name }}</h5>
                      <span class="calories">{{ element.calories }} calories</span>
                    </div>
                    <button @click="removeMeal(day, mealTime, element)" class="remove-btn">&times;</button>
                  </div>
                </template>
              </Draggable>
            </div>
          </div>
        </div>
      </div>

  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Draggable from 'vuedraggable';
  
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
  
  const removeMeal = (day, mealTime, meal) => {
    const index = mealPlan.value[day][mealTime].findIndex((item) => item.id === meal.id);
    if (index !== -1) {
      mealPlan.value[day][mealTime].splice(index, 1);
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
  
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #f7f9fc;
    margin: 0;
    padding: 0;
  }
  
  .meal-plan-card {
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin: 2rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .meal-plan-card:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  .title {
    text-align: center;
    font-size: 2.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .scroll-container {
    overflow-x: auto;
    padding-bottom: 1rem;
    scrollbar-width: thin;
    scrollbar-color: #b3d0ff #e6f1ff;
  }
  
  .scroll-container::-webkit-scrollbar {
    height: 8px;
  }
  
  .scroll-container::-webkit-scrollbar-thumb {
    background-color: #b3d0ff;
    border-radius: 8px;
  }
  
  .meal-plan-grid {
    display: flex;
    gap: 1rem;
    min-width: max-content;
  }
  
  .day-column {
    background: linear-gradient(135deg, #e3f2fd, #e1f5fe);
    border-radius: 12px;
    padding: 1rem;
    flex: 0 0 240px;
    transition: all 0.3s ease;
  }
  
  .day-column:hover {
    transform: translateY(-5px);
    background: linear-gradient(135deg, #bbdefb, #b3e5fc);
  }
  
  .day-title {
    font-size: 1.4rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 0.75rem;
    color: #1e88e5;
  }
  
  .meal-slot {
    margin-bottom: 1rem;
  }
  
  .meal-time-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #1565c0;
  }
  
  .meal-drop-zone {
    min-height: 100px;
    background-color: #f1f8e9;
    border-radius: 8px;
    padding: 0.75rem;
    transition: background-color 0.3s ease;
  }
  
  .meal-drop-zone:hover {
    background-color: #dcedc8;
  }
  
  .meal-item {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }
  
  .meal-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .meal-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 0.75rem;
  }
  
  .meal-details {
    flex: 1;
  }
  
  .meal-details h5 {
    font-size: 1rem;
    margin: 0 0 0.25rem;
  }
  
  .calories {
    font-size: 0.85rem;
    color: #757575;
  }
  
  .remove-btn {
    background-color: #e53935;
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .remove-btn:hover {
    background-color: #d32f2f;
  }
  </style>
  