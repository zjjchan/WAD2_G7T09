<template>
    <canvas class="targetchart" id="overviewchart" style="width:100%; max-width:800px"></canvas>
</template>


<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { onMounted, ref } from 'vue';
// import { Chart } from 'chart.js'; DO NOT UNCOMMENT

export default {
    setup() {
        const nutritionData = ref({}); // Reactive variable to store nutrition data
        const totalCalories = ref([]); // storing total calories per day

        const fetchNutritionData = async (day) => {
            const mealsCollection = collection(db, `${day}meals`); // Referencing collection
            const querySnapshot = await getDocs(mealsCollection); // Fetch documents

            // Iterate over documents and store data
            nutritionData.value[day] = {
                breakfast: [],
                lunch: [],
                dinner: [],
                supper: []
            }; // Initialise array for the day

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
                    nutritionData.value[day].supper.push(meal);
                }
            });

        };

        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner', 'Supper'];

        // Fetch data when component is mounted
        onMounted(async () => {
            await Promise.all(daysOfWeek.map(day => fetchNutritionData(day)));

            // Script for Overview Chart
            const xValues = daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)); // Capitalising names of each day

            const overviewchart = new Chart("overviewchart", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [
                        {
                            label: `Breakfast`,
                            data: daysOfWeek.map(day => nutritionData.value[day].breakfast.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(255, 171, 0, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].breakfast.map(meal => meal.name).join(', '))
                        },
                        {
                            label: 'Lunch',
                            data: daysOfWeek.map(day => nutritionData.value[day].lunch.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(0, 135, 0, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].lunch.map(meal => meal.name).join(', '))
                        },
                        {
                            label: 'Dinner',
                            data: daysOfWeek.map(day => nutritionData.value[day].dinner.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(54, 150, 255, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].dinner.map(meal => meal.name).join(', '))
                        },
                        {
                            label: 'Supper',
                            data: daysOfWeek.map(day => nutritionData.value[day].supper.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(0, 81, 121, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].supper.map(meal => meal.name).join(', '))
                        },
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
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    // Access the current dataset and its label
                                    let datasetLabel = context.dataset.label || '';
                                    // Get the meal name from the mealNames array
                                    let mealName = context.dataset.mealNames[context.dataIndex] || 'Unclassified Meal';
                                    // Get the calories value from the data point
                                    let calories = context.raw || 0;
                                    // Return the custom label text for tooltip
                                    return `${datasetLabel} (${mealName}): ${calories} Calories`;
                                }
                            }
                        },
                    }
                }
            });
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