<script setup>
import { RouterLink, useRoute } from 'vue-router';
import profilepic from '@/assets/images/profilepic.png'

defineProps({
    user: String
});

const route = useRoute();

const isActiveLink = (routePath) => {
    return route.path === routePath;
}
</script>

<template>
    <nav class="main-navbar navbar sticky-top navbar-expand-lg navbar-light">
        <div class="main-nav-items container-fluid col-11">
            <!-- Navbar brand -->
            <RouterLink to="/" class="nav-logo lily-script-one-regular navbar-brand text-light col col-lg-1 order-lg-0 order-1 text-lg-start text-center">
                Mealmate
            </RouterLink>
            <!-- Navbar toggle button -->
            <button class="main-navbar-toggler navbar-toggler col-1 col-lg-10 order-lg-1 order-0" 
                    type="button" 
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#sidebar"
                    aria-controls="sidebar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <!-- Top menu in navbar -->
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
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
        <div class="pfp col-1 d-flex justify-content-end">
            <div class="dropdown">
                <button class="btn border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img :src="profilepic" alt="Profile Picture">
                </button>
                <ul class="dropdown-menu">
                    <li><RouterLink to="/profile" class="dropdown-item">My Profile</RouterLink></li>
                    <li><RouterLink to="/meal-preferences" class="dropdown-item">Meal Preferences</RouterLink></li>
                    <li><RouterLink to="/profile-settings" class="dropdown-item">Profile Settings</RouterLink></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Sidebar Setup -->
    <div class="main-sidebar offcanvas offcanvas-start" 
         tabindex="-1" id="sidebar">
        <div class="offcanvas-header">
            <button type="button" 
                    class="btn-close text-reset" 
                    data-bs-dismiss="offcanvas"
                    aria-label="Close">
            </button>
        </div>
        <div class="offcanvas-body">
            <ul class="navbar-nav" data-bs-dismiss="offcanvas" >
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