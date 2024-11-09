<template>
    <div class="recommendations">
        <div v-if="isLoading">
            <Loading />
        </div>

        <div v-else>
            <div v-if="recommendations.length" class="carousel-container">
                <Carousel v-bind="carouselConfig" :wrap-around="true" :transition="1000" :autoplay="3000"
                    class="carousel">
                    <Slide v-for="(recipe, index) in recommendations" :key="index" class="carousel__slide">
                        <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                            class="card-link">
                            <div class="carousel__item">
                                <div class="image-container">
                                    <img :src="recipe.image" :alt="recipe.label" class="recipe-image" />
                                </div>
                                <div class="content-container">
                                    <h6 class="recipe-title">{{ recipe.label }}</h6>
                                    <p class="cuisine-type">
                                        <strong>Cuisine:</strong> {{ recipe.cuisineType.join(', ') }}
                                    </p>
                                </div>
                            </div>
                        </RouterLink>
                    </Slide>

                    <template #addons>
                        <Navigation>
                            <template #next>
                                <button class="carousel__navigation-button next" @click="handleNextClick">›</button>
                            </template>
                            <template #prev>
                                <button class="carousel__navigation-button prev" @click="handlePrevClick">‹</button>
                            </template>
                        </Navigation>
                    </template>
                </Carousel>
            </div>
            <p v-else>No recommendations available based on your preferences.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { RouterLink } from 'vue-router';
import Loading from '@/components/Loading.vue';
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import Preferences from "@/components/Meal Preferences Components/Preferences.vue";

const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;
const recommendations = ref([]);
const isLoading = ref(false);

const apiUrl = 'https://api.edamam.com/search';
const apiKey = import.meta.env.VITE_EDAMAM_API_KEY;
const appId = import.meta.env.VITE_EDAMAM_APP_ID;
// Custom navigation handlers
const handleNextClick = (next) => {
    // Always move forward
    next();
};

const handlePrevClick = (prev, next) => {

    next();
};

const carouselConfig = {
    itemsToShow: 4,
    snapAlign: 'center',
    wrapAround: true,
    autoplay: true,
    pauseAutoplayOnHover: true,
    autoplayTimeout: 2500,
    mouseDrag: false,
    touchDrag: false,
    breakpoints: {
        // Extra small devices
        320: {
            itemsToShow: 1,
            snapAlign: 'center',
        },
        // Small devices
        576: {
            itemsToShow: 1,
            snapAlign: 'start',
        },
        // Medium devices
        768: {
            itemsToShow: 2,
            snapAlign: 'start',
        },
        // Large devices
        992: {
            itemsToShow: 3,
            snapAlign: 'start',
        },
        // Extra large devices
        1200: {
            itemsToShow: 4,
            snapAlign: 'start',
        }
    },
};
// Fetches user preferences from the Firestore database
async function fetchUserPreferences() {
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        return {
            dietLabels: Array.isArray(userDoc.data().dietaryPreferences) ? userDoc.data().dietaryPreferences : [],
            healthLabels: Array.isArray(userDoc.data().healthGoals) ? userDoc.data().healthGoals : [],
            cuisineTypes: Array.isArray(userDoc.data().cuisineTypes) ? userDoc.data().cuisineTypes : []
        };
    }

    return {
        dietLabels: [],
        healthLabels: [],
        cuisineTypes: []
    };
}

// Fetches recipes from the API without filtering, then applies user preferences locally
async function fetchAndFilterRecipes() {
    isLoading.value = true;
    recommendations.value = [];
    const preferences = await fetchUserPreferences();
    const params = {
        app_id: appId,
        app_key: apiKey,
        from: 0,
        to: 100,
        q: 'recipe',
    };

    try {
        const response = await axios.get(apiUrl, { params });
        const recipes = response.data.hits.map(hit => hit.recipe);
        console.log('All recipes:', recipes);
        console.log('User preferences:', preferences);

        const filteredRecipes = recipes.filter(recipe => {
            // First, let's log the actual values we're working with
            console.log('Recipe:', {
                dietLabels: recipe.dietLabels,
                healthLabels: recipe.healthLabels,
                cuisineType: recipe.cuisineType
            });
            console.log('User Preferences:', preferences);

            // Normalize the data (handle potential undefined values)
            const recipeDietLabels = (recipe.dietLabels || []).map(d => d.toLowerCase());
            const recipeHealthLabels = (recipe.healthLabels || []).map(h => h.toLowerCase());
            const recipeCuisineTypes = (recipe.cuisineType || []).map(c => c.toLowerCase());

            const userDietLabels = (preferences.dietLabels || []).map(d => d.toLowerCase());
            const userHealthLabels = (preferences.healthLabels || []).map(d => d.toLowerCase());
            const userCuisineTypes = (preferences.cuisineTypes || []).map(d => d.toLowerCase());

            // Diet label matching
            const dietMatch = userDietLabels.length === 0 || userDietLabels.some(userLabel => {

                return recipeDietLabels.includes(userLabel);
            });

            // Health label matching
            const healthMatch = userHealthLabels.length === 0 || userHealthLabels.some(userLabel => {

                return recipeHealthLabels.includes(userLabel.toLowerCase());
            });

            // Cuisine type matching
            const cuisineMatch = userCuisineTypes.length === 0 || userCuisineTypes.some(userType => {

                return recipeCuisineTypes.includes(userType);
            });
            // Return true if ANY of the conditions match (not all)
            return dietMatch || healthMatch || cuisineMatch;  // Changed from AND (&&) to OR (||)
        });

        recommendations.value = filteredRecipes.slice(0, 10);
        console.log('Filtered recipes:', recommendations.value);
    } catch (error) {
        console.error('Error fetching recommended recipes:', error);
    } finally {
        isLoading.value = false;
    }
}
onMounted(fetchAndFilterRecipes);
</script>
<style scoped>
.recommendations {
    padding: 20px;
    background-color: #ffffff;
    position: relative;
    overflow: hidden;
}

.carousel-container {
    position: relative;
    padding: 0 40px;
    margin: 0 auto;
    max-width: 1400px;
}

/* Card Sizing */
.carousel__slide {
    box-sizing: border-box;
    height: 380px;
    padding: 8px;
}

.carousel__item {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.image-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;
}

.recipe-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px 10px 0 0;
}

.content-container {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.recipe-title {
    margin: 0 0 8px 0;
    font-size: 1rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.cuisine-type {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
}

/* Navigation Styling */
.carousel__navigation-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.3s ease;
}

.carousel__navigation-button:hover {
    background-color: rgba(0, 0, 0, 0.9);
}

.carousel__navigation-button.prev {
    left: -50px;
}

.carousel__navigation-button.next {
    right: -50px;
}

/* Responsive Adjustments */
@media (max-width: 576px) {
    .recommendations {
        padding: 10px;
    }

    .carousel-container {
        padding: 0 30px;
    }

    .carousel__slide {
        height: 340px;
    }

    .image-container {
        height: 180px;
    }
}

@media (min-width: 577px) and (max-width: 768px) {
    .carousel__slide {
        height: 360px;
    }
}

@media (min-width: 769px) {
    .carousel-container {
        padding: 0 50px;
    }
}

/* Hide scrollbar but keep functionality */
.carousel__viewport {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.carousel__viewport::-webkit-scrollbar {
    display: none;
}

/* Link styling */
.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
}

/* Track styling */
.carousel__track {
    gap: 0 !important;
    transform-style: preserve-3d;
}
</style>