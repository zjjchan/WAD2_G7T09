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
            <div>
                <canvas class="targetchart" id="overviewchart" style="width:100%; max-width:1000px"></canvas>
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

        // Fetch the data when component is mounted
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
                        datasets: [
                            {
                                label: 'Breakfast',
                                data: daysOfWeek.map(day => nutritionData.value[day].breakfast.reduce((sum, meal) => sum + meal.calories, 0)),
                                backgroundColor: "rgba(255, 99, 132, 0.5)",
                                borderWidth: 1,
                                borderColor: "grey"
                            },
                            {
                                label: 'Lunch',
                                data: daysOfWeek.map(day => nutritionData.value[day].lunch.reduce((sum, meal) => sum + meal.calories, 0)),
                                backgroundColor: "rgba(54, 162, 235, 0.5)",
                                borderWidth: 1,
                                borderColor: "grey"
                            },
                            {
                                label: 'Dinner',
                                data: daysOfWeek.map(day => nutritionData.value[day].dinner.reduce((sum, meal) => sum + meal.calories, 0)),
                                backgroundColor: "rgba(255, 206, 86, 0.5)",
                                borderWidth: 1,
                                borderColor: "grey"
                            },
                            {
                                label: 'Supper',
                                data: daysOfWeek.map(day => nutritionData.value[day].supper.reduce((sum, meal) => sum + meal.calories, 0)),
                                backgroundColor: "rgba(75, 192, 192, 0.5)",
                                borderWidth: 1,
                                borderColor: "grey"
                            }
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true,
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Calories'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: 'Calorie Breakdown per Meal'
                            }
                        }
                    }
                });
            }, 300);

        });

        return {
            nutritionData, // Expose nutrition data to template
            mealtypes,
            totalCalories
        };
    },
};


</script>

<style scoped></style>