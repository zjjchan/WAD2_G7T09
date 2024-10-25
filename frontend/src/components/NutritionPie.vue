<template>
    <!-- <div class="container-fluid"> -->
        <!-- <div class="container-fluid p-3" id="nutritionoverview"> -->
            <!-- <div id="polarAreaChartWrapper" class="row"> -->
                <canvas id="polarAreaChart" style="width:100%; max-width:800px; max-height: 00px"></canvas>
            <!-- </div> -->
        <!-- </div> -->
    <!-- </div> -->
</template>

<script>
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto'; // Import Chart.js

export default {
    setup() {
        const totalCalories = ref([]);

        const fetchNutritionData = async (day) => {
            const mealsCollection = collection(db, `${day}meals`);
            const querySnapshot = await getDocs(mealsCollection);

            let dailyCalories = 0;
            querySnapshot.forEach((doc) => {
                const meal = doc.data();
                dailyCalories += meal.calories;
            });

            totalCalories.value.push(dailyCalories);
        };

        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        onMounted(async () => {
            for (const day of daysOfWeek) {
                await fetchNutritionData(day);
            }

            // Chart data for the Polar Area chart
            const xValues = daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)); // Capitalize day names
            const polarAreaColors = [
                "rgba(255, 99, 132, 0.5)",  // Red, 50% opacity
                "rgba(54, 162, 235, 0.5)",  // Blue, 
                "rgba(255, 206, 86, 0.5)",  // Yellow, 
                "rgba(75, 192, 192, 0.5)",  // Green, 
                "rgba(153, 102, 255, 0.5)", // Purple
                "rgba(255, 159, 64, 0.5)",  // Orange
                "rgba(255, 99, 102, 0.5)"   // other
            ];


            // Create the Polar Area Chart
            new Chart(document.getElementById('polarAreaChart'), {
                type: 'polarArea',
                data: {
                    labels: xValues,
                    datasets: [{
                        label: 'Calories per Day',
                        data: totalCalories.value,
                        backgroundColor: polarAreaColors,
                        borderWidth: 1,
                        borderColor: "#fff"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Total Calories per Day for the Week'
                        }
                    }
                }
            });
        });

        return {
            totalCalories
        };
    }
};
</script>

<style scoped></style>