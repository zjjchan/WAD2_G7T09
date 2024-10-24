<template>
    <div class="container-fluid">
        <h1 class="">Nutritional Overview</h1>
        <div class="container-fluid p-3" id="nutritionoverview">

            <!-- Overview Chart -->
            <div>Chart</div>
            <canvas id="overviewchart" style="width:100%;max-width:700px"></canvas>

            <br>
            <!-- Start of list -->
            <div>
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
            </div>
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
            });

        };

        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner', 'Supper'];

        // Fetch the data when the component is mounted
        onMounted(() => {
            daysOfWeek.forEach(day => {
                fetchNutritionData(day);
            });

            // Script for Overview Chart
            let xValues = ["Italy", "France", "Spain", "USA"];
            let yValues = [55, 49, 44, 24];
            let barColors = ["red", "green", "blue", "orange", "brown"];

            const overviewchart = new Chart("overviewchart", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [{
                        backgroundColor: barColors,
                        data: yValues
                    }]
                },
                options: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: "Nutrional Overview"
                    }
                }
            });
        });

        return {
            nutritionData, // Expose the nutrition data to the template
            mealtypes
        };
    },
};


</script>

<style></style>