<template>
  <div class="saved-recipes-container">
    <div class="title-container">
      <img class="title-img" src="/images/yourtaste.png" />
    </div>
    <Draggable 
      v-model="savedRecipes" 
      :group="{ name: 'recipes', pull: 'clone', put: true }"
      item-key="id"
      :clone="cloneItem"
      class="recipes-grid"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="col">
          <div class="card h-100 shadow-sm" :ref="setCardRef(index)">
            <img :src="element.image" :alt="element.name" class="card-img-top" />
            <div class="card-body">
              <h5 class="card-text">Calories: {{ element.calories }}</h5>
              <p class="card-title">{{ element.name }}</p>
            </div>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Draggable from 'vuedraggable';
import gsap from 'gsap';

// State
const savedRecipes = ref([
  { id: 1, name: 'Grilled Chicken Salad', image: '/images/placeholder.webp', calories: 350 },
  { id: 3, name: 'Salmon with Roasted Vegetables', image: '/images/placeholder.webp', calories: 450 },
  { id: 4, name: 'Quinoa and Black Bean Bowl', image: '/images/placeholder.webp', calories: 380 },
  { id: 5, name: 'Greek Yogurt Parfait', image: '/images/placeholder.webp', calories: 300 },
]);


const cloneItem = (item) => ({ ...item, id: Date.now() });

let cards = []; 

const setCardRef = (index) => (el) => {
  if (el) cards[index] = el;
};

const onDragStart = () => {
  gsap.to(cards, {
    scale: 0.95,
    duration: 0.2,
    ease: 'power1.inOut',
  });
};

const onDragEnd = () => {
  gsap.to(cards, {
    scale: 1,
    duration: 0.2,
    ease: 'elastic.out(1, 0.5)',
  });
};
</script>

<style scoped>
.saved-recipes-container {
  height: 400px;
  overflow-y: auto;

}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.title-container {
  text-align: center;
  margin-bottom: 1rem;
}

.title-img {
  width: 60%;
  max-width: 300px;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: grab;
}

.card:active {
  cursor: grabbing;
  transform: scale(0.9);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-img-top {
  height: 50px;
  object-fit: cover;
}

.card-text {
  font-size: 12px;
}

.card-title {
  font-size: 9px;
}
</style>
