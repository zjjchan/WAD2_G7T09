<template>
    <Navbar />
    <div class="m-4">
        <MealPlanCard />
    </div>
    <div class="row m-2">
        <div class="col-lg-6 col-md-12 p-2">
            <div class=" border rounded m-2 h-100">
                <h2 class="text-center pt-2">Calories Composition Overview</h2>
                <div class="p-3">
                    <NutritionOverview />
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-md-12 p-2">
            <div class=" border rounded m-2 h-100">
                <h2 class="text-center pt-2">Total Calories Consumed each Day</h2>
                <div class="p-3">
                    <NutritionPie />
                </div>
            </div>
        </div>
    </div>


</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import MealPlanCard from "@/components/Homepage Components/MealPlanCard.vue";
import NutritionOverview from "@/components/NutritionOverview.vue";
</script>

<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import NutritionPie from "@/components/NutritionPie.vue";

</script>


<style></style>