<template>

          <h2>grocery list</h2>
          <div class="grocery-items">
            <div v-for="i in 3" :key="i" class="grocery-item">
              <input type="checkbox" />
              <div class="item-line"></div>
            </div>
          </div>
        
</template>

<script>
import { RouterLink, useRoute, useRouter } from 'vue-router';


</script>

<style setup>
.grocery-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grocery-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-line {
  flex: 1;
  border-bottom: 1px dashed #4A5240;
}

.view-more {
  color: #4A5240;
  font-size: 0.875rem;
  margin-top: 1rem;
  cursor: pointer;
}</style>