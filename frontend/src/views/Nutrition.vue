<template>
    <Navbar />

    <!-- CHARTS -->
    <div class="row m-1">
        <div class="col-lg-1 col-md-1 d-none d-lg-block"></div>
        <div class="col-lg-5 col-md-10 p-1 mx-auto">
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
        <div class="col-lg-5 col-md-10 p-1 mx-auto">
            <div class="m-1 h-100">
                <div id="barcharttext2" class="p-1">
                    <h4 class="text-center pt-2">Calorie Consumed (Meals & Days of the Week)</h4>
                </div>
                <div>
                    <div class="mt-2 p-4 chartbg chart-container">
                        <NEWNutritionOverview />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-1 col-md-1 d-none d-lg-block"></div>
    </div>

    <!-- MEAL PLAN CARD -->
    <div class="row justify-content-center">
        <div class="col-10 col-md-10 col-lg-10 m-4 p-3 mx-auto">
            <MealPlanCard />
        </div>
    </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import MealPlanCard from "@/components/Meal Preferences Components/MealPlanCard.vue";
import NEWNutritionOverview from "@/components/NEWNutritionOverview.vue";
import NEWPolarAreaChart from "@/components/NEWPolarAreaChart.vue";
</script>

<style>
.chart-container {
    overflow: hidden;
    height: 500px;
}

h4 {
    color: rgba(0, 90, 0, 1);
}
</style>