<template>
    <Navbar />
    <MealPlanCard />
    <NutritionOverview />
    <NutritionPie />
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import MealPlanCard from "@/components/MealPlanCard.vue";
import NutritionOverview from "@/components/NutritionOverview.vue";
</script>

<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import NutritionPie from "@/components/NutritionPie.vue";

</script>


<style></style>