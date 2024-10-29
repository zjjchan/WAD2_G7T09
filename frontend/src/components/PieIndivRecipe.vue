<template>
  <div>
    <canvas id="nutritionChart" style="width:100%; max-width:800px; max-height:800px;"></canvas>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
// import { Chart } from 'chart.js';  MUST NOT INCLUDE CODE WILL NOT WORK

export default {
  props: {
    recipe: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const nutritionData = ref(null);

    onMounted(() => {
      if (props.recipe) {
        // Extract the main values for fat, protein, and carbs
        const fat = props.recipe.digest.find(nutrient => nutrient.label === 'Fat')?.total || 0;
        const protein = props.recipe.digest.find(nutrient => nutrient.label === 'Protein')?.total || 0;
        const carbsData = props.recipe.digest.find(nutrient => nutrient.label === 'Carbs');
        const carbs = carbsData?.total || 0;

        // Extract subcategories for carbs: Sugars and Fibre
        const sugars = carbsData?.sub?.find(sub => sub.label === 'Sugars')?.total || 0;
        const fibre = carbsData?.sub?.find(sub => sub.label === 'Fiber')?.total || 0;

        // Prepare data for the donut chart with subcategories of carbs included
        nutritionData.value = {
          labels: ['Fats', 'Protein', 'Carbohydrates', 'Sugars', 'Fibre'],
          datasets: [{
            label: 'Nutritional Composition',
            data: [fat, protein, carbs, sugars, fibre],
            backgroundColor: [
              'rgba(255, 206, 86, 0.5)', // Fat colour
              'rgba(255, 99, 132, 0.5)', // Protein colour
              'rgba(184, 125, 0, 0.5)', // Carbs colour
              'rgba(153, 102, 255, 0.5)', // Sugars colour
              'rgba(75, 192, 192, 0.5)', // Fibre colour
            ],
            borderWidth: 1.5
          }],
        };

        // Create doughnut chart
        const ctx = document.getElementById('nutritionChart').getContext('2d');
        new Chart(ctx, {
          type: 'doughnut',
          data: nutritionData.value,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: false,
                // text: 'Nutritional Distribution',
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const label = tooltipItem.label || '';
                    const value = tooltipItem.raw || 0;
                    return `${label}: ${value.toFixed(2)} g`; // Units
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