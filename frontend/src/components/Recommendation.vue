<template>
    <div class="recommendations">
        <div v-if="isLoading">
            <Loading />
        </div>

        <div v-else>
            <div v-if="hasRecommendations" class="carousel-container">
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
    mouseDrag: true,
    touchDrag: true,
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
        1000: {
            itemsToShow: 2,
            snapAlign: 'start',
        },
        // Extra large devices
        1200: {
            itemsToShow: 2.5,
            snapAlign: 'start',
        },
        1600: {
            itemsToShow: 3.75,
            snapAlign: 'start',
        }
    },
};

function prioritizeRecipes(recipes, preferences) {
    if (!preferences || (!preferences.dietLabels?.length && !preferences.healthLabels?.length && !preferences.cuisineTypes?.length)) {
        // Case 3: No preferences at all - return random recipes
        return shuffleArray(recipes);
    }

    // Helper function to check if a recipe matches any preference
    const hasMatchingLabel = (recipeLabels, prefLabels) => {
        if (!prefLabels?.length) return true;
        return prefLabels.some(pref =>
            recipeLabels.some(label => {
                const normalizedPref = pref.replace(/-/g, '').toLowerCase();
                const normalizedLabel = label.replace(/-/g, '').toLowerCase();
                return normalizedLabel === normalizedPref ||
                    normalizedLabel.includes(normalizedPref) ||
                    normalizedPref.includes(normalizedLabel);
            })
        );
    };

    // Score each recipe based on how well it matches preferences
    const scoredRecipes = recipes.map(recipe => {
        const recipeDiet = normalizeArray(recipe.diet || recipe.dietLabels || []);
        const recipeHealth = normalizeArray(recipe.health || recipe.healthLabels || []);
        const recipeCuisine = normalizeArray(Array.isArray(recipe.cuisineType)
            ? recipe.cuisineType
            : [recipe.cuisineType].filter(Boolean));

        let score = 0;
        let matches = {
            cuisine: false,
            diet: false,
            health: false
        };

        // Check if we have all preference types
        const hasAllPreferences = preferences.cuisineTypes?.length > 0 &&
            preferences.dietLabels?.length > 0 &&
            preferences.healthLabels?.length > 0;

        if (hasAllPreferences) {
            // Case 2: All preferences stated - prioritize cuisine first
            if (hasMatchingLabel(recipeCuisine, preferences.cuisineTypes)) {
                score += 1;
                matches.cuisine = true;
            }
            if (hasMatchingLabel(recipeDiet, preferences.dietLabels)) {
                score += 2;
                matches.diet = true;
            }
            if (hasMatchingLabel(recipeHealth, preferences.healthLabels)) {
                score += 3;
                matches.health = true;
            }
        } else {
            // Case 1: Some empty preferences - prioritize what user has specified
            if (preferences.cuisineTypes?.length && hasMatchingLabel(recipeCuisine, preferences.cuisineTypes)) {
                score += 3;
                matches.cuisine = true;
            }
            if (preferences.dietLabels?.length && hasMatchingLabel(recipeDiet, preferences.dietLabels)) {
                score += 3;
                matches.diet = true;
            }
            if (preferences.healthLabels?.length && hasMatchingLabel(recipeHealth, preferences.healthLabels)) {
                score += 3;
                matches.health = true;
            }
        }

        return {
            recipe,
            score,
            matches
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
                dietLabels: normalizeArray(data.dietaryPreferences),
                healthLabels: normalizeArray(data.healthGoals),
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
    width: 280px;
    height: 200px;
    overflow: hidden;
    position: relative;
    margin: 0 auto;
}

img {
    width: 100%;
    /* Ensure the image fills the width of the container */
    height: 100%;
    object-fit: cover;
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
    color: rgba(0, 0, 0);

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
    background-color: #dae2bc;
}

.carousel__navigation-button.prev {
    left: -50px;
}

.carousel__navigation-button.next {
    right: -50px;
}

/* Responsive Adjustments */
@media (max-width: 576px) {
    .image-container {
        width: 200px;
        /* Adjust width for small screens */
        height: 150px;
    }

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
    .image-container {
        width: 240px;
        /* Adjust width for medium screens */
        height: 180px;
    }

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