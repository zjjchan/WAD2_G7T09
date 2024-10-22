<template>
    <Navbar />
    <div class="container-fluid">
      
    </div>
    <div>
    <!-- search -->
    
    <div class="container" id="searchbar">
      <img id="search_img" src="../assets/images/search.png" alt="search">
      <input 
      v-model="query" 
      placeholder="Search recipe" 
      @keyup.enter="handleSearch" 
    />
      <button @click="handleSearch" class="btn btn-primary">Search</button>
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
      // Show filtered recipes when available
      return this.recipes;
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
    }
  }
};

</script>

<style scoped>
#search_img{
  width: 2rem;
  padding-right: 10px;
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
  margin: auto;
  width: 400px;
  height: 50px;
  margin-top:50px ;
  align-content: center;

}
input{
  border: none;
  margin: auto;
  
}
</style>

