<template>
  <div>
    <canvas id="nutritionChart" style="width:100%; max-width:800px; max-height:800px;"></canvas>
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
    const nutritionData = ref(null);

    const createImage = (src, callback) => {
      const img = new Image();
      img.src = src;
      img.onload = () => callback(img);
    };

    onMounted(() => {
      if (props.recipe) {
        const fat = props.recipe.digest.find(nutrient => nutrient.label === 'Fat')?.total || 0;
        const protein = props.recipe.digest.find(nutrient => nutrient.label === 'Protein')?.total || 0;
        const carbsData = props.recipe.digest.find(nutrient => nutrient.label === 'Carbs');
        const carbs = carbsData?.total || 0;
        const sugars = carbsData?.sub?.find(sub => sub.label === 'Sugars')?.total || 0;
        const fibre = carbsData?.sub?.find(sub => sub.label === 'Fiber')?.total || 0;

        nutritionData.value = {
          labels: ['Fats', 'Protein', 'Carbohydrates', 'Sugars', 'Fibre'],
          datasets: [{
            label: 'Nutritional Composition',
            data: [fat, protein, carbs, sugars, fibre],
            backgroundColor: [
              'rgba(255, 206, 10, 0.5)',
              'rgba(255, 0, 80, 0.5)',
              'rgba(184, 125, 0, 0.5)',
              'rgba(0, 100, 255, 0.5)',
              'rgba(0, 150, 0, 0.5)',
            ],
            borderWidth: 1.5
          }],
        };

        const ctx = document.getElementById('nutritionChart').getContext('2d');

        // Load and set the background image
        // createImage('../src/assets/images/nutrients3.png', (img) => {
        //   ctx.canvas.style.backgroundImage = `url('${img.src}')`;
        //   ctx.canvas.style.backgroundSize = '25%';
        //   ctx.canvas.style.backgroundRepeat = 'no-repeat';
        //   ctx.canvas.style.backgroundPosition = '50% 67%';

          // Create the chart after setting the background
          new Chart(ctx, {
            type: 'doughnut',
            data: nutritionData.value,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const label = tooltipItem.label || '';
                      const value = tooltipItem.raw || 0;
                      return `${label}: ${value.toFixed(2)} g`;
                    },
                  },
                },
              },
            },
          });
//        });
      }
    });

    return {
      nutritionData,
    };
  },
};
</script>

<style scoped>

</style>