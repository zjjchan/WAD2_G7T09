<template>
  <Navbar />
  <div class="container-fluid">

    <div class="row">

      <!-- Sidebar for filters -->
      <div class="col-3">
        <h5>Filters</h5>

        <div class="filter-section">
          <h6>Meal Types</h6>
          <div v-for="label in mealTypes" :key="label">
            <input type="checkbox" :value="label" v-model="selectedMealTypes" />
            <label>{{ label }}</label>
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



          <!-- Display results -->
          <div class="col-3 column">
            <div v-for="(recipe, index) in filteredRecipes" :key="index" class="container-fluid card mb-3">

              <h5 class="card-title">{{ recipe.label }}</h5>
              <img id="recipe_img" :src="recipe.image" alt="Recipe Image" />
              <div class="card-body">
                <p><strong>Calories Count:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
                <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
                <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
                <p><strong>Cuisine Type:</strong> {{ recipe.cuisineType.join(', ') }}</p>
                <p><strong>Meal Type:</strong> {{ recipe.mealType.join(', ') }}</p>

                <RouterLink :to="{ name: 'recipe', params: { label: recipe.label } }" class="btn btn-primary"
                  @click.native="saveSelectedRecipe(recipe)">

                  More Info
                </RouterLink>

              </div>
            </div>
          </div class="col-5">


          <button @click="loadMore" v-if="recipes.length > 0">Load More</button>
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
export default {
  data() {
    return {
      query: '', // Holds the user's search query
      recipes: [], // Holds the list of recipes
      errorMessage: '', // Error message to display if the API request fails
      apiUrl: 'https://api.edamam.com/search', // Replace with the actual API URL
      apiKey: '160b560497690476362bc1fca361165a', // Replace with your actual API key
      appId: '374ab5b2', // Replace with your actual App ID
      from: 0, // Pagination start index
      to: 20, // Number of results to fetch

      // Filter data
      dietLabels: ["balanced",
        "high-fiber",
        "high-protein",
        "low-carb",
        "low-fat",
        "low-sodium"],
      mealTypes: ["Breakfast",
        "Dinner",
        "Lunch",
        "Snack",
        "Teatime"],
      healthLabels: ["alcohol-cocktail",
        "alcohol-free",
        "celery-free",
        "crustacean-free",
        "dairy-free",
        "DASH",
        "egg-free",
        "fish-free",
        "fodmap-free",
        "gluten-free",
        "immuno-supportive",
        "keto-friendly",
        "kidney-friendly",
        "kosher",
        "low-fat-abs",
        "low-potassium",
        "low-sugar",
        "lupine-free",
        "Mediterranean",
        "mollusk-free",
        "mustard-free",
        "no-oil-added",
        "paleo",
        "peanut-free",
        "pescatarian",
        "pork-free",
        "red-meat-free",
        "sesame-free",
        "shellfish-free",
        "soy-free",
        "sugar-conscious",
        "sulfite-free",
        "tree-nut-free",
        "vegan",
        "vegetarian",
        "wheat-free"],
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
        const matchesDiet = !this.selectedDietLabels.length || this.selectedDietLabels.some(label => recipe.dietLabels.includes(label));
        const matchesHealth = !this.selectedHealthLabels.length || this.selectedHealthLabels.some(label => recipe.healthLabels.includes(label));
        const matchesCuisine = !this.selectedCuisineTypes.length || this.selectedCuisineTypes.some(cuisine => recipe.cuisineType.includes(cuisine));
        const matchesMeal = !this.selectedMealTypes.length || this.selectedMealTypes.some(meal => recipe.mealType.includes(meal));

        return matchesDiet && matchesHealth && matchesCuisine && matchesMeal;
      });
    }
  },
  methods: {
    handleSearch() {
      if (this.query.length > 2) {
        this.from = 0; // Reset pagination when starting a new search
        this.getData(this.query); // Fetch the data based on query
      } else {
        this.recipes = [];
        this.errorMessage = 'Please enter at least 3 characters.';
      }
    },
    getData(query) {
      axios
        .get(this.apiUrl, {
          params: {
            q: query,
            app_id: this.appId,
            app_key: this.apiKey,
            from: this.from,
            to: this.to
          }
        })
        .then(response => {
          if (response.data.hits && response.data.hits.length > 0) {
            this.recipes = response.data.hits.map(hit => hit.recipe);
            this.errorMessage = ''; // Clear error message
          } else {
            this.recipes = [];
            this.errorMessage = 'No recipes found for this search.';
          }
        })
        .catch(error => {
          console.error(error);
          this.errorMessage = 'Failed to retrieve data. Please try again later.';
        });
    },
    loadMore() {
      this.from += this.to; // Increment the starting index for pagination
      this.getData(this.query); // Fetch more data
    },
    applyFilters() {
      // Trigger re-evaluation of filteredRecipes
      this.filteredRecipes;
    }
  }
};

</script>

<style scoped>
#search_img {
  width: 2rem;
  padding-right: 10px;
}

.column {
  float: left;
  width: 50%;
}

#recipe_img {
  width: 200px;
  height: 200px;
}

.card {
  background-color: #8fb17f;
}

#searchbar {
  border: solid 2px;
  border-radius: 30px;
  margin: auto;
  width: 400px;
  height: 50px;
  margin-top: 50px;
  align-content: center;

}

input {
  border: none;
  margin: auto;

}


button {
  margin-left: 30px;
}
</style>
