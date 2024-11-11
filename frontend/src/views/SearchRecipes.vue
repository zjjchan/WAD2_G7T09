<template>
  <Navbar />
  <div class="container-fluid">
    <div class="row">
      <div class="col-10 d-md-none">
        <button @click="showFilter = !showFilter" class="btn btn-outline-secondary w-100 my-2">
          <i class="fas fa-filter"></i> Recipe Filters
        </button>
      </div>

      <!-- Flex container for sidebar and content -->
      <div class="content-wrapper d-flex">
        <div :class="[
          'sidebar',
          'd-md-block',
          {
            'd-none': !showFilter,
            'show': showFilter,
            'mobile-sidebar': showFilter
          }
        ]">
          <div class="d-md-none">
            <!-- Back Button to close filter section on small screens -->
            <button @click="closeFilter" class="btn btn-link">
              <i class="fas fa-arrow-left"></i>
            </button>

          </div>

          <h5><strong>Recipe Filters</strong></h5>
          <div class="filter-section" v-for="(items, section) in filterSections" :key="section">
            <p id="section_name">{{ formatSectionName(section) }}</p>
            <div v-for="(item, index) in items.slice(0, filterExpand[section] ? items.length : 3)" :key="item">
              <input :id="item" type="checkbox" :value="item" v-model="selectedFilters[section]">
              <label id="filters_name" :for="item" @click.prevent="toggleCheckbox(selectedFilters[section], item)">
                {{ item }}
              </label>
            </div>
            <button v-if="items.length > 3" @click="toggleExpand(section)" class="toggle-button">
              {{ filterExpand[section] ? 'Show Less' : 'Show More' }}
            </button>
          </div>
        </div>

        <!-- Right section content -->
        <div id="right-section" class="col-12 col-md-9">
          <div class="d-flex justify-content-center mb-4">
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
          <div col-md-5 v-else>
            <div class="card-columns col-lg-11">
              <div v-if="showRecommendations">
                <h4 style="margin-left: 40px;">Recipes For You</h4>
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
              <!-- Recipe Cards -->
              <div class="row justify-content-center">
                <div v-for="(recipe, index) in paginatedRecipes" :key="index"
                  class="recipe-card-wrapper col-md-6 col-lg-4 col-sm-12 mb-4">
                  <div class="card">
                    <div class="favorite-button-area" @click.stop>
                      <FavoriteButton :recipe="recipe" :isFavorite="recipe.isFavorite || false"
                        @updateFavorites="handleUpdateFavorites" class="favorite-button" @click.stop />
                    </div>
                    <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                      class="card-link">
                      <div class="cover" :style="{ backgroundImage: `url(${recipe.image})` }">
                        <h1>{{ recipe.label }}</h1>
                        <span class="card-sub">
                          {{ capitalise(recipe.cuisineType.join(' ')) }} &nbsp;&nbsp;&nbsp;
                          {{ capitalise(recipe.mealType.join(', ')) }}
                        </span>
                        <div class="card-back">
                          <div class="card-back-content">
                            <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
                            <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
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
      showFilter: false,
      errorMessage: '', // Error message to display if the API request fails
      uniqueRecipes: [], // Holds unique recipes after removing duplicates
      apiUrl: 'https://api.edamam.com/search', // Replace with the actual API URL
      apiKey: import.meta.env.VITE_EDAMAM_API_KEY,  // Replace with your actual API key
      appId: import.meta.env.VITE_EDAMAM_APP_ID, // Replace with your actual App ID
      recipesPerPage: 12, // Number of recipes per page in the UI
      currentPage: 1, // Track current page number
      from: 0, // Pagination start index
      to: 150, // Number of results to fetch
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
        HealthLabels: ["Alcohol-Cocktail", "Alcohol-Free", "Celery-Free", "Crustacean-Free", "Dairy-Free", "DASH", "Egg-Free", "Fish-Free", "Fodmap-Free", "Gluten-Free", "Immuno-Supportive", "Keto-Friendly", "Kidney-Friendly", "Kosher", "Low-Fat-Abs", "Low-Potassium", "Low-Sugar", "Lupine-Free", "Mollusk-Free", "Mustard-Free", "No oil added", "Paleo", "Peanut-Free", "Pescatarian", "Pork-Free", "Red-Meat-Free", "Sesame-Free", "Shellfish-Free", "Soy-Free", "Sugar-Conscious", "Sulfite-Free", "Tree-Nut-Free", "Vegan", "Vegetarian", "Wheat-Free"],
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
    formatSectionName(section) {
      // Insert a space before capital letters and trim any leading space
      return section.replace(/([A-Z])/g, ' $1').trim();
    },
    closeFilter() {
      this.showFilter = false;
    },
    toggleExpand(section) {
      this.filterExpand[section] = !this.filterExpand[section];
    },
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

          // console.log('API params:', params);
          const response = await axios.get(this.apiUrl, { params });
          // console.log('API Response:', response.data);

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
    },
    removeDuplicates(recipes) {
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
.container-fluid {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}




/* Recommendations section */
#right-section>div>.card-columns {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

#right-section>div>.card-columns>div:first-child {
  width: 100%;
  margin-bottom: 30px;
}

/* Searchbar */
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
  width: 100%;
  padding-left: 50px;
  border: solid;
  border-radius: 10px;
  height: 45px;
}

#searchbar {
  display: flex;
  justify-content: center;
  width: 100%;

}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  width: 800px;

}

.toggle-button {
  background: none;
  border: none;
  color: rgba(0, 90, 0, 1);
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  font-size: 14px;
  margin-top: 5px;
}


@media (min-width: 769px) {
  .filter-button {
    display: none;
  }

  .sidebar {
    position: fixed;
    left: 0;
    width: 240px;
    transform: none;

  }

  #right-section {
    margin-left: 250px;
    width: calc(100% - 250px);
  }
}




.filter-section {
  border-top: #727272 solid 1.5px;
  width: 150px;
  margin-bottom: 20px;
}

#filters_name {
  margin-left: 8px;
  cursor: pointer;
  font-size: 14px
}

.filter-section label {
  padding-left: 10px;
  padding-bottom: 10px;
}

#filters_name:hover {
  color: blue;
  cursor: pointer;
}

input[type=checkbox]:hover {
  color: blue
}

button {
  margin-left: 30px;
}

#section_name {
  margin-bottom: 10px;
  padding-top: 10px;
  color: #363636;
  font-weight: 500;
}

.active {
  font-weight: bold;
  color: #007bff;
}

.pagination-controls .active {
  background-color: rgba(0, 90, 0, 1);
  color: white;
  border-radius: 5px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 100%;
  margin-top: 20px;
  padding-bottom: 30px;
}

.pagination-controls button {
  margin: 0 5px;
  padding: 5px 10px;
  border: 1px #ddd;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  cursor: not-allowed;
}

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

/* Cards */
.recipe-card-wrapper {
  position: relative;
  width: 100%;
  padding: 0 10px;
}

@media (min-width: 1400px) {
  .col-lg-4 {
    width: calc(33.333% - 24px);
  }

  .card {
    max-width: 500px;
    margin: 0 auto 30px;
  }

  .card .cover h1 {
    font-size: 1.3em;
  }

  .card-sub {
    font-size: 1.1em;
  }
}

/* Responsive grid settings with larger cards */
@media (min-width: 1200px) and (max-width: 1399px) {
  .col-lg-4 {
    width: calc(33.333% - 24px);
  }

  .card {
    max-width: 450px;
    /* Increased from 350px */
    margin: 0 auto 24px;
  }

  .card .cover h1 {
    font-size: 1.6em;
  }
}

@media (min-width: 768px) and (max-width: 1199.5px) {
  .col-md-6 {
    width: calc(50% - 20px);
  }

  .card {
    max-width: 400px;
    margin: 0 auto 20px;
  }

  .card .cover h1 {
    font-size: 1.4em;
  }

}

@media (max-width: 767px) {
  .col-sm-12 {
    width: calc(100% - 20px);
  }

  .card {
    max-width: 350px;
    margin: 0 auto 20px;
  }

  .recipe-card-wrapper {
    padding: 0 15px;
  }

  /* Ensure content inside card maintains square ratio */
  .card .cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}


.card {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform-style: preserve-3d;
  perspective: 1000px;
  background: transparent;
  /* Changed from implicit white to transparent */
}

.card .cover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  transform-style: preserve-3d;
  transition: ease all 1s;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  backface-visibility: hidden;
  background-color: transparent;
  /* Added transparent background */
}


.card-link {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  text-decoration: none;
  color: inherit;
  z-index: 1;
  transform-style: preserve-3d;
}

/* Fixed Favorite button implementation */
.favorite-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 100;
  transform-style: preserve-3d;
  transition: ease all 1s;
  transform: translateZ(100px);
  cursor: pointer;
  pointer-events: all;
  backface-visibility: hidden;
}

.favorite-button-area {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  /* Increased clickable area */
  height: 70px;
  z-index: 99;
  pointer-events: all;
}

.card:hover .favorite-button {
  transform: translateZ(100px) rotateY(-180deg);
}

/* Make sure RouterLink doesn't interfere with button clicks */
.card-link {
  pointer-events: all;
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
  transition: ease all 1.1s;
  transform-style: preserve-3d;
  transform: translateZ(0px);
  backface-visibility: hidden;
}

.card .cover:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  transition: ease all 1.1s;
  background: rgba(0, 0, 0, 0.4);
  backface-visibility: hidden;
}

.card .cover h1 {
  font-weight: 500;
  position: absolute;
  bottom: 65px;
  left: 35px;
  right: 35px;
  color: white;
  transform-style: preserve-3d;
  transition: ease all 1s;
  z-index: 3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  transform: translateZ(0px);
}

.card .cover h1,
.card-sub {
  backface-visibility: hidden;
}

.card-sub {
  font-weight: 300;
  position: absolute;
  bottom: 25px;
  left: 35px;
  color: white;
  transform-style: preserve-3d;
  transition: ease all 1.1s;
  z-index: 3;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  transform: translateZ(0px);
}


.card-back {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #ccd0c9;
  transform-style: preserve-3d;
  transition: ease all 1s;
  transform: translateZ(-1px) rotateY(-180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  backface-visibility: hidden;
}

.card-back-content {
  text-align: center;
  padding: 20px;
  color: #333;
  font-size: 0.9rem;

}

/* Card flip animation */
.card:hover .cover {
  transform: rotateX(0deg) rotateY(-180deg);
}

.card:hover .cover:before {
  transform: translateZ(30px);
}

.card:hover .cover h1 {
  transform: translateZ(100px);
}

.card:hover .card-sub {
  transform: translateZ(60px);
}

.sidebar {
  background-color: #fff;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
  width: 250px;
  transition: all 0.3s ease;
  overflow-y: auto;
  height: 100%;
}


#right-section {
  margin-left: 250px;
  width: calc(100% - 250px);
  padding: 20px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#right-section>div {
  width: 100%;
  max-width: 1200px;
  /* Adjust this value based on your needs */
  margin: 0 auto;
}

/* Base sidebar styles */
.sidebar {
  background-color: #fff;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
  width: 250px;
  transition: all 0.3s ease;
  overflow-y: auto;
}

@media (max-width: 576px) {
  .sidebar {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 300px;
    height: 80vh;
    max-height: 80vh;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    background: #fff;
    overflow-y: auto;
    display: none;
  }

  .sidebar.show {
    display: block !important;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
  }

  .sidebar.show+.mobile-overlay {
    display: block;
  }

  #right-section {
    margin-left: 0;
    width: 100%;
    padding: 10px;
  }

  .filter-section {
    margin: 0 auto;
    padding: 10px 0;
  }
}


/* Tablet layout (577px - 768px) */
@media (min-width: 577px) and (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 400px;
    height: 80vh;
    background: #fff;
    z-index: 1000;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    display: none;
  }

  .sidebar.show {
    display: block !important;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
  }

  .sidebar.show+.mobile-overlay {
    display: block;
  }

  #right-section {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .filter-section {
    margin: 0 auto;
    width: 90%;
    max-width: 300px;
  }


}

/* Desktop layout (min-width: 769px) */
@media (min-width: 769px) {
  .content-wrapper {
    position: relative;
    display: flex;
    width: 100%;
  }

  .sidebar {
    position: fixed;
    top: 10;
    left: 0;
    height: 100vh;
    transform: none;
  }

  #right-section {
    margin-left: 250px;
    width: calc(100% - 250px);
  }

}

/* Overlay for mobile filter */
.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .sidebar.show+.mobile-overlay {
    opacity: 1;
  }
}

.sidebar {
  position: fixed;
  top: 10;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  background-color: #fff;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
  width: 250px;
  z-index: 1000;
  transition: transform 0.3s ease;
  padding-bottom: 100px;
  /* Add extra padding at bottom */
}

/* Ensure the content wrapper takes full height */
.content-wrapper {
  min-height: 100vh;
  position: relative;
}

/* Maintain responsive layout */
@media (max-width: 768px) {
  #right-section {
    margin-left: 0;
    width: 100%;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}

/* Adjust card layout */
.card-columns {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.row.justify-content-center {
  width: 100%;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

/* Ensure search bar is centered */
.search-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* Ensure pagination is centered */
.pagination-controls {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 30px;
}

/* 

@media (max-width: 750px) {
  .search-wrapper {
    position: relative;
    width: 155px;

  }

  .card-columns {
    width: 300px;
    margin: auto;
    padding-left: 30px;
  }

} */
/* 
@media (max-width: 1300px) {
  .sidebar {
    padding-right: 10px
  }

  #right-section {
    overflow: hidden
  }
} */
/* 
@media (max-width: 600px) {
  .search-wrapper {
    position: relative;
    width: 155px;

  }

  .card-columns {
    width: 300px;
    margin: auto;
    padding-left: 30px;
  }

} */

/* @media (max-width: 1200px) {
  h1 {
    font-size: 100px
  }

  #right-section .col-md-6 {
    padding-right: 0;
  }
} 
*/

/* 
@media (max-width: 576px) {
  #searchbar {
    float: left;

  }

  i {
    font-size: 30px;
  }

  .filter-section {
    justify-content: center;
    margin: auto;
    border-top: #727272 solid 1.5px;
    width: 150px;
  }

  .btn-link {
    float: left;
  }

  .card-columns {
    padding-top: 30px;
  }

  .search-wrapper {
    position: relative;
    width: 250px;
  }

  .sidebar {
    position: fixed;
    width: 100%;
    height: 100%;
    background: #b5c7ae;
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;

  }
} */

</style>
