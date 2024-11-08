<template>
    <div>
        <canvas v-if="hasData" class="targetchart" id="overviewchart3"
            style="width:100%; max-width:100%; max-height:450px;"></canvas>
        <p v-else class="placeholder-text">Nothing has been added to your Meal Planner yet.
            <br>
            <br>
            Please add your meals to view your calorie consumption for each day and meal of the week.
        </p>
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
                                        "rgba(50, 50, 255, 0.5)",
                                        "rgba(54, 162, 200, 0.5)",
                                        "rgba(0, 185, 0, 0.5)",
                                        "rgba(100, 190, 150, 0.5)",
                                        "rgba(255, 206, 86, 0.5)",
                                        "rgba(255, 159, 64, 0.5)",
                                        "rgba(255, 99, 102, 0.5)"
                                    ],
                                    borderWidth: 0
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
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
                                            return `${day}: ${Math.round(calories)} Calories consumed`;
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