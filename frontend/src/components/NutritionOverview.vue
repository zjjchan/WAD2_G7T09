<template>
    <!-- <div class="container-fluid">
        <div class="container-fluid p-3" id="nutritionoverview"> -->

            <!-- Overview Chart -->
            <!-- <div> -->
                <canvas class="targetchart" id="overviewchart" style="width:100%; max-width:800px"></canvas>
            <!-- </div> -->

        <!-- </div>
    </div> -->
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
        onMounted(async () => {
            await Promise.all(daysOfWeek.map(day => fetchNutritionData(day)));
            // daysOfWeek.forEach(async (day) => {
            //     await fetchNutritionData(day);
            // });

            // Script for Overview Chart
            const xValues = daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)); // Capitalize day names

            const overviewchart = new Chart("overviewchart", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [
                        {
                            label: `Breakfast`,
                            data: daysOfWeek.map(day => nutritionData.value[day].breakfast.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].breakfast.map(meal => meal.name).join(', '))
                        },
                        {
                            label: 'Lunch',
                            data: daysOfWeek.map(day => nutritionData.value[day].lunch.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(54, 162, 235, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].lunch.map(meal => meal.name).join(', '))
                        },
                        {
                            label: 'Dinner',
                            data: daysOfWeek.map(day => nutritionData.value[day].dinner.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(255, 206, 86, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].dinner.map(meal => meal.name).join(', '))
                        },
                        {
                            label: 'Supper',
                            data: daysOfWeek.map(day => nutritionData.value[day].supper.reduce((sum, meal) => sum + meal.calories, 0)),
                            backgroundColor: "rgba(75, 192, 192, 0.5)",
                            borderWidth: 1,
                            // borderColor: "grey",
                            mealNames: daysOfWeek.map(day => nutritionData.value[day].supper.map(meal => meal.name).join(', '))
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
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    // Access the current dataset and its label
                                    let datasetLabel = context.dataset.label || '';
                                    // Get the meal name from the mealNames array
                                    let mealName = context.dataset.mealNames[context.dataIndex] || 'Un-named Meal';
                                    // Get the calories value from the data point
                                    let calories = context.raw || 0;
                                    // Return the custom label text for tooltip
                                    return `${datasetLabel} (${mealName}): ${calories} Calories`;
                                }
                            }
                        },
                        // afterDatasetsDraw: (chart) => {
                        //     const { ctx, scales: { x, y } } = chart;
                        //     chart.data.labels.forEach((label, index) => {
                        //         const datasets = chart.data.datasets;
                        //         let totalCalories = 0;

                        //         // Sum up the calories from all datasets for this index
                        //         chart.data.datasets.forEach((dataset) => {
                        //             totalCalories += dataset.data[index];
                        //         });

                        //         // Draw the total calories label
                        //         const barCenterX = x.getPixelForValue(index); // X-coordinate of the center of the bar
                        //         const barTopY = y.getPixelForValue(totalCalories); // Y-coordinate for the top of the stacked bar

                        //         ctx.save();
                        //         ctx.textAlign = 'center';
                        //         ctx.font = 'bold 15px Arial';
                        //         ctx.fillStyle = '#000'; // Color of the text
                        //         ctx.fillText(`${totalCalories}`, barCenterX, barTopY - 5); // Display the total value above the bar
                        //         ctx.restore();
                        //     });
                        // }
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