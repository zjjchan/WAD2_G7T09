<template>
    <div>
        <canvas v-if="hasData" class="targetchart" id="overviewchart3" style="width:100%; max-width:800px; max-height:1000px;"></canvas>
        <p v-else class="placeholder-text">No data available. Please add meal data to view the chart.</p>
    </div>
</template>

<script>
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { onMounted, ref } from 'vue';

export default {
    setup() {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const caloriesData = ref([]);  // To hold total calories per day
        const hasData = ref(true); // Flag to indicate if mealPlan data exists

        onMounted(async () => {
            const mealdb = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const userDocRef = doc(mealdb, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();

                // Check if mealPlan exists in userData
                if (userData?.mealPlan) {
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
                            labels: daysOfWeek,
                            datasets: [
                                {
                                    label: 'Calories per Day (adjusted by yield)',
                                    data: caloriesData.value,
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
                            responsive: false,
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
                                            return `${day}: ${Math.round(calories)} Calories`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                } else {
                    hasData.value = false; // No mealPlan data, show placeholder
                }
            }
        });

        return {
            caloriesData,
            hasData
        };
    },
};
</script>

<style scoped>
.placeholder-text {
    text-align: center;
    color: grey;
    font-size: 18px;
    margin-top: 20px;
}
</style>