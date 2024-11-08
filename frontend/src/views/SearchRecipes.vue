<template>
  <Navbar />
  <div class="container-fluid">
    <div class="row">
      <div class="col-2 sidebar">
        <h5><strong>Recipe Filters</strong></h5>
        <div class="filter-section" v-for="(items, section) in filterSections" :key="section">
          <p id="section_name">{{ section }}</p>
          <div v-for="(item, index) in items.slice(0, filterExpand[section] ? items.length : 3)" :key="item">
            <input :id="item" type="checkbox" :value="item" v-model="selectedFilters[section]"
              style=":hover{color: blue}">
            <label id="filters_name" :for="item" @click.prevent="toggleCheckbox(selectedFilters[section], item)">
              {{ item }}
            </label>
          </div>
          <button v-if="items.length > 3" @click="toggleExpand(section)" class="toggle-button">
            {{ filterExpand[section] ? 'Show Less' : 'Show More' }}
          </button>
        </div>
      </div>
      <div class="col-10">
        <div>
          <div class="container-fluid" id="searchbar">
            <div class="search-wrapper">
              <img class="btn" id="search_img" @click="handleSearch" src="../assets/images/search.png" alt="search" />
              <input id="search" v-model="query" placeholder="Search recipe" @input="filterSuggestions"
                @keyup.enter="handleSearch" />
              <ul v-if="filteredSuggestions.length && showSuggestions" class="suggestions-dropdown">
                <li v-for="(suggestion, index) in filteredSuggestions" :key="index"
                  @click="selectSuggestion(suggestion)">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
          <br><br>
          <div v-if="isLoading">
            <Loading />
          </div>
          <div v-else>
            <div class="card-columns">
              <div v-if="showRecommendations">
                <h4>Recipes For You</h4>
                <Recommendation />
              </div>
              <div v-if="filteredRecipes.length === 0" class="text-center py-8">
                <h5>No recipes found</h5>
                <p class="text-gray-600">
                  {{ getNoResultsMessage() }}
                </p>
                <button @click="clearFilters" class="btn btn-primary mt-4">
                  Clear Filters
                </button>
              </div>

              <!-- <div v-for="(recipe, index) in paginatedRecipes" :key="index" class="container-fluid card mb-3 col-5">
                <h5 class="card-title">
                  {{ recipe.label }}
                  <FavoriteButton :recipe="recipe" :isFavorite="recipe.isFavorite || false"
                    @updateFavorites="handleUpdateFavorites" />
                </h5>
                <h6>{{ capitalise(recipe.cuisineType.join(' ')) }} &nbsp &nbsp &nbsp {{
                  capitalise(recipe.mealType.join(', ')) }}</h6>
                <img id="recipe_img" :src="recipe.image" alt="Recipe Image" />
                <div class="card-body">
                  <p><strong>Calories Count:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
                  <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
                  <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
                </div>
                <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                  class="btn btn-primary">More Info</RouterLink>
              </div>
 -->

              <div class="row">
                <div v-for="(recipe, index) in paginatedRecipes" :key="index" class="col-md-4 col-sm-6 col-xs-12">

                  <!-- Wrap the card with RouterLink -->
                  <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                    class="card-link">
                    <div class="card">
                      <!-- Hidden image for preloading or accessibility (optional) -->
                      <img id="recipe_img" :src="recipe.image" alt="Recipe Image" style="display: none;" />

                      <div class="cover item-a" :style="{ backgroundImage: `url(${recipe.image})` }">
                        <h1>{{ recipe.label }}</h1>
                        <span class="card-sub">
                          {{ capitalise(recipe.cuisineType.join(' ')) }} &nbsp;&nbsp;&nbsp;
                          {{ capitalise(recipe.mealType.join(', ')) }}
                        </span>
                        <div class="card-back">
                          <div class="card-back-content">
                            <FavoriteButton :recipe="recipe" :isFavorite="recipe.isFavorite || false"
                              @updateFavorites="handleUpdateFavorites" />
                            <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
                            <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </div>

              <div v-if="filteredRecipes.length > recipesPerPage" class="pagination-controls">
                <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
                <button v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"
                  @click="goToPage(page)">
                  {{ page }}
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
              </div>
            </div>
          </div>
          <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import FavoriteButton from "@/components/FavoriteButton.vue"; // Import the FavoriteButton component
import Navbar from "@/components/Navbar.vue";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { RouterLink, useRoute } from 'vue-router';
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import Loading from "@/components/Loading.vue"; // Import the Loading component
import Recommendation from "@/components/Recommendation.vue";
</script>
<script>
const route = useRoute();
function capitalise(word) {
  if (word.includes(" ") || word.includes("/")) {
    if (word.includes(" ")) {
      var words = word.split(" ");
    } else {
      var words = word.split("/");
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(" / ");

  } else {
    return word[0].toUpperCase() + word.substring(1);
  }
}
export default {
  data() {
    return {
      query: '', // Holds the user's search query
      submittedQuery: '', // Holds the submitted search query for filtering
      showSuggestions: false,
      suggestions: ["Pasta", "Pizza", "Pancakes", "Pasta Salad", "Pumpkin Soup", "Pesto", "Peanut Butter Cookies"], // Example list of suggestions
      filteredSuggestions: [],
      recipes: [], // Holds the list of recipes
      favoriteRecipes: [],
      errorMessage: '', // Error message to display if the API request fails
      uniqueRecipes: [], // Holds unique recipes after removing duplicates
      apiUrl: 'https://api.edamam.com/search', // Replace with the actual API URL
      apiKey: import.meta.env.VITE_EDAMAM_API_KEY,  // Replace with your actual API key
      appId: import.meta.env.VITE_EDAMAM_APP_ID, // Replace with your actual App ID
      recipesPerPage: 15, // Number of recipes per page in the UI
      currentPage: 1, // Track current page number
      from: 0, // Pagination start index
      to: 100, // Number of results to fetch
      isLoading: false,

      // Initializing selected filters and expand toggle options
      selectedFilters: {
        MealTypes: [],
        DietLabels: [],
        HealthLabels: [],
        CuisineTypes: []
      },
      filterExpand: {
        MealTypes: false,
        DietLabels: false,
        HealthLabels: false,
        CuisineTypes: false
      },
      // Filter sections with default options
      filterSections: {
        MealTypes: ["Breakfast", "Brunch", "Lunch", "Dinner", "Snack", "Teatime"],
        DietLabels: ["Balanced", "High-Fiber", "High-Protein", "Low-Carb", "Low-Fat", "Low-Sodium"],
        HealthLabels: ["Alcohol-Cocktail", "Alcohol-Free", "Celery-Free", "Crustacean-Free", "Dairy-Free", "DASH", "Egg-Free", "Fish-Free", "Fodmap-Free", "Gluten-Free", "Immuno-Supportive", "Keto-Friendly", "Kidney-Friendly", "Kosher", "Low-Fat-Abs", "Low-Potassium", "Low-Sugar", "Lupine-Free", "Mediterranean", "Mollusk-Free", "Mustard-Free", "No oil added", "Paleo", "Peanut-Free", "Pescatarian", "Pork-Free", "Red-Meat-Free", "Sesame-Free", "Shellfish-Free", "Soy-Free", "Sugar-Conscious", "Sulfite-Free", "Tree-Nut-Free", "Vegan", "Vegetarian", "Wheat-Free"],
        CuisineTypes: ["American", "Asian", "British", "Caribbean", "Central Europe", "Chinese", "Eastern Europe", "French", "Indian", "Italian", "Japanese", "Kosher", "Mediterranean", "Mexican", "Middle Eastern", "Nordic", "South American", "South East Asian"]
      },
      // Separate lists to avoid undefined errors
      selectedDietLabels: [],
      selectedHealthLabels: [],
      selectedCuisineTypes: [],
      selectedMealTypes: []

    };
  },
  computed: {
    showRecommendations() {
      // Check if search query is empty and no filters are selected
      const noFilters = Object.values(this.selectedFilters).every(filterArray => filterArray.length === 0);
      return !this.query && noFilters;
    },
    filteredRecipes() {
      return this.recipes.filter(recipe => {
        const matchesQuery = this.submittedQuery
          ? recipe.label.toLowerCase().includes(this.submittedQuery.toLowerCase())
          : true;

        const matchesDiet = !this.selectedFilters.DietLabels.length ||
          this.selectedFilters.DietLabels.some(label =>
            recipe.dietLabels.map(d => d.toLowerCase()).includes(label.toLowerCase())
          );

        const matchesHealth = !this.selectedFilters.HealthLabels.length ||
          this.selectedFilters.HealthLabels.some(label =>
            recipe.healthLabels.map(h => h.toLowerCase()).includes(label.toLowerCase())
          );

        const matchesCuisine = !this.selectedFilters.CuisineTypes.length ||
          this.selectedFilters.CuisineTypes.some(type =>
            recipe.cuisineType.map(c => c.toLowerCase()).includes(type.toLowerCase())
          );


        const matchesMeal = !this.selectedFilters.MealTypes.length ||
          this.selectedFilters.MealTypes.some(meal =>
            recipe.mealType.some(m => m.toLowerCase().includes(meal.toLowerCase()))
          );

        return matchesQuery && matchesDiet && matchesHealth && matchesCuisine && matchesMeal;
      });

    },
    favoritesSet() {
      return new Set(this.favoriteRecipes.map(recipe => recipe.uri));
    },
    isFavorite(recipe) {
      return this.favoritesSet.has(recipe.uri);  // Adjusted to check directly in the Set
    },
    paginatedRecipes() {
      const start = (this.currentPage - 1) * this.recipesPerPage;
      const end = start + this.recipesPerPage;
      return this.filteredRecipes.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRecipes.length / this.recipesPerPage);
    }
  },
  mounted() {
    // Call the API to get all recipes in alphabetical order when the component is loaded
    this.handleSearch();
    this.fetchFavoriteRecipes(); // Fetch user's favorited recipes
  },

  methods: {
    getNoResultsMessage() {
      let message = 'Try adjusting your filters. ';

      // Add specific suggestions based on active filters
      if (this.query) {
        message += `Search term "${this.query}" `;
      }

      const activeFilters = [];
      Object.entries(this.selectedFilters).forEach(([category, filters]) => {
        if (filters.length > 0) {
          activeFilters.push(`${category}: ${filters.join(', ')}`);
        }
      });

      if (activeFilters.length > 0) {
        message += `Active filters: ${activeFilters.join(' | ')}`;
      }

      return message;
    },

    clearFilters() {
      // Reset all filters and search
      this.query = '';
      Object.keys(this.selectedFilters).forEach(key => {
        this.selectedFilters[key] = [];
      });
      this.handleSearch();
    },

    async fetchFavoriteRecipes() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            this.favoriteRecipes = userDoc.data().favoritedRecipes || [];
          }
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    },

    handleUpdateFavorites(updatedRecipe) {
      // Find the recipe by URI and update the isFavorite property
      const recipe = this.recipes.find(r => r.uri === updatedRecipe.uri);
      if (recipe) {
        recipe.isFavorite = updatedRecipe.isFavorited;
      }

      // Manage favoriteRecipes list to ensure consistency
      const index = this.favoriteRecipes.findIndex(fav => fav.uri === updatedRecipe.uri);
      if (updatedRecipe.isFavorited && index === -1) {
        this.favoriteRecipes.push(updatedRecipe);
      } else if (!updatedRecipe.isFavorited && index > -1) {
        this.favoriteRecipes.splice(index, 1);
      }
    },
    toggleFavorite(recipe) {
      const index = this.favoriteRecipes.findIndex(fav => fav.uri === recipe.uri);
      if (index > -1) {
        this.favoriteRecipes.splice(index, 1); // Remove if already a favorite
      } else {
        this.favoriteRecipes.push(recipe); // Add if not already a favorite
      }
    },
    isFavorite(recipe) {
      return this.favoritesSet.has(recipe.uri);
    },
    toggleExpand(section) {
      this.filterExpand[section] = !this.filterExpand[section];
    },
    toggleCheckbox(list, item) {
      // Toggle selection
      const index = list.indexOf(item);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(item);
      }
      // Set loading state and refresh recipes based on filters
      this.isLoading = true;
      this.handleSearch();
    },
    async handleSearch() {
      this.isLoading = true;
      this.from = 0; // Reset pagination when starting a new search
      this.submittedQuery = this.query; // Set submittedQuery to query for filtering
      this.uniqueRecipes = []; // Reset unique recipes
      this.recipes = [];
      this.showSuggestions = false; // Hide dropdown after search
      this.currentPage = 1;
      this.errorMessage = '';
      this.to = 100;
      await this.getData(); // Fetch the data based on query
      this.recipes = this.removeDuplicates(this.recipes);
      this.isLoading = false;
    },
    async getData() {
      this.isLoading = true;

      try {
        const params = {
          q: this.query || 'recipe',
          app_id: this.appId,
          app_key: this.apiKey,
          from: this.from,
          to: this.to,
        };

        // For diet labels, we need to make separate API calls for each label
        // and combine the results, since the API treats multiple diet params as AND
        if (this.selectedFilters.DietLabels.length) {
          let allRecipes = [];

          // Make separate API calls for each diet label
          const dietRequests = this.selectedFilters.DietLabels.map(async (diet) => {
            const dietParams = {
              ...params,
              diet: diet.toLowerCase()
            };
            try {
              const response = await axios.get(this.apiUrl, { params: dietParams });
              return response.data.hits.map(hit => hit.recipe);
            } catch (error) {
              console.error(`Error fetching recipes for diet ${diet}:`, error);
              return [];
            }
          });

          // Wait for all requests to complete
          const results = await Promise.all(dietRequests);

          // Combine all results
          allRecipes = results.flat();

          // Update recipes with combined results
          this.recipes = allRecipes;
        } else {
          // If no diet filters, make normal API call
          if (this.selectedFilters.HealthLabels.length) {
            params.health = this.selectedFilters.HealthLabels.map(label =>
              label.toLowerCase()
            ).join(',');
          }

          if (this.selectedFilters.MealTypes.length) {
            params.mealType = this.selectedFilters.MealTypes.join(',');
          }

          if (this.selectedFilters.CuisineTypes.length) {
            params.cuisineType = this.selectedFilters.CuisineTypes.join(',');
          }

          console.log('API params:', params);
          const response = await axios.get(this.apiUrl, { params });
          console.log('API Response:', response.data);

          if (response.data.hits.length) {
            this.recipes = response.data.hits.map(hit => hit.recipe);
          }
        }

        // Post-process the recipes
        if (this.recipes.length) {
          this.uniqueRecipes = this.removeDuplicates(this.recipes);
          this.sortRecipesAlphabetically();
        }

        this.errorMessage = '';
      } catch (error) {
        console.error(error);
        this.errorMessage = 'Failed to retrieve data. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    }, sortRecipesAlphabetically() {
      this.recipes.sort((a, b) => a.label.localeCompare(b.label));
    }, removeDuplicates(recipes) {
      const uniqueRecipes = [];
      const seenRecipes = new Set();



      recipes.forEach(recipe => {
        const normalizedLabel = recipe.label.trim().toLowerCase();
        const caloriesRounded = Math.round(recipe.calories);
        const uniqueKey = `${normalizedLabel}-${caloriesRounded}`;

        if (!seenRecipes.has(uniqueKey)) {
          seenRecipes.add(uniqueKey);
          uniqueRecipes.push(recipe);
        }
      });

      return uniqueRecipes;

    }, goToPage(page) {
      this.currentPage = page;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    toggleFilter(section, item) {
      const list = this.selectedFilters[section];
      const index = list.indexOf(item);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(item);
      }
      this.handleSearch(); // Trigger search with updated filters
    },
    filterSuggestions() {
      if (this.query.length > 0) {
        this.filteredSuggestions = this.suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(this.query.toLowerCase())
        );
        this.showSuggestions = true;
      } else {
        this.showSuggestions = false;
        this.filteredSuggestions = [];
      }
    },
    selectSuggestion(suggestion) {
      this.query = suggestion;
      this.showSuggestions = false; // Hide suggestions after selecting one
      this.handleSearch(); // Optionally trigger search on selection
    },
  }, mounted() {
    this.handleSearch();
  }
};

</script>

<style scoped>
.sidebar {
  padding-left: 50px
}

.pagination-controls .active {
  background-color: #6dafa5;
  color: white;
  border-radius: 5px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-controls button {
  margin: 0 5px;
  padding: 5px 10px;
}

/* #recipe_img {
  width: 250px;
  height: 250px;
  margin: auto;
  object-fit: cover;
} */

/* .card-columns h5 {
  font-weight: bold;
} */

.toggle-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  margin-top: 5px;
}

/* .card-body {
  border-radius: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
  background-color: rgba(253, 253, 252, 0.886)
}

.card-body p {
  justify-content: left;

} */

.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-gray-600 {
  color: #666;
}

.mt-4 {
  margin-top: 1rem;
}

/* .card {
  padding-top: 10px;
  background-color: #a4c694;
  display: inline-block;
  margin-left: 10px;
  width: 500px;
  height: 740px;
  overflow: hidden;
  text-align: center;
} */

.favorited {
  fill: red;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 150px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1;
}

.suggestions-dropdown li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-dropdown li:hover {
  background-color: #f0f0f0;
}

#search_img {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 38px;
  cursor: pointer;
}

#search {
  width: 200%;
  padding-left: 50px;
  border: solid;
  border-radius: 10px;
  height: 45px;
}

#searchbar {
  display: flex;


}

.search-wrapper {
  position: relative;
  width: 400px;
}

.filter-section label {
  padding-left: 10px;
  padding-bottom: 10px;
}

.filter-section {
  border-top: #727272 solid 1.5px;


}

#filters_name:hover {
  color: blue;
  cursor: pointer;
}

#filters_name {
  font-size: 14px;
}

input[type=checkbox]:hover {
  color: blue
}

button {
  margin-left: 30px;
}

#section_name {
  padding-top: 10px;
  color: #363636;
  font-weight: 500;
}


@import url("https://fonts.googleapis.com/css2?family=Oswald:wght@200;600&display=swap");

body {
  font-family: "Oswald", sans-serif;
  background-color: #212121;
}

body section {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

body section .row {
  align-items: center;
  height: 100vh;
}

.card {
  position: relative;
  height: 400px;
  width: 100%;
  margin: 10px 0;
  transition: ease all 2.3s;
  perspective: 1200px;
}

.card:hover .cover {
  transform: rotateX(0deg) rotateY(-180deg);
}

.card:hover .cover:before {
  transform: translateZ(30px);
}

.card:hover .cover:after {
  background-color: black;
}

.card:hover .cover h1 {
  transform: translateZ(100px);
}

.card:hover .cover .card-sub {
  transform: translateZ(60px);
}

.card:hover .cover a {
  transform: translateZ(-60px) rotatey(-180deg);
}

.card .cover {
  position: absolute;
  height: 100%;
  width: 100%;
  transform-style: preserve-3d;
  transition: ease all 2.3s;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

.card .cover:before {
  content: "";
  position: absolute;
  border: 5px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  z-index: 2;
  transition: ease all 2.3s;
  transform-style: preserve-3d;
  transform: translateZ(0px);
}

.card .cover:after {
  content: "";
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 2;
  transition: ease all 1.3s;
  background: rgba(0, 0, 0, 0.4);
}

.card .cover.item-a {
  background-image: url("https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=600&q=80");
}

.card .cover h1 {
  font-weight: 400;
  position: absolute;
  bottom: 55px;
  left: 50px;
  color: white;
  transform-style: preserve-3d;
  transition: ease all 2.3s;
  z-index: 3;
  font-size: 1.5em;
  transform: translateZ(0px);
}

.card .cover .card-sub {
  font-weight: 200;
  position: absolute;
  top: 55px;
  right: 50px;
  color: white;
  transform-style: preserve-3d;
  transition: ease all 2.3s;
  z-index: 4;
  font-size: 1.2em;
  transform: translateZ(0px);
}

.card .card-back {
  position: absolute;
  height: 100%;
  width: 100%;
  background: #ccd0c9;
  transform-style: preserve-3d;
  transition: ease all 2.3s;
  transform: translateZ(-1px) rotateY(-180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  /* Ensures it's above other elements */
}

.card .card-back-content {
  text-align: center;
  padding: 20px;
  color: #333;
}

.card .card-back p {
  margin: 10px 0;
  font-size: 0.9em;
  color: #333;
}

.card .card-back a.btn-primary {
  transform: rotateY(180deg);
  /* Correct orientation */
  display: inline-block;
  padding: 10px 20px;
  color: white;
  background-color: #007bff;
  border: none;
  margin-top: 10px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 5;
  /* Ensure it's above other elements */
}

.card .card-back a.btn-primary:hover {
  background-color: #0056b3;
}

.card-link {
  text-decoration: none;
  /* Removes underline from link */
  color: inherit;
  /* Inherit color so it doesn’t change */
}

.card-link .card:hover .card-back a.btn-primary {
  background-color: #0056b3;
}
</style>
