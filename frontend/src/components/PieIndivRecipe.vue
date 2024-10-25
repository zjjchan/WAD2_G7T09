<template>
  <div>
    <h3>Nutritional Distribution</h3>
    <canvas id="nutritionChart" style="width:100%; max-width:600px; max-height:400px;"></canvas>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { Chart } from 'chart.js'; // Ensure Chart.js is imported if it's not globally available

export default {
  props: {
    recipe: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const nutritionData = ref(null);

    // Use onMounted to create the chart after the component is mounted
    onMounted(() => {
      if (props.recipe) {
        // Extracting the values for fat, protein, carbs, ... from recipe
        const fat = props.recipe.digest.find(nutrient => nutrient.label === 'Fat')?.total || 0;
        const protein = props.recipe.digest.find(nutrient => nutrient.label === 'Protein')?.total || 0;
        const carbs = props.recipe.digest.find(nutrient => nutrient.label === 'Carbs')?.total || 0;


        // Prepare data for the donut chart
        nutritionData.value = {
          labels: ['Fats', 'Protein', 'Carbohydrates'],
          datasets: [{
            label: 'Nutritional Composition',
            data: [fat, protein, carbs],
            backgroundColor: [
              'rgba(255, 206, 86, 0.5)', // Fat color
              'rgba(255, 99, 132, 0.5)', // Protein color
              'rgba(184, 125, 0, 0.5)', // Carbs color
            ],
            borderWidth: 1.5
          }],
        };

        // Create the donut chart
        const ctx = document.getElementById('nutritionChart').getContext('2d');
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: nutritionData.value,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Nutritional Distribution',
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const label = tooltipItem.label || '';
                    const value = tooltipItem.raw || 0; // Get the value of the data point
                    return `${label}: ${value.toFixed(2)} g`; // Format with units
                  },
                },
              },
            },
          },
        });
      }
    });

    return {
      nutritionData,
    };
  },
};
</script>


<style scoped></style>
