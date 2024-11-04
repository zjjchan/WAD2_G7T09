<template>
  <Navbar />
  <div class="container-fluid">

    <div class="row">

      <!-- Sidebar for filters -->
      <div class="col-2 sidebar">
        <h3><strong>Filters</strong></h3>

        <div class="filter-section" v-for="(items, section) in filterSections" :key="section">
          <h5>{{ section }}</h5>
          <div v-for="(item, index) in items.slice(0, filterExpand[section] ? items.length : 3)" :key="item">
            <input :id="item" type="checkbox" :value="item" v-model="selectedFilters[section]"
              :checked="isPreferenceSelected(section, item)" @change="toggleCheckbox(section, item)" />
            <label :for="item">{{ item }}</label>
          </div>

          <button v-if="items.length > 3" @click="toggleExpand(section)" class="toggle-button">
            {{ filterExpand[section] ? 'Show Less' : 'Show More' }}
          </button>
        </div>

      </div>
      <!-- search -->
      <div class="col-10">
        <div>

          <div class="container-fluid" id="searchbar">
            <div class="search-wrapper">
              <img class="btn" id="search_img" @click="handleSearch" src="../assets/images/search.png" alt="search" />

              <input id="search" v-model="query" placeholder="Search recipe" @input="filterSuggestions"
                @keyup.enter="handleSearch" />
              <!-- Dropdown suggestions -->
              <ul v-if="filteredSuggestions.length && showSuggestions" class="suggestions-dropdown">
                <li v-for="(suggestion, index) in filteredSuggestions" :key="index"
                  @click="selectSuggestion(suggestion)">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>

          <br><br>
          <div v-if="isLoading">Loading recipes...</div>
          <div v-else>

            <div class="card-columns">
              <!-- Display filtered and paginated results -->
              <div v-for="(recipe, index) in paginatedRecipes" :key="index" class="container-fluid card mb-3 col-5">
                <h5 class="card-title">{{ recipe.label }}
                  <FavoriteButton :recipe="recipe" />
                </h5>


                <h6>{{ capitalise(recipe.cuisineType.join(' ')) }} &nbsp &nbsp &nbsp&nbsp &nbsp &nbsp &nbsp {{
                  capitalise(recipe.mealType.join(', ')) }}</h6>


                <img id="recipe_img" :src="recipe.image" alt="Recipe Image" />
                <div class="card-body">
                  <p><strong>Calories Count:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
                  <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
                  <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
                </div>
                <!-- Pass the recipe URI instead of the label -->
                <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                  class="btn btn-primary">
                  More Info
                </RouterLink>


              </div>
              <!-- Pagination Controls -->
              <div class="pagination-controls">
                <button @click="prevPage" :disabled="currentPage === 1">Previous</button>

                <!-- Numbered Pagination Buttons -->
                <button v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"
                  @click="goToPage(page)">
                  {{ page }}
                </button>

                <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
              </div>

            </div>
          </div>
          <!-- Error message -->
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
import { RouterLink, useRoute } from 'vue-router';

import { ref, onMounted, computed, watch, reactive } from 'vue';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const route = useRoute();
const selectedDietType = ref([]);
const selectedLabels = ref([]);
const selectedCuisine = ref([]);
const selectedFilters = reactive({
  MealTypes: [],
  DietLabels: [],
  HealthLabels: [],
  CuisineTypes: []
});
const filterExpand = reactive({
  MealTypes: false,
  DietLabels: false,
  HealthLabels: false,
  CuisineTypes: false
});
const auth = getAuth();
const userId = ref(null);
const db = getFirestore();
const user = auth.currentUser;

const userDietType = computed(() => selectedDietType.value || []);
const userLabels = computed(() => selectedLabels.value || []);
const userCuisine = computed(() => selectedCuisine.value || []);
const fetchUserData = async () => {
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        selectedDietType.value = userDoc.data().healthGoals || [];
        selectedLabels.value = userDoc.data().dietaryPreferences || [];
        selectedCuisine.value = userDoc.data().cuisineTypes || [];

        // Initialize selectedFilters based on user preferences
        selectedFilters.DietLabels = [...selectedDietType.value];
        selectedFilters.HealthLabels = [...selectedLabels.value];
        selectedFilters.CuisineTypes = [...selectedCuisine.value];
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  } else {
    console.log('User not authenticated');
  }
};
onMounted(fetchUserData);
watch(
  () => [selectedDietType.value, selectedLabels.value, selectedCuisine.value],
  ([newDietType, newLabels, newCuisine]) => {
    selectedFilters.DietLabels = [...newDietType];
    selectedFilters.HealthLabels = [...newLabels];
    selectedFilters.CuisineTypes = [...newCuisine];
  },
  { immediate: true }
);

function isPreferenceSelected(section, item) {
  return selectedFilters[section].includes(item);
}

function toggleExpand(section) {
  filterExpand[section] = !filterExpand[section];
}

</script>
<script>
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
      selectedFilters: {
        MealTypes: [],
        DietLabels: [],
        HealthLabels: [],
        CuisineTypes: []
      },
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
      apiKey: import.meta.env.VITE_EDAMAM_API_KEY, // Replace with your actual API key
      appId: import.meta.env.VITE_EDAMAM_APP_ID, // Replace with your actual App ID
      recipesPerPage: 15, // Number of recipes per page in the UI
      currentPage: 1, // Track current page number
      from: 0, // Pagination start index
      to: 100, // Number of results to fetch
      isLoading: false,

      // Initializing selected filters and expand toggle options

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
  },


  methods: {

    toggleFavorite(recipe) {
      const index = this.favoriteRecipes.findIndex(fav => fav.uri === recipe.uri);
      if (index > -1) {
        this.favoriteRecipes.splice(index, 1); // Remove if already a favorite
      } else {
        this.favoriteRecipes.push(recipe); // Add if not already a favorite
      }
    }, isFavorite(recipe) {
      return this.favoriteRecipes.some(fav => fav.uri === recipe.uri);
    },
    toggleExpand(section) {
      // Access `this.filterExpand` directly instead of using `filterExpand.value`
      this.filterExpand[section] = !this.filterExpand[section];
    },
    toggleCheckbox(section, item) {
      console.log(`Toggling ${item} in section ${section}`);
      const index = this.selectedFilters[section].indexOf(item);
      if (index > -1) {
        this.selectedFilters[section].splice(index, 1);
      } else {
        this.selectedFilters[section].push(item);
      }
      console.log('Updated selectedFilters:', this.selectedFilters);
    },
    async handleSearch() {

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
    },
    async getData() {
      this.isLoading = true;

      try {
        while (true) {
          const response = await axios.get(this.apiUrl, {
            params: {
              q: this.query || 'recipe',
              app_id: this.appId,
              app_key: this.apiKey,
              from: this.from,
              to: this.to,
            },
          });

          // If no results are returned, break out of the loop
          if (!response.data.hits.length) break;

          // Add new recipes to the existing list
          this.recipes = [...this.recipes, ...response.data.hits.map(hit => hit.recipe)];
          // Remove duplicates
          this.uniqueRecipes = this.removeDuplicates(this.recipes);

          // Update `from` and `to` for the next batch
          this.from += 50;
          this.to += 50;
        }
        this.sortRecipesAlphabetically();
        this.errorMessage = '';
      }
      catch (error) {
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
    }, sortRecipesAlphabetically() {
      this.recipes.sort((a, b) => a.label.localeCompare(b.label));
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
  }
};
const userDietType = computed(() => selectedDietType.value || []);
const userLabels = computed(() => selectedLabels.value || []);
const userCuisine = computed(() => selectedCuisine.value || []);
</script>

<style scoped>
.sidebar {
  padding-left: 50px
}

.pagination-controls .active {
  background-color: #007bff;
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

#recipe_img {
  width: 250px;
  height: 250px;
  margin: auto;
  object-fit: cover;
}

.card-columns h5 {
  font-weight: bold;
}

.toggle-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  margin-top: 5px;
}

.card-body {
  border-radius: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
  background-color: rgba(253, 253, 252, 0.886)
}

.card-body p {
  justify-content: left;

}

.card {
  padding-top: 10px;
  background-color: #a4c694;
  display: inline-block;
  margin-left: 10px;
  width: 500px;
  height: 740px;
  overflow: hidden;
  text-align: center;
}

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

button {
  margin-left: 30px;
}
</style>
