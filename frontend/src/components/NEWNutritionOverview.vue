<template>
    <canvas class="targetchart" id="overviewchart2" style="width:100%; max-width:800px"></canvas>
</template>

<script>
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { onMounted, ref } from 'vue';

export default {
    setup() {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner'];
        const caloriesData = ref({
            Breakfast: [],
            Lunch: [],
            Dinner: []
        });

        onMounted(async () => {
            const mealdb = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const userDocRef = doc(mealdb, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();

                daysOfWeek.forEach(day => {
                    mealtypes.forEach(meal => {
                        const mealData = userData?.mealPlan?.[day]?.[meal];

                        // Calc T. calories + factor in yield
                        const totalCalories = mealData?.reduce((sum, item) => sum + (item.calories / (item.yield || 1)), 0) || 0;
                        const mealNames = mealData?.map(item => item.label).join(', ') || 'Unnamed Meal';

                        caloriesData.value[meal].push(totalCalories);
                        if (!caloriesData.value.mealNames) caloriesData.value.mealNames = {};
                        if (!caloriesData.value.mealNames[meal]) caloriesData.value.mealNames[meal] = [];
                        caloriesData.value.mealNames[meal].push(mealNames);
                    });
                });

                const ctx = document.getElementById('overviewchart2').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: daysOfWeek,
                        datasets: [
                            {
                                label: 'Breakfast',
                                data: caloriesData.value.Breakfast,
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                mealNames: caloriesData.value.mealNames.Breakfast,
                            },
                            {
                                label: 'Lunch',
                                data: caloriesData.value.Lunch,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderWidth: 1,
                                borderColor: 'rgba(54, 162, 235, 1)',
                                mealNames: caloriesData.value.mealNames.Lunch,
                            },
                            {
                                label: 'Dinner',
                                data: caloriesData.value.Dinner,
                                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 206, 86, 1)',
                                mealNames: caloriesData.value.mealNames.Dinner,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { stacked: true },
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
                            legend: { display: true, position: 'top' },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const datasetLabel = context.dataset.label || 'Unnamed Meal';
                                        const mealName = context.dataset.mealNames[context.dataIndex] || 'Unnamed Meal';
                                        const calories = Math.round(context.raw || 0, 0);
                                        return `${datasetLabel} (${mealName}): ${calories} Calories per serving`;
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


<!-- <template>
    <canvas class="targetchart" id="overviewchart2" style="width:100%; max-width:800px"></canvas>
</template>

<script>
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { onMounted, ref } from 'vue';

export default {
    setup() {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner'];
        const caloriesData = ref({
            Breakfast: [],
            Lunch: [],
            Dinner: []
        });

        onMounted(async () => {
            // Initialize Firebase Firestore and Auth
            const mealdb = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const userDocRef = doc(mealdb, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();

                // Extract and organize calorie data
                daysOfWeek.forEach(day => {
                    mealtypes.forEach(meal => {
                        const calories = userData?.mealPlan?.[day]?.[meal]?.reduce((sum, item) => sum + item.calories, 0) || 0;
                        caloriesData.value[meal].push(calories);
                    });
                });

                // Create the chart
                const ctx = document.getElementById('overviewchart2').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: daysOfWeek,
                        datasets: [
                            {
                                label: 'Breakfast',
                                data: caloriesData.value.Breakfast,
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 99, 132, 1)'
                            },
                            {
                                label: 'Lunch',
                                data: caloriesData.value.Lunch,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderWidth: 1,
                                borderColor: 'rgba(54, 162, 235, 1)'
                            },
                            {
                                label: 'Dinner',
                                data: caloriesData.value.Dinner,
                                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 206, 86, 1)'
                            }
                        ]
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
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        let label = context.dataset.label || '';
                                        let value = context.raw || 0;
                                        return `${label}: ${value} Calories`;
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

<style scoped></style> -->