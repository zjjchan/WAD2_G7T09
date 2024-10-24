<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import profilepic from '@/assets/images/profilepic.png';

defineProps({
  user: String,
});

const route = useRoute();
const router = useRouter();

const isActiveLink = (routePath) => route.path === routePath;

</script>

<template>
  <nav class="main-navbar navbar sticky-top navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <button
        class="navbar-toggler me-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <RouterLink to="/" class="nav-logo navbar-brand mx-auto">
        Mealmate
      </RouterLink>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink
              to="/search-recipes"
              class="nav-link"
              :class="{ 'active': isActiveLink('/search-recipes') }"
            >
              recipes
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              to="/grocery-list"
              class="nav-link"
              :class="{ 'active': isActiveLink('/grocery-list') }"
            >
              grocery list
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              to="/nutrition"
              class="nav-link"
              :class="{ 'active': isActiveLink('/nutrition') }"
            >
              nutrition
            </RouterLink>
          </li>
        </ul>
      </div>

      <div class="pfp d-flex align-items-center ms-3">
        <div class="dropdown">
          <button
            class="btn border-0"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img :src="profilepic" alt="Profile Picture" class="profile-img" />
          </button>
          <ul class="dropdown-menu">
            <li>
              <RouterLink to="/profile" class="dropdown-item">My Profile</RouterLink>
            </li>
            <li>
              <RouterLink to="/meal-preferences" class="dropdown-item">Meal Preferences</RouterLink>
            </li>
            <li>
              <RouterLink to="/profile-settings" class="dropdown-item">Profile Settings</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

  <div
    class="main-sidebar offcanvas offcanvas-start"
    tabindex="-1"
    id="sidebar"
  >
    <div class="offcanvas-header">
      <button
        type="button"
        class="btn-close text-reset"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <ul class="navbar-nav" data-bs-dismiss="offcanvas">
        <li class="nav-item">
          <RouterLink to="/" class="nav-link text-light" :class="{ 'active': isActiveLink('/') }">
            Home
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/recipes" class="nav-link text-light" :class="{ 'active': isActiveLink('/recipes') }">
            Recipes
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/grocery-list" class="nav-link text-light" :class="{ 'active': isActiveLink('/grocery-list') }">
            Grocery List
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/nutrition" class="nav-link text-light" :class="{ 'active': isActiveLink('/nutrition') }">
            Nutrition
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.main-navbar {
  background-color: #ffffff;
  padding: 10px 20px;
}

.nav-logo {
  font-family: 'Shrikhand', cursive;
  font-size: 2rem;
  color: rgb(9, 56, 9);
  width: 180px;
}

.navbar-nav .nav-link {
  font-family: 'Open Sans', sans-serif;
  margin-right: 40px;
  transition: all 0.5s ease; 
}

.navbar-nav .nav-link:hover {
  font-size: 19px;
}


.pfp .profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

@media (max-width: 991px) {
  .navbar-toggler {
    order: 1;
  }

  .nav-logo {
    order: 2;
    text-align: center;
    margin: 0 auto;
  }

  .pfp {
    order: 3;
    justify-content: center;
    margin-top: 10px;
  }
}
</style>
