<template>
    <div>
        <canvas id="fatRadarChart" style="width:100%; max-width:800px; max-height:800px;"></canvas>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
// import { Chart } from 'chart.js'; MUST NOT INCLUDE CODE WILL NOT WORK

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
                            backgroundColor: 'rgba(245, 201, 5, 0.5)',
                            borderColor: 'rgba(245, 201, 5, 1)',
                            pointBackgroundColor: 'rgba(245, 201, 5, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(245, 201, 5, 1)',
                            borderWidth: 1,
                        }],
                    };

                    // Create the radar chart
                    const ctx = document.getElementById('fatRadarChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'radar',
                        data: fatSubData.value,
                        options: {
                            responsive: true,
                            scales: {
                                r: {
                                    beginAtZero: true,
                                },
                            },
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false,
                                    // text: 'Fat Sub-categories Distribution',
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