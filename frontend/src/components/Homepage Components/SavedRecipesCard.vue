<template>
  <div class="saved-recipes-container">
    <Draggable 
      v-model="savedRecipes" 
      :group="{ name: 'recipes', pull: 'clone', put: true }"
      :sort="true"
      item-key="id"
      :clone="cloneItem"
      class="recipes-grid"
    >
      <template #item="{ element }">
        <div class="recipe-card">
          <img :src="element.image" :alt="element.name">
          <div class="recipe-content">
            <h5>{{ element.name }}</h5>
            <p>Calories: {{ element.calories }}</p>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

  <script setup>
  import { ref } from 'vue'
  import Draggable from 'vuedraggable'
  
  const savedRecipes = ref([
    {
      id: 1,
      name: 'Grilled Chicken Salad',
      description: 'A healthy and delicious salad with grilled chicken breast, mixed greens, and a light vinaigrette.',
      image: '/images/placeholder.webp',
      calories: 350
    },
    {
      id: 3,
      name: 'Salmon with Roasted Vegetables',
      description: 'Oven-baked salmon fillet served with a medley of roasted vegetables.',
      image: '/images/placeholder.webp',
      calories: 450
    },
    {
      id: 4,
      name: 'Quinoa and Black Bean Bowl',
      description: 'A protein-packed vegetarian bowl with quinoa, black beans, avocado, and fresh salsa.',
      image: '/images/placeholder.webp',
      calories: 380
    },
    {
      id: 5,
      name: 'Greek Yogurt Parfait',
      description: 'Layers of Greek yogurt, fresh berries, and crunchy granola for a perfect breakfast or snack.',
      image: '/images/placeholder.webp',
      calories: 300
    }
  ])
  
  const cloneItem = (item) => {
    return { ...item, id: Date.now() } // Assign a new id to the cloned item
  }
  </script>
  
  <style scoped>
  .saved-recipes-container {
    height: 400px;
    overflow: auto;
  }
  
  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .recipe-card {
    background-color: white;
    border-radius: 0.75rem;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: move;
  }
  
  .recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .recipe-card img {
    width: 100%;
    height: 80px;
    object-fit: cover;
  }
  
  .recipe-content {
    padding: 0.75rem;
  }
  
  .recipe-content h5 {
    font-size: 0.875rem;
    margin: 0 0 0.25rem 0;
    color: #4A5240;
  }
  
  .recipe-content p {
    font-size: 0.75rem;
    color: #666;
    margin: 0;
  }
  </style>