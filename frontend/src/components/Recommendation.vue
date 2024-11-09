<template>
    <div class="recommendations">
        <div v-if="isLoading">
            <Loading />
        </div>

        <div v-else>
            <div v-if="recommendations.length">
                <Carousel v-bind="carouselConfig">
                    <Slide v-for="(recipe, index) in recommendations" :key="index">
                        <div class="carousel__item">
                            <img :src="recipe.image" :alt="recipe.label" class="recipe-image" />
                            <h6>{{ recipe.label }}</h6>
                            <p><strong>Cuisine:</strong> {{ recipe.cuisineType.join(', ') }}</p>
                            <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                                class="btn btn-primary">
                                View Recipe
                            </RouterLink>
                        </div>
                    </Slide>

                    <template #addons>
                        <Navigation />
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

const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;
const recommendations = ref([]);
const isLoading = ref(false);

const apiUrl = 'https://api.edamam.com/search';
const apiKey = import.meta.env.VITE_EDAMAM_API_KEY;
const appId = import.meta.env.VITE_EDAMAM_APP_ID;

// Carousel configuration options
const carouselConfig = {
    loop: true,
    transition: 500,
    breakpointMode: 'carousel',
    breakpoints: {
        480: {
            itemsToShow: 1,
            snapAlign: 'center',
        },
        576: {
            itemsToShow: 2,
            snapAlign: 'center',
        },
        768: {
            itemsToShow: 3,
            snapAlign: 'center',
        },
        992: {
            itemsToShow: 3,
            snapAlign: 'center',
        },
        1240: {
            itemsToShow: 4.5,
            snapAlign: 'center',
        },
    },
};

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
async function fetchRecommendedRecipes() {
    isLoading.value = true;
    recommendations.value = [];

    const preferences = await fetchUserPreferences();
    if (!preferences) {
        isLoading.value = false;
        return;
    }

    // Ensure each property is an array or set to an empty array
    const dietLabels = Array.isArray(preferences.dietLabels) ? preferences.dietLabels : [];
    const healthLabels = Array.isArray(preferences.healthLabels) ? preferences.healthLabels : [];
    const cuisineTypes = Array.isArray(preferences.cuisineTypes) ? preferences.cuisineTypes : [];

    const params = {
        app_id: appId,
        app_key: apiKey,
        from: 0,
        to: 50,
        q: cuisineTypes.length ? cuisineTypes.join(' ') : 'recipe',
    };

    if (dietLabels.length) params.diet = dietLabels.join(',');
    if (healthLabels.length) params.health = healthLabels.join(',');

    try {
        const response = await axios.get(apiUrl, { params });
        const recipes = response.data.hits.map(hit => hit.recipe);
        const randomSelection = recipes.sort(() => 0.5 - Math.random()).slice(0, 5); // Fetch 10 random recipes
        recommendations.value = randomSelection;
    } catch (error) {
        console.error('Error fetching recommended recipes:', error);
    } finally {
        isLoading.value = false;
    }
}
onMounted(fetchRecommendedRecipes);
</script>

<style scoped>
.recommended-recipes {
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

.carousel__slide {
    padding: 5px;
}

.carousel__viewport {
    perspective: 2000px;
}

.carousel__track {
    transform-style: preserve-3d;
}

.carousel__slide--sliding {
    transition: 0.5s;
}

.carousel__slide {
    opacity: 0.9;
    transform: rotateY(-20deg) scale(0.9);
}

.carousel__slide--active~.carousel__slide {
    transform: rotateY(20deg) scale(0.9);
}

.carousel__slide--prev {
    opacity: 1;
    transform: rotateY(-10deg) scale(0.95);
}

.carousel__slide--next {
    opacity: 1;
    transform: rotateY(10deg) scale(0.95);
}

.carousel__slide--active {
    opacity: 1;
    transform: rotateY(0) scale(1);
}

h2 {
    font-size: 1.5em;
    margin-bottom: 1em;
}
</style>
