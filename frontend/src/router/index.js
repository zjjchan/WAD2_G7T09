import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../views/Homepage.vue'
import Recipes from '../views/Recipes.vue'
import GroceryList from '../views/GroceryList.vue'
import Nutrition from '../views/Nutrition.vue'
import Profile from '../views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Homepage
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: Recipes
    },
    {
      path: '/grocery-list',
      name: 'groceryList',
      component: GroceryList
    },
    {
      path: '/nutrition',
      name: 'nutrition',
      component: Nutrition
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    }
  ]
})

export default router