<template>
    <Navbar />

    <!-- CHARTS -->
    <div class="row m-1">
        <div class="col-lg-1 col-md-1 col-1"></div>
        <div class="col-lg-5 col-md-10 p-1">
            <div class="m-1 h-100">
                <div id="piecharttext2" class="p-1">
                    <h4 class="text-center pt-2">Calories Consumed (Days of the Week)</h4>
                </div>
                <div>
                    <div id="piechart" class="mt-2 p-4 chartbg chart-container">
                        <NEWPolarAreaChart />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-5 col-md-10 p-1">
            <div class="m-1 h-100">
                <div id="barcharttext2" class="p-1">
                    <h4 id="" class="text-center pt-2">Calorie Consumed (Meals & Days of the Week)</h4>
                </div>
                <div>
                    <div class="mt-2 p-4 chartbg chart-container">
                        <NEWNutritionOverview />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-1 col-md-1 col-1"></div>
    </div>

    <div class="row">
        <div class="col-1"></div>
        <div class="col-10 m-4 p-3 ">
            <MealPlanCard />
        </div>
        <div class="col-1"></div>
    </div>


</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import MealPlanCard from "@/components/Meal Preferences Components/MealPlanCard.vue";
import NutritionOverview from "@/components/NutritionOverview.vue";
import NEWNutritionOverview from "@/components/NEWNutritionOverview.vue";
import NEWPolarAreaChart from "@/components/NEWPolarAreaChart.vue";
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
    overflow: hidden;
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