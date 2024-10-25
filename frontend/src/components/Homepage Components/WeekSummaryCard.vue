<template>
<h2>your nutritional summary</h2>
          <div class="nutrition-grid">
            <div class="nutrition-data">
              <div class="nutrition-item">
                <span>calories</span>
                <span>200g</span>
              </div>
              <div class="nutrition-item">
                <span>fat</span>
                <span>50g</span>
              </div>
              <div class="nutrition-item">
                <span>sodium</span>
                <span>100g</span>
              </div>
            </div>
            <div class="nutrition-data">
              <div class="nutrition-item">
                <span>carbohydrates</span>
                <span>500g</span>
              </div>
              <div class="nutrition-item">
                <span>fibre</span>
                <span>50g</span>
              </div>
              <div class="nutrition-item">
                <span>sugar</span>
                <span>100g</span>
              </div>
            </div>
            <div class="nutrition-chart">
              <!-- Placeholder for chart -->
              <div class="chart-placeholder"></div>
            </div>
          </div>
</template>


<style>
.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.nutrition-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  color: #4A5240;
}

.chart-placeholder {
  width: 100%;
  height: 12rem;
  background-color: white;
  border-radius: 0.5rem;
}
</style>