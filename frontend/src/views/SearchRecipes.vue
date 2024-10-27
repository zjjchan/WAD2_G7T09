<template>
  <Navbar />
  <div class="container-fluid">

    <div class="row">

      <!-- Sidebar for filters -->
      <div class="col-3 sidebar">
        <h5><strong>Filters</strong></h5>

        <div class="filter-section">
          <h6>Meal Types</h6>
          <div v-for="label in mealTypes" :key="label">
            <input id="{{label}}" type="checkbox" :value="label" v-model="selectedMealTypes" />
            <label for="{{label}}">{{ label }}</label>
          </div>
        </div>

        <div class="filter-section">
          <h6>Diet Labels</h6>
          <div v-for="label in dietLabels" :key="label">
            <input type="checkbox" :value="label" v-model="selectedDietLabels" />
            <label>{{ label }}</label>
          </div>
        </div>

        <div class="filter-section">
          <h6>Health Labels</h6>
          <div v-for="label in healthLabels" :key="label">
            <input type="checkbox" :value="label" v-model="selectedHealthLabels" />
            <label>{{ label }}</label>
          </div>
        </div>

        <div class="filter-section">
          <h6>Cuisine Type</h6>
          <div v-for="cuisine in cuisineTypes" :key="cuisine">
            <input type="checkbox" :value="cuisine" v-model="selectedCuisineTypes" />
            <label>{{ cuisine }}</label>
          </div>
        </div>

        <button @click="applyFilters" class="btn btn-primary mt-3">Apply Filters</button>
      </div>


      <!-- search -->
      <div class="col-9">
        <div>
          <div class="container" id="searchbar">
            <img id="search_img" src="../assets/images/search.png" alt="search">
            <input v-model="query" placeholder="Search recipe" @keyup.enter="handleSearch" />
            <button @click="handleSearch" class="btn btn-primary">Search</button>
          </div>

          <br><br>
          <div v-if="isLoading">Loading recipes...</div>
          <div v-else>

            <div class="card-columns">
              <!-- Display filtered and paginated results -->
              <div v-for="(recipe, index) in paginatedRecipes" :key="index" class="container-fluid card mb-3 col-5">
                <h5 class="card-title">{{ recipe.label }}</h5>
                <img id="recipe_img" :src="recipe.image" alt="Recipe Image" />
                <div class="card-body">
                  <p><strong>Calories Count:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
                  <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
                  <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
                  <p><strong>Cuisine Type:</strong> {{ capitalise(recipe.cuisineType.join(', ')) }}</p>
                  <p><strong>Meal Type:</strong> {{ capitalise(recipe.mealType.join(', ')) }}</p>

                  <!-- Pass the recipe URI instead of the label -->
                  <RouterLink :to="{ name: 'recipe', params: { uri: encodeURIComponent(recipe.uri) } }"
                    class="btn btn-primary">
                    More Info
                  </RouterLink>

                </div>
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

import Navbar from "@/components/Navbar.vue";
import axios from "axios";
import { RouterLink, useRoute } from 'vue-router';
const route = useRoute();

const isActiveLink = (routePath) => {
  return route.path === routePath;
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
      query: '', // Holds the user's search query
      recipes: [], // Holds the list of recipes
      errorMessage: '', // Error message to display if the API request fails
      apiUrl: 'https://api.edamam.com/search', // Replace with the actual API URL
      apiKey: '160b560497690476362bc1fca361165a', // Replace with your actual API key
      appId: '374ab5b2', // Replace with your actual App ID
      recipesPerPage: 10, // Number of recipes per page in the UI
      currentPage: 1, // Track current page number
      from: 0, // Pagination start index
      to: 100, // Number of results to fetch
      isLoading: false,

      // Filter data
      dietLabels: ["Balanced",
        "High-Fiber",
        "High-Protein",
        "Low-Carb",
        "Low-Fat",
        "Low-Sodium"],
      mealTypes: ["Breakfast",
        "Dinner",
        "Lunch",
        "Snack",
        "Teatime"],
      healthLabels: ["Alcohol-Cocktail",
        "Alcohol-Free",
        "Celery-Free",
        "Crustacean-Free",
        "Dairy-Free",
        "DASH",
        "Egg-Free",
        "Fish-Free",
        "Fodmap-Free",
        "Gluten-Free",
        "Immuno-Supportive",
        "Keto-Friendly",
        "Kidney-Friendly",
        "Kosher",
        "Low-Fat-Abs",
        "Low-Potassium",
        "Low-Sugar",
        "Lupine-Free",
        "Mediterranean",
        "Mollusk-Free",
        "Mustard-Free",
        "No-oil-added",
        "Paleo",
        "Peanut-Free",
        "Pescatarian",
        "Pork-Free",
        "Red-Meat-Free",
        "Sesame-Free",
        "Shellfish-Free",
        "Soy-Free",
        "Sugar-Conscious",
        "Sulfite-Free",
        "Tree-Nut-Free",
        "Vegan",
        "Vegetarian",
        "Wheat-Free"],
      cuisineTypes: ["American",
        "Asian",
        "British",
        "Caribbean",
        "Central Europe",
        "Chinese",
        "Eastern Europe",
        "French",
        "Indian",
        "Italian",
        "Japanese",
        "Kosher",
        "Mediterranean",
        "Mexican",
        "Middle Eastern",
        "Nordic",
        "South American",
        "South East Asian"],

      // Selected filters
      selectedDietLabels: [],
      selectedHealthLabels: [],
      selectedCuisineTypes: [],
      selectedMealTypes: []
    };
  },
  computed: {
    filteredRecipes() {
      return this.recipes.filter(recipe => {
        const matchesDiet = !this.selectedDietLabels.length ||
          this.selectedDietLabels.some(label =>
            recipe.dietLabels.some(d => d.toLowerCase() === label.toLowerCase())
          );

        const matchesHealth = !this.selectedHealthLabels.length ||
          this.selectedHealthLabels.some(label =>
            recipe.healthLabels.some(h => h.toLowerCase() === label.toLowerCase())
          );

        const matchesCuisine = !this.selectedCuisineTypes.length ||
          this.selectedCuisineTypes.some(cuisine =>
            recipe.cuisineType.some(c => c.toLowerCase() === cuisine.toLowerCase())
          );

        const matchesMeal = !this.selectedMealTypes.length ||
          this.selectedMealTypes.some(meal =>
            recipe.mealType.some(m => m.toLowerCase() === meal.toLowerCase())
          );

        return matchesDiet && matchesHealth && matchesCuisine && matchesMeal;
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
  methods: {
    async handleSearch() {
      if (this.query.length > 2) {
        this.from = 0; // Reset pagination when starting a new search
        this.recipes = [];
        this.currentPage = 1;
        this.errorMessage = '';
        this.to = 100;
        await this.getData(this.query); // Fetch the data based on query
      } else {
        this.recipes = [];
        this.errorMessage = 'Please enter at least 3 characters.';
      }
    },
    async getData(query) {
      this.isLoading = true;
      const apiUrl = 'https://api.edamam.com/search';
      const appId = '374ab5b2'; // Replace with your actual App ID
      const apiKey = '160b560497690476362bc1fca361165a'; // Replace with your actual API key
      try {
        while (true) {
          const response = await axios.get(apiUrl, {
            params: {
              q: query,
              app_id: appId,
              app_key: apiKey,
              from: this.from,
              to: this.to,
            },
          });

          // If no results are returned, break out of the loop
          if (!response.data.hits.length) break;

          // Add new recipes to the existing list
          this.recipes = [...this.recipes, ...response.data.hits.map(hit => hit.recipe)];

          // Update `from` and `to` for the next batch
          this.from += 50;
          this.to += 50;
        }
        this.errorMessage = '';
      }
      catch (error) {
        console.error(error);
        this.errorMessage = 'Failed to retrieve data. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    }, applyFilters() {
      // Trigger re-evaluation of filteredRecipes
      this.filteredRecipes;
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
    }
  }
};

</script>

<style scoped>
#search_img {
  width: 2rem;
  padding-right: 10px;
}



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
  width: 200px;
  height: 200px;
  margin: auto;
}

.card {
  background-color: #8fb17f;
  display: inline-block;
  margin-left: 10px;
}

#searchbar {
  border: solid 2px;
  border-radius: 30px;
  width: 400px;
  height: 50px;

  align-content: center;

}

input {
  border: none;
  margin: auto;

}

.filter-section label {
  padding-left: 10px;
  padding-bottom: 10px;
}

button {
  margin-left: 30px;
}
</style>
