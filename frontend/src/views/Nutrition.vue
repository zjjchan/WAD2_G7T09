<template>
    <Navbar />
    <div class="m-4">
        <MealPlanCard />
    </div>
    <div class="row m-2">
        <div class="col-lg-6 col-md-12 p-1">
            <div class="m-2 h-100">
                <div id="barcharttext" class="p-1 border rounded">
                    <h4 id="" class="text-center pt-2">Calorie Consumption for the Week</h4>
                </div>
                <div>
                    <div class="p-3 chartbg">
                        <NutritionOverview />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-md-12 p-1">
            <div class="m-2 h-100">
                <div id="piecharttext" class="p-1 border rounded">
                    <h4 class="text-center pt-2">Calories Consumed each Day of the Week</h4>
                </div>
                <div>
                    <div id="piechart" class="p-3 chartbg">
                        <NutritionPie />
                    </div>
                </div>
            </div>
        </div>
    </div>


</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import MealPlanCard from "@/components/Meal Preferences Components/MealPlanCard.vue";
import NutritionOverview from "@/components/NutritionOverview.vue";
</script>

<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import NutritionPie from "@/components/NutritionPie.vue";

</script>


<style>
#barcharttext,
#piecharttext {
    background-color: rgba(0, 135, 0, 0.5);
}

/* .chartbg {
        background-color: lightgray;
    } */
/* #barchart, #piechart {
        background-image: linear-gradient(gray, lightgray);
    }; */
</style>