<template>
    <div>
      <h3>Macronutrient Breakdown</h3>
      <PieChart v-if="macronutrientData" :chartData="macronutrientData" />
    </div>
  </template>
  
  <script setup>
  
  // Define properties that will be passed from the parent component
  const props = defineProps({
    recipe: {
      type: Object,
      required: true,
    }
  });
  
  // Prepare the data for the pie chart
  const macronutrientData = {
    labels: ['Fats', 'Carbs', 'Proteins'],
    datasets: [
      {
        label: 'Macronutrients',
        data: [
          props.recipe.digest.find(n => n.label === 'Fat').total,
          props.recipe.digest.find(n => n.label === 'Carbohydrate').total,
          props.recipe.digest.find(n => n.label === 'Protein').total,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Red for Fats
          'rgba(54, 162, 235, 0.6)', // Blue for Carbs
          'rgba(75, 192, 192, 0.6)'  // Green for Proteins
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };
  </script>
  
  <script>
  export default {
    components: {
      PieChart: Pie
    },
    props: {
      recipe: {
        type: Object,
        required: true,
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any custom styles here */
  </style>  