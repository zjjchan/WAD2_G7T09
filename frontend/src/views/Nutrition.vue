<template>
    <Navbar />
    <div class="m-4 p-3 border rounded" style="background-color: #DAE2BC;">
        <MealPlanCard />
    </div>
    <div class="row m-1">
        <div class="col-lg-6 col-md-12 p-1">
            <div class="m-1 h-100">
                <div id="piecharttext" class="p-1">
                    <h4 class="text-center pt-2">Calories Consumed each Day of the Week</h4>
                </div>
                <div>
                    <div id="piechart" class="mt-2 p-4 chartbg border rounded border-2 chart-container">
                        <NutritionPie />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-md-12 p-1">
            <div class="m-1 h-100">
                <div id="barcharttext" class="p-1">
                    <h4 id="" class="text-center pt-2">Calorie Consumption for the Week</h4>
                </div>
                <div>
                    <div class="mt-2 p-4 chartbg border rounded border-2 chart-container">
                        <NutritionOverview />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div>
        <NEWNutritionOverview />
    </div>


</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import MealPlanCard from "@/components/Meal Preferences Components/MealPlanCard.vue";
import NutritionOverview from "@/components/NutritionOverview.vue";
import NEWNutritionOverview from "@/components/NEWNutritionOverview.vue";
</script>

<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import NutritionPie from "@/components/NutritionPie.vue";

</script>


<style>
/* #barcharttext,
#piecharttext {
    background-color: rgba(0, 135, 0, 0.5);
} */



.chart-container {
    height: 500px;
}
h4 {
    color: rgba(0, 90, 0, 1);
}
/* .chartbg {
        background-color: lightgray;
    } */
/* #barchart, #piechart {
        background-image: linear-gradient(gray, lightgray);
    }; */
</style>