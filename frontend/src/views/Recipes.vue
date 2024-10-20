<template>
    <Navbar />
    <div class="container-fluid">
        Recipes
    </div>
    <div>
    <!-- search -->
    Search Recipe:
    <input v-model="query" placeholder="Enter a dish name..." />
    <br><br>

    <!-- Display results -->
    <div class="container-fluid" v-for="(recipe, index) in filteredRecipes" :key="index">
      <div class="card col-5">
        <h5 class="card-title">{{ recipe.label }}</h5>
        <img :src="recipe.image" alt="Recipe Image" />
        <div class="card-body">
          <p><strong>Calories Count:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
          <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
          <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
          <p><strong>Cuisine Type:</strong> {{ recipe.cuisineType.join(', ') }}</p>
          <a href="#" class="btn btn-primary">More Info</a>
        </div>
      </div>
    </div>

    <button @click="loadMore">Load More</button>

    <!-- Error message -->
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
  </div>
</template>

<script setup>

import Navbar from "@/components/Navbar.vue";
import axios from "axios";
</script>
<script>export default {
    data() {
      return {
        query: '', // Holds the user's search query
        recipes: [], // Holds the list of recipes
        errorMessage: '', // Error message to display if the API request fails
        apiUrl: 'https://api.edamam.com/search', // Replace with the actual API URL
        apiKey: '160b560497690476362bc1fca361165a', // Replace with your actual API key
        appId: '374ab5b2', // Replace with your actual App ID
        from: 0, // Pagination start index
        to: 20 // Number of results to fetch
      };
    },
    computed: {
      filteredRecipes() {
        // Filter recipes based on the query
        return this.recipes.filter(recipe =>
          recipe.label.toLowerCase().includes(this.query.toLowerCase())
        );
      }
    },
    watch: {
      query(newQuery) {
        if (newQuery.length > 2) {
          // Trigger search for queries longer than 2 characters
          this.getData(newQuery); // Call getData with the new query
        } else {
          this.recipes = []; // Clear results when query is too short
          this.errorMessage = ''; // Clear error message
        }
      }
    },
    methods: {
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
            // Check if there are any hits in the response
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
      }
    }
  };</script>

<style scoped>
img {
  width: 200px;
  height: 200px;
}

.card {
  background-color: #8fb17f;
}
</style>