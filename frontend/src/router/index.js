import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Homepage from '../views/Homepage.vue';
import SearchRecipes from '../views/SearchRecipes.vue';
import Recipe from '../views/Recipe.vue';
import GroceryList from '../views/GroceryList.vue';
import Nutrition from '../views/Nutrition.vue';
import Auth from '../views/Auth.vue';
import Profile from '../views/Profile.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Homepage,
      meta: { requiresAuth: true }
    },
    {
      path: '/search-recipes',
      name: 'searchRecipes',
      component: SearchRecipes,
      meta: { requiresAuth: true }
    },
    {
      path: '/recipe',
      name: 'recipe',
      component: Recipe,
      meta: { requiresAuth: true }
    },
    {
      path: '/grocery-list',
      name: 'groceryList',
      component: GroceryList,
      meta: { requiresAuth: true }
    },
    {
      path: '/nutrition',
      name: 'nutrition',
      component: Nutrition,
      meta: { requiresAuth: true }
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    }
  ]
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      next('/auth');
    } else if (to.path === '/auth' && user) {
      next('/');
    } else {
      next();
    }
  });
});

export default router;