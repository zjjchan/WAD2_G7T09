<template>
    <Navbar />
    <div class="container-fluid">
      
    </div>
    <div>
    <!-- search -->
    
    <div id="searchbar">
      <img id="search_img" src="../assets/images/search.png" alt="search">
      <input v-model="query" placeholder="Search Recipe" />
    </div>
    <br><br>

    <!-- Display results -->
    <div class="container-fluid" v-for="(recipe, index) in filteredRecipes" :key="index">
      <div class="card col-5">
        <h5 class="card-title">{{ recipe.label }}</h5>
        <img id="recipe_img" :src="recipe.image" alt="Recipe Image" />
        <div class="card-body">
          <p><strong>Calories Count:</strong> {{ recipe.calories.toFixed(0) }} kcals</p>
          <p><strong>Health Labels:</strong> {{ recipe.healthLabels.join(', ') }}</p>
          <p><strong>Diet Labels:</strong> {{ recipe.dietLabels.join(', ') }}</p>
          <p><strong>Cuisine Type:</strong> {{ recipe.cuisineType.join(', ') }}</p>
          
          <RouterLink
            :to="{ name: 'recipe', params: { label: recipe.label } }"
            class="btn btn-primary"
            @click.native="saveSelectedRecipe(recipe)" >
          
            More Info
          </RouterLink>
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
      },
      saveSelectedRecipe(recipe) {
      // Save the selected recipe to localStorage or Vuex to access in Recipe.vue
      localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
    }
    }
  };</script>

<style scoped>
#search_img{
  width: 1%
}
#recipe_img {
  width: 200px;
  height: 200px;
}

.card {
  background-color: #8fb17f;
}
#searchbar{
  border: solid 1px;
  border-radius: 30px;
}
input{
  border: none
}
</style>

