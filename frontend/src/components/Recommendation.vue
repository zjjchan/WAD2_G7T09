<template>
    <div class="recommendations">
        <div v-if="isLoading">
            <Loading />
        </div>
        <div v-else>
            <div v-if="hasRecommendations" class="carousel-container">
                <Carousel v-bind="carouselConfig" :wrap-around="true" class="carousel">
                    <Slide v-for="(recipe, index) in recommendations" :key="index" class="carousel__slide">
                        <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                            class="card-link">
                            <div class="carousel__item">
                                <div class="image-container">
                                    <img :src="recipe.image" :alt="recipe.label" class="recipe-image" />
                                </div>
                                <div class="content-container">
                                    <h6 class="recipe-title">{{ recipe.label }}</h6>
                                    <div class="card-sub">
                                        <p class="cuisine-type" v-if="recipe.matchedCuisineTypes.length">
                                            <strong>Cuisine:</strong> {{ recipe.matchedCuisineTypes.join(', ') }}
                                        </p>
                                        <p class="matched-labels" v-if="recipe.matchedHealthLabels.length">
                                            <strong>Health Labels:</strong> {{ recipe.matchedHealthLabels.join(', ') }}
                                        </p>
                                        <p class="matched-labels" v-if="recipe.matchedDietLabels.length">
                                            <strong>Diet Labels:</strong> {{ recipe.matchedDietLabels.join(', ') }}
                                        </p>
                                    </div>
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
                                <!-- Changed to left arrow -->
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
import { ref, onMounted, computed } from 'vue';
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
// const handleNextClick = (next) => {
//     // Always move forward
//     next();
// };

// const handlePrevClick = (prev, next) => {
//     next();
// };
const carouselConfig = {
    itemsToShow: 4,
    snapAlign: 'center',
    wrapAround: true,
    autoplay: 4000, // Increased autoplay duration for smoothness
    transition: 1500, // Slower transition for smoother movement
    easing: 'ease-in-out', // Smoother easing effect
    mouseDrag: true,
    touchDrag: true,
    modelValue: 0,
    breakpoints: {
        0: {
            itemsToShow: 1,
            snapAlign: 'center',
            itemsToScroll: 1,
        },
        550: {
            itemsToShow: 2,
            snapAlign: 'start',
        },
        768: {
            itemsToShow: 2,
            snapAlign: 'start',
        },
        992: {
            itemsToShow: 3,
            snapAlign: 'start',
        },
        1200: {
            itemsToShow: 4,
            snapAlign: 'start',
        }
    },
};

function prioritizeRecipes(recipes, preferences) {
    console.log(preferences)
    if (!preferences || (!preferences.dietLabels?.length && !preferences.healthLabels?.length && !preferences.cuisineTypes?.length)) {
        return shuffleArray(recipes).map(recipe => ({
            ...recipe,
            matchedDietLabels: [],
            matchedHealthLabels: [],
            matchedCuisineTypes: []
        }));
    }

    // Helper function to check if a recipe matches any preference
    const hasMatchingLabel = (recipeLabels, prefLabels) => {
        // if (!prefLabels?.length) return true;

        for (let pref of prefLabels) {
            for (let label of recipeLabels) {
                const normalizedPref = pref.replace(/-/g, '').toLowerCase();
                const normalizedLabel = label.replace(/-/g, '').toLowerCase();

                if (
                    normalizedLabel === normalizedPref ||
                    normalizedLabel.includes(normalizedPref) ||
                    normalizedPref.includes(normalizedLabel)
                ) {
                    return true;  // Match found, return true immediately
                }
            }
        }
        return false;

    };

    // Score each recipe based on how well it matches preferences
    const scoredRecipes = recipes.map(recipe => {
        const recipeDiet = normalizeArray(recipe.diet || recipe.dietLabels || []);
        const recipeHealth = normalizeArray(recipe.health || recipe.healthLabels || []);
        const recipeCuisine = normalizeArray(Array.isArray(recipe.cuisineType)
            ? recipe.cuisineType
            : [recipe.cuisineType].filter(Boolean));

        let score = 0;
        const matchedDietLabels = [];
        const matchedHealthLabels = [];
        const matchedCuisineTypes = [];

        if (hasMatchingLabel(recipeCuisine, preferences.cuisineTypes)) {
            score += 3;
            matchedCuisineTypes.push(...preferences.cuisineTypes.filter(type => recipeCuisine.includes(type)));
        }

        if (hasMatchingLabel(recipeDiet, preferences.dietLabels)) {
            score += 3;
            matchedDietLabels.push(...preferences.dietLabels.filter(diet => recipeDiet.includes(diet)));
        }

        if (hasMatchingLabel(recipeHealth, preferences.healthLabels)) {
            score += 3;
            matchedHealthLabels.push(...preferences.healthLabels.filter(health => recipeHealth.includes(health)));
        }

        return {
            recipe: {
                ...recipe,
                matchedDietLabels,
                matchedHealthLabels,
                matchedCuisineTypes
            },
            score
        };
    });

    // Sort recipes by score (highest first)
    const sortedRecipes = scoredRecipes.sort((a, b) => b.score - a.score);

    // Group recipes by score to shuffle within same-score groups
    const scoreGroups = {};
    sortedRecipes.forEach(item => {
        if (!scoreGroups[item.score]) {
            scoreGroups[item.score] = [];
        }
        scoreGroups[item.score].push(item.recipe);
    });

    // Reconstruct the final array with shuffled same-score groups
    const finalRecipes = Object.entries(scoreGroups)
        .sort(([scoreA], [scoreB]) => Number(scoreB) - Number(scoreA))
        .flatMap(([_, recipes]) => shuffleArray(recipes));

    return finalRecipes;
}

function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().trim();
}

// Helper function to normalize arrays for consistent comparison
function normalizeArray(arr) {
    if (!arr) return [];
    return Array.isArray(arr) ? arr.map(item => normalizeString(item)) : [normalizeString(arr)];
}


function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}



async function fetchUserPreferences() {
    if (!user) return null;

    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                dietLabels: normalizeArray(data.healthGoals),
                healthLabels: normalizeArray(data.dietaryPreferences),
                cuisineTypes: normalizeArray(data.cuisineTypes)
            };
        }
    } catch (error) {
        console.error('Error fetching user preferences:', error);
    }

    return null;
}

async function fetchAndFilterRecipes() {
    isLoading.value = true;
    recommendations.value = [];

    try {
        const preferences = await fetchUserPreferences();
        console.log('Fetched User Preferences:', preferences);

        // Simple API call to get general recipes
        const response = await axios.get(apiUrl, {
            params: {
                app_id: appId,
                app_key: apiKey,
                q: 'main course',  // General query for main dishes
                from: 0,
                to: 100
            }
        });

        console.log('API Response:', response.data);

        // Get all recipes from response
        const allRecipes = response.data.hits.map(hit => hit.recipe);
        const prioritizedRecipes = prioritizeRecipes(allRecipes, preferences);
        recommendations.value = prioritizedRecipes.slice(0, 10);
        console.log('Final Recommendations:', recommendations.value);
        console.log('Total Recipes Fetched:', allRecipes.length);


    } catch (error) {
        console.error('Error in fetchAndFilterRecipes:', error);
        recommendations.value = [];
    } finally {
        isLoading.value = false;
    }
}
const hasRecommendations = computed(() => {
    return recommendations.value.length > 0;
});
onMounted(fetchAndFilterRecipes);


</script>
<style scoped>
.recommendations {
    padding: 10px;
    background-color: #ffffff;
    width: 100%;
    overflow: hidden;
    min-height: 420px;
}

.carousel-container {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    /* Increased padding to accommodate navigation buttons */
}

.carousel {
    position: relative;
    padding-bottom: 20px;
}

.card-sub {
    padding-top: 10px;
    text-align: justify;
}

/* Base card sizing */
.carousel__slide {
    display: block;
    box-sizing: border-box;
    width: 260px !important;
    height: 380px !important;
    margin: 0 auto;
    flex: 0 0 auto !important;
    padding: 5px;
}

.carousel__item {
    position: relative;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.image-container {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
}

.recipe-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
}

.content-container {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.recipe-title {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.cuisine-type,
.matched-labels {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Navigation buttons */
.carousel__navigation-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    background-color: #ffffff;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
}

.carousel__navigation-button:hover {
    background-color: #f5f5f5;
}

.carousel__navigation-button.prev {
    left: -50px;
    /* Position left arrow outside the carousel container */
}

.carousel__navigation-button.next {
    right: -50px;
    /* Position right arrow outside the carousel container */
}

h6 {
    font-size: larger;
}

/* Ensure no horizontal scrolling */
.carousel__viewport {
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow: visible;
}

.carousel__viewport::-webkit-scrollbar {
    display: none;
}

.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
}

/* Mobile-specific styles */
@media (max-width: 576px) {
    .carousel-container {
        padding: 0 60px;
        /* Increased padding to accommodate navigation buttons on mobile */
    }

    .carousel__slide {
        width: 100% !important;
        max-width: 100% !important;
        padding: 10px;
        margin: 0;
        height: auto !important;
    }

    .carousel__item {
        width: 100%;
        height: auto;
        min-height: 0;
    }

    .image-container {
        height: 200px;
    }

    .content-container {
        padding: 12px;
    }

    /* Adjust navigation buttons for mobile */
    .carousel__navigation-button.prev {
        left: -40px;
        /* Adjusted position for smaller screens */
    }

    .carousel__navigation-button.next {
        right: -40px;
        /* Adjusted position for smaller screens */
    }
}

/* Responsive adjustments */
@media (max-width: 360px) {
    .carousel__slide {
        width: 240px !important;
        /* Even smaller for very small screens */
    }

    .carousel-container {
        padding: 0 15px;
    }

    .image-container {
        height: 160px;
    }
}

@media (min-width: 361px) and (max-width: 576px) {
    .carousel-container {
        padding: 0 20px;
    }
}

@media (min-width: 577px) {
    .carousel-container {
        padding: 0 30px;
    }

    .carousel__slide {
        width: 260px !important;
    }
}

/* Ensure container doesn't collapse */
.carousel,
.carousel__viewport,
.carousel__track {
    min-height: 380px;
}
</style>