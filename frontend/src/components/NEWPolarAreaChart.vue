<template>
    <canvas class="targetchart" id="overviewchart3" style="width:100%; max-width:800px; max-height:1000px;"></canvas>
</template>

<script>
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { onMounted, ref } from 'vue';

export default {
    setup() {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const caloriesData = ref([]);  // To hold total calories per day

        onMounted(async () => {
            const mealdb = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const userDocRef = doc(mealdb, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();

                // Calculate total daily calories adjusted by yield
                daysOfWeek.forEach(day => {
                    let dailyCalories = 0;
                    
                    ['Breakfast', 'Lunch', 'Dinner'].forEach(meal => {
                        const mealData = userData?.mealPlan?.[day]?.[meal];
                        const totalCalories = mealData?.reduce(
                            (sum, item) => sum + (item.calories / (item.yield || 1)), 
                            0
                        ) || 0;
                        dailyCalories += totalCalories;
                    });
                    caloriesData.value.push(Math.round(dailyCalories)); // Rounded value per day
                });

                // Create polar area chart
                const ctx = document.getElementById('overviewchart3').getContext('2d');
                new Chart(ctx, {
                    type: 'polarArea',
                    data: {
                        labels: daysOfWeek, // Each day as a label
                        datasets: [
                            {
                                label: 'Calories per Day (adjusted by yield)',
                                data: caloriesData.value, // Data points for each day
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.5)',
                                    'rgba(54, 162, 235, 0.5)',
                                    'rgba(255, 206, 86, 0.5)',
                                    'rgba(75, 192, 192, 0.5)',
                                    'rgba(153, 102, 255, 0.5)',
                                    'rgba(255, 159, 64, 0.5)',
                                    'rgba(100, 181, 246, 0.5)'
                                ],
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const day = context.label || '';
                                        const calories = context.raw || 0;
                                        return `${day}: ${calories} Calories`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });

        return {
            caloriesData
        };
    },
};
</script>

<style scoped></style>