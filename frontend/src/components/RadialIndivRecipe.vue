<template>
    <div>
        <canvas id="fatRadarChart" style="width:100%; max-width:800px; max-height:800px;"></canvas>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
    props: {
        recipe: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const fatSubData = ref(null);

        onMounted(() => {
            if (props.recipe) {
                // Extract sub-categories of fat
                const fatData = props.recipe.digest.find(nutrient => nutrient.label === 'Fat');
                if (fatData && fatData.sub) {
                    const labels = fatData.sub.map(sub => sub.label);
                    const values = fatData.sub.map(sub => sub.total);
                    const unit = fatData.sub[0]?.unit || "g";

                    // Prepare data for radar chart
                    fatSubData.value = {
                        labels: labels,
                        datasets: [{
                            label: 'Fat',
                            data: values,
                            backgroundColor: 'rgba(245, 201, 5, 0.7)',
                            borderColor: 'rgba(245, 201, 5, 1)',
                            pointBackgroundColor: 'rgba(245, 201, 5, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(245, 201, 5, 1)',
                            borderWidth: 1,
                        }],
                    };

                    // Get canvas context and set background image style
                    const canvas = document.getElementById('fatRadarChart');
                    const ctx = canvas.getContext('2d');

                    // Setting background image
                    canvas.style.backgroundImage =
                        "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.1)), url('../src/assets/images/xxx.png')";
                    canvas.style.backgroundSize = '40%';
                    canvas.style.backgroundRepeat = 'no-repeat';
                    canvas.style.backgroundPosition = '70% 55%';

                    // Create the radar chart with improved layout
                    new Chart(ctx, {
                        type: 'radar',
                        data: fatSubData.value,
                        options: {
                            responsive: true,
                            scales: {
                                r: {
                                    beginAtZero: true,
                                    ticks: {
                                        display: true,
                                        backdropColor: 'transparent', // Removes the background behind tick labels
                                        color: 'rgba(0, 0, 0, 1)', // Set tick color for better visibility
                                        font: {
                                            size: 10, // Reduce font size for better spacing
                                        },
                                        // stepSize: 1, // Control the interval of the ticks
                                    },
                                    pointLabels: {
                                        font: {
                                            size: 15, // Adjust label font size to prevent overlap
                                        },
                                        padding: 15, // Increase padding to space out labels
                                    },
                                },
                            },
                            layout: {
                                padding: {
                                    top: 20,
                                    bottom: 20,
                                    left: 20,
                                    right: 20,
                                },
                            },
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (tooltipItem) {
                                            const label = tooltipItem.label || '';
                                            const value = tooltipItem.raw || 0;
                                            return `${label}: ${value.toFixed(2)} ${unit}`; // Show unit in tooltip
                                        }
                                    }
                                }
                            },
                        },
                    });
                }
            }
        });

        return {
            fatSubData,
        };
    },
};
</script>
