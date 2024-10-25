<template>
  <div class="saved-recipes-container">
    <div class="title-container">
      <img class="title-img" src="/images/yourtaste.png" />
    </div>
    <Draggable 
      v-model="savedRecipes" 
      :group="{ name: 'recipes', pull: 'clone', put: true }"
      :sort="true"
      item-key="id"
      :clone="cloneItem"
      class="recipes-grid"
    >
      <template #item="{ element }">
        <div class="col">
          <div class="card h-100 shadow-sm">
            <img :src="element.image" :alt="element.name" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-title">{{ element.name }}</h5>
              <p class="card-text">Calories: {{ element.calories }}</p>
            </div>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Draggable from 'vuedraggable';

const savedRecipes = ref([
  {
    id: 1,
    name: 'Grilled Chicken Salad',
    description: 'A healthy and delicious salad with grilled chicken breast, mixed greens, and a light vinaigrette.',
    image: '/images/placeholder.webp',
    calories: 350,
  },
  {
    id: 3,
    name: 'Salmon with Roasted Vegetables',
    description: 'Oven-baked salmon fillet served with a medley of roasted vegetables.',
    image: '/images/placeholder.webp',
    calories: 450,
  },
  {
    id: 4,
    name: 'Quinoa and Black Bean Bowl',
    description: 'A protein-packed vegetarian bowl with quinoa, black beans, avocado, and fresh salsa.',
    image: '/images/placeholder.webp',
    calories: 380,
  },
  {
    id: 5,
    name: 'Greek Yogurt Parfait',
    description: 'Layers of Greek yogurt, fresh berries, and crunchy granola for a perfect breakfast or snack.',
    image: '/images/placeholder.webp',
    calories: 300,
  },
  
]);

const cloneItem = (item) => {
  return { ...item, id: Date.now() };
};
</script>

<style scoped>
/* Container to prevent overflow */
.saved-recipes-container {
  height: 400px;
  overflow-y: auto; /* Allow vertical scrolling */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding: 1rem;
  box-sizing: border-box;
}

/* Grid with exactly 3 columns */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  gap: 1rem; /* Space between cards */
  width: 100%; /* Ensure full width */
}

/* Center the title image */
.title-container {
  text-align: center;
  margin-bottom: 1rem;
}

.title-img {
  width: 60%;
  max-width: 300px;
}

/* Card styling */
.card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: move;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-img-top {
  height: 80px;
  object-fit: cover;
}

.card-text {
  font-size: 10px;
}

.card-title {
  font-size: 12px;
}

/* Draggable item styles */
.sortable-drag {
  opacity: 0.5;
  background: #c8ebfb;
}

.sortable-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

/* Ensure card stays within layout */
.sortable-drag .card,
.sortable-ghost .card {
  width: 100%;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.sortable-drag .card-img-top,
.sortable-ghost .card-img-top {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.sortable-drag .card-body,
.sortable-ghost .card-body {
  padding: 0;
}

.sortable-drag .card-title,
.sortable-ghost .card-title {
  margin: 0;
  font-size: 10px;
}

.sortable-drag .card-text,
.sortable-ghost .card-text {
  margin: 0;
  font-size: 10px;
}
</style>
