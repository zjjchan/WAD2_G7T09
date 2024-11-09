<template>
    <div class="recommendations">
        <div v-if="isLoading">
            <Loading />
        </div>

        <div v-else>
            <div v-if="recommendations.length">
                <!-- Carousel component with arrow navigation and looping enabled -->
                <Carousel v-bind="carouselConfig" v-slot="{ goPrev, goNext }">
                    <Slide v-for="(recipe, index) in recommendations" :key="index">
                        <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                            class="card-link">
                            <div class="carousel__item">
                                <img :src="recipe.image" :alt="recipe.label" class="recipe-image" />
                                <h6>{{ recipe.label }}</h6>
                                <p><strong>Cuisine:</strong> {{ recipe.cuisineType.join(', ') }}</p>
                            </div>
                        </RouterLink>
                    </Slide>
                    <!-- Custom navigation arrows -->
                    <button @click="goPrev" class="carousel__navigation-button prev">‹</button>
                    <button @click="goNext" class="carousel__navigation-button next">›</button>
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

const carouselConfig = {
    loop: true,               // Enables looping
    autoplay: true,           // Enables autoplay
    autoplayTimeout: 3000,    // Autoplay timeout in ms
    transition: 5000,          // Slide transition time
    navigationEnabled: true,  // Enables navigation arrows
    plugins: [Navigation],
    breakpoints: {
        480: {
            itemsToShow: 1,
            snapAlign: 'center',
        },
        576: {
            itemsToShow: 1.5,
            snapAlign: 'center',
        },
        768: {
            itemsToShow: 2,
            snapAlign: 'center',
        },
        992: {
            itemsToShow: 2.5,
            snapAlign: 'center',
        },
        1240: {
            itemsToShow: 4,
            snapAlign: 'center',
        },
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

        recommendations.value = filteredRecipes.slice(0, 5);
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
    padding: 5% 5%;
    background-color: #ffffff;
}

.carousel__item {
    background-color: white;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    min-width: 250px;
    text-align: center;
}

.recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.carousel__viewport {
    perspective: 2000px;
}

.carousel__slide {
    padding: 5px;
    opacity: 0.9;
    transform-style: preserve-3d;
}

.carousel__slide--active {
    transform: scale(1);
    opacity: 1;
}

/* Custom styles for navigation arrows */
.carousel__navigation-button {
    position: absolute;
    top: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 50%;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    transition: background-color 0.3s;
}

.carousel__navigation-button.prev {
    left: -20px;
    /* Adjust position to suit design */
}

.carousel__navigation-button.next {
    right: -20px;
    /* Adjust position to suit design */
}

.carousel__navigation-button {
    background-color: rgba(0, 0, 0, 0.5);
    color: rgb(165, 70, 70);
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 50%;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

a {
    text-decoration: none;

}

.carousel__navigation-button:hover {
    background-color: rgba(0, 0, 0, 0.7);
}
</style>