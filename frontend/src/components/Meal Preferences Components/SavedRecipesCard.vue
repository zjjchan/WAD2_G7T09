<template>
  <div class="saved-recipes-container">
      <h3 class="title-container">Saved Recipes</h3>
      <div class="scroll-wrapper">
      <Draggable 
      v-model="favoritedRecipes" 
      :group="{ name: 'recipes', pull:'clone', put:false }"
      item-key="uri"
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

// Handle when an item is removed via dragging
const handleRemove = async (evt) => {
  if (!currentUser.value) return;
  
  try {
    // Update Firestore with the new state
    const userDoc = doc(db, 'users', currentUser.value.uid);
    await updateDoc(userDoc, {
      favoritedRecipes: favoritedRecipes.value
    });
  } catch (error) {
    console.error('Error updating Firestore after drag:', error);
  }
};

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
  }
};

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
  max-width: 750px;
  margin: auto;
  padding: 1.5rem;
  height: 310px;
  overflow-y: auto;
  background-color: #DAE2BC;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title-container {
  color: #4A5240;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
  position: sticky;
  top: 0;
  background-color: #DAE2BC;
  padding: 0.5rem;
  z-index: 1;
}

.scroll-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.recipes-grid {
  display: grid;
  gap: 1rem;
  width: 100%;
  grid-template-columns: 1fr;
  padding-bottom: 1rem;
}

@media (min-width: 640px) {
  .recipes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 400px) {
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
  width: 90%;
  margin: auto;
}

.card {
  width: 100%;
  transition: transform 0.2s;
  cursor: grab;
  background: white;
  border-radius: 10%;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card:active {
  cursor: grabbing;
}

.card-img-container {
  position: relative;
}

.card-img-top {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
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
  color: #ffffff;
  transition: background-color 0.2s ease;
}

.remove-button:hover {
  background-color: #ff6666;
}

.card-body {
  padding: 0.75rem;
}

.card-title {
  font-size: 14px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  font-weight: 500;
}

.card-text {
  font-size: 0.9rem;
  color: #666;
}
</style>
