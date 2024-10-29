<template>
    <canvas id="polarAreaChart" style="width:100%; max-width:800px; max-height: 500px"></canvas>
</template>

<script>
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onMounted, ref } from 'vue';

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

            // data for Polar Area chart
            const xValues = daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)); // Capitalize day names
            const polarAreaColors = [
                "rgba(50, 50, 255, 0.5)",
                "rgba(54, 162, 200, 0.5)",
                "rgba(0, 185, 0, 0.5)",
                "rgba(100, 190, 150, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(255, 159, 64, 0.5)",
                "rgba(255, 99, 102, 0.5)"
            ];

            // Polar Area Chart
            new Chart(document.getElementById('polarAreaChart'), {
                type: 'polarArea',
                data: {
                    labels: xValues,
                    datasets: [{
                        label: 'Calories per Day',
                        data: totalCalories.value,
                        backgroundColor: polarAreaColors,
                        borderWidth: 0.75,
                        borderColor: "grey"
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
                            display: false
                            // text: 'Total Calories per Day for the Week'
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