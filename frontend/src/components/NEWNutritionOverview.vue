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

<template>
    <div>
        <label for="portion-input">Enter the number of portions:</label>
        <input id="portion-input" v-model="numPortions" type="number" min="1" placeholder="e.g., 1" @input="updateCaloriesPerPortion"/>
        <canvas class="targetchart" id="overviewchart2" style="width:100%; max-width:800px"></canvas>
    </div>
</template>

<script>
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onMounted, ref, watch } from 'vue';

export default {
    setup() {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner'];
        const caloriesData = ref({
            Breakfast: [],
            Lunch: [],
            Dinner: []
        });
        const numPortions = ref(1); // Reactive variable for portions
        let chartInstance = null; // Chart instance to enable updates

        const updateCaloriesPerPortion = () => {
            // Update chart data to show per portion calories
            if (chartInstance) {
                chartInstance.data.datasets.forEach((dataset, index) => {
                    const mealType = mealtypes[index];
                    dataset.data = caloriesData.value[mealType].map(calories => (calories / numPortions.value).toFixed(2));
                });
                chartInstance.update();
            }
        };

        onMounted(() => {
            const mealdb = getFirestore();
            const auth = getAuth();

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userDocRef = doc(mealdb, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        daysOfWeek.forEach(day => {
                            mealtypes.forEach(meal => {
                                const calories = userData?.mealPlan?.[day]?.[meal]?.reduce((sum, item) => sum + item.calories, 0) || 0;
                                caloriesData.value[meal].push(calories);
                            });
                        });

                        // Create the chart
                        const ctx = document.getElementById('overviewchart2').getContext('2d');
                        chartInstance = new Chart(ctx, {
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
                                maintainAspectRatio: true,
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
                        // Watch for changes in portions and update chart
                        watch(numPortions, updateCaloriesPerPortion);
                    }
                }
            });
        });

        return {
            caloriesData,
            numPortions,
            updateCaloriesPerPortion
        };
    },
};
</script>

<style scoped></style>