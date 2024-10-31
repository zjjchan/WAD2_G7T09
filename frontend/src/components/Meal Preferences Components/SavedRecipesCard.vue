<template>
  <div class="saved-recipes-container">
    <div class="title-container">
      <h3>Saved Recipes</h3>
    </div>
    <Draggable 
      v-model="favoritedRecipes" 
      :group="{ name: 'recipes', pull: 'clone', put: true }"
      item-key="uri"
      :clone="cloneItem"
      class="recipes-grid"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="recipe-card-wrapper">
          <div class="card shadow-sm" :ref="setCardRef(index)">
            <div class="card-img-container">
              <img :src="element.image" :alt="element.label" class="card-img-top" />
              <button 
                class="remove-button"
                @click.stop="removeRecipe(element)"
                title="Remove from saved recipes"
              >
                ×
              </button>
            </div>
            <div class="card-body">
              <p class="card-title">{{ element.label }}</p>
            </div>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Draggable from 'vuedraggable';
import gsap from 'gsap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore';

const favoritedRecipes = ref([]);
const auth = getAuth();
const db = getFirestore();
const currentUser = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user;
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        favoritedRecipes.value = userSnapshot.data().favoritedRecipes || [];
      }
    }
  });
});

const removeRecipe = async (recipe) => {
  try {
    if (!currentUser.value) return;

    // Remove from local state
    favoritedRecipes.value = favoritedRecipes.value.filter(
      r => r.uri !== recipe.uri
    );

    // Update Firestore
    const userDoc = doc(db, 'users', currentUser.value.uid);
    await updateDoc(userDoc, {
      favoritedRecipes: favoritedRecipes.value
    });

  } catch (error) {
    console.error('Error removing recipe:', error);
    // Optionally show error message to user
  }
};

const cloneItem = (item) => ({
  ...item,
  uri: `${item.uri}_${Date.now()}`,
});

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 300px;
  overflow-y: scroll;
}

.title-container {
  text-align: center;
  margin-bottom: 20px;
}

.recipes-grid {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .recipes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .recipes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.recipe-card-wrapper {
  width: 100%;
}

.card {
  width: 100%;
  height: 100%;
  transition: transform 0.2s;
  cursor: grab;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.card:active {
  cursor: grabbing;
}

.card-img-container {
  position: relative;
}

.card-img-top {
  width: 100%;
  height: 95px;
  object-fit: cover;
}

.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff4444;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  color: #ffffff;
  transition: all 0.2s ease;
}
.card-body {
  padding: 1rem;
}

.card-title {
  font-size: 1.1rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-text {
  font-size: 0.9rem;
  color: #666;
}
</style>