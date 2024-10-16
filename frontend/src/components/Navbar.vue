<script setup>
import { RouterLink, useRoute } from 'vue-router';
import profilepic from '@/assets/images/profilepic.png'

defineProps({
    user: String
});

const isActiveLink = (routepath) => {
    const route = useRoute();
    return route.path === routepath;
}

</script>

<template>
    <nav class="main-navbar navbar sticky-top navbar-expand-lg navbar-light">
        <div class="container-fluid col-11">
            <!-- Navbar brand -->
            <a class="lily-script-one-regular navbar-brand text-light" href="#">
                Mealmate
            </a>
            <!-- Navbar toggle button -->
            <button class="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#sidebar"
                aria-controls="sidebar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <!-- Top menu in navbar -->
            <div class="collapse navbar-collapse" 
                id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active text-light" 
                        aria-current="page" href="#">
                            Recipes
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-light" href="#">
                            Grocery List
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-light" href="#">
                            Nutrition
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class=" pfp col-1 d-flex justify-content-center">
            <div class="btn-group dropstart">
                <button class="btn border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img :src="profilepic">
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">My Profile</a></li>
                    <li><a class="dropdown-item" href="#">Meal Preferences</a></li>
                    <li><a class="dropdown-item" href="#">Profile Settings</a></li>
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
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link text-light" href="#">
                        Recipes
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-light" href="#">
                        Grocery List
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-light" href="#">
                        Nutrition
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>