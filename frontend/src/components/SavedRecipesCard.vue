<template>
    <div class="saved-recipes-container" style="overflow:scroll; height:400px;">
      <h2 class="mb-3">Saved Recipes (hardcoded for now)</h2>
      <Draggable 
        v-model="savedRecipes" 
        :group="{ name: 'recipes', pull: 'clone', put: true }"
        :sort="true"
        item-key="id"
        :clone="cloneItem"
        class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
      >
        <template #item="{ element }">
          <div class="col">
            <div class="card h-100 recipe-card">
              <img :src="element.image" class="card-img-top" :alt="element.name">
              <div class="card-body">
                <h5 class="card-title">{{ element.name }}</h5>
                <p class="card-text"><small class="text-muted">Calories: {{ element.calories }}</small></p>
              </div>
              <div class="card-footer">
              </div>
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
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .recipe-card {
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: move;
  }
  
  .recipe-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .card-img-top {
    height: 80px;
    object-fit: cover;
  }
  .card-body {
    height: 100px;
    overflow: none;
  }

  .card-title {
    font-size: 15px;
  }

  .card-footer {
    background-color: transparent;
    border-top: none;
  }
  </style>