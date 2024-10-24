<template>
    <div class="container-fluid">
        <h1 class="">Nutritional Overview</h1>
        <div class="container-fluid p-3" id="nutritionoverview">

            <!-- Overview Chart -->
            <div>
                <strong>
                    Overview Chart
                </strong>
            </div>
            <div id="firstchart" class="row">
                <div class="col-lg-6 col-m-12 p-2">
                    <canvas class="targetchart" id="overviewchart" style="width:100%; max-width:1000px"></canvas>
                </div>
                <div class="col-lg-6 d-none d-md-block bg-dark p-2 text-light"> <strong> Another chart will be here </strong></div>
            </div>

            <!-- Start of list -->
            <!-- <div>
                <div v-for="(meals, day) in nutritionData" :key="day">
                    <h2>{{ day.charAt(0).toUpperCase() + day.slice(1) }}</h2>
                    <ul>
                        <li v-for="(mealType, index) in mealtypes" :key="index">
                            <strong>{{ mealType }}:</strong>
                            <ul>
                                <li v-for="(meal, mealIndex) in meals[mealType.toLowerCase()]" :key="mealIndex">
                                    {{ meal.name }}
                                    <ul>
                                        <li>{{ meal.calories }} kcal</li>
                                        <li>{{ meal.protein }} g</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div> -->
            <!-- End of list -->

        </div>
    </div>
</template>


<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { onMounted, ref } from 'vue';

export default {
    setup() {
        const nutritionData = ref({}); // Reactive variable to store nutrition data
        const totalCalories = ref([]); // To store total calories per day

        const fetchNutritionData = async (day) => {
            const mealsCollection = collection(db, `${day}meals`); // Reference to your collection
            const querySnapshot = await getDocs(mealsCollection); // Fetch documents

            // Iterate over the documents and store the data
            nutritionData.value[day] = {
                breakfast: [],
                lunch: [],
                dinner: [],
                supper: []
            }; // Initialize an array for the day

            let dailyCalories = 0;

            querySnapshot.forEach((doc) => {
                const meal = doc.data();
                if (meal.mealType === 'breakfast') {
                    nutritionData.value[day].breakfast.push(meal);
                } else if (meal.mealType === 'lunch') {
                    nutritionData.value[day].lunch.push(meal);
                } else if (meal.mealType === 'dinner') {
                    nutritionData.value[day].dinner.push(meal);
                } else if (meal.mealType === 'supper') {
                    nutritionData.value[day].supper.push(meal); // Store supper separately if needed
                }
                // Accumulate total calories
                dailyCalories += meal.calories;
            });

            // Store total calories for the day
            totalCalories.value.push(dailyCalories);

        };

        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner', 'Supper'];

        // Fetch the data when the component is mounted
        onMounted(() => {
            daysOfWeek.forEach(async (day) => {
                await fetchNutritionData(day);
            });

            // Script for Overview Chart
            const xValues = daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)); // Capitalize day names

            setTimeout(() => {
                const overviewchart = new Chart("overviewchart", {
                    type: "bar",
                    data: {
                        labels: xValues,
                        datasets: [{
                            label: 'Daily Calories',
                            data: totalCalories.value,
                            borderRadius: 5,
                            backgroundColor: "rgba(1, 150, 1, 0.5)",
                            border: "3px"
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: { display: true },
                        title: {
                            display: true,
                            text: ""
                        }
                    }
                });
            }, 300);

        });

        return {
            nutritionData, // Expose the nutrition data to the template
            mealtypes,
            totalCalories
        };
    },
};


</script>

<style scoped>
</style>