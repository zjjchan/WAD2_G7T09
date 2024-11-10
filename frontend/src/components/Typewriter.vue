<!-- TypeWriter.vue -->
<template>
    <p class="typewriter" ref="typewriterText">
      Your personal assistant for <span class="typed-text">{{ displayText }}</span><span class="cursor" :class="{ 'typing': isTyping }">|</span>
    </p>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const phrases = ['meal planning', 'grocery shopping', 'nutrition'];
  const displayText = ref('');
  const currentPhraseIndex = ref(0);
  const isTyping = ref(true);
  let timeoutId = null;
  
  const typeText = () => {
    const currentPhrase = phrases[currentPhraseIndex.value];
    const currentLength = displayText.value.length;
  
    if (currentLength < currentPhrase.length) {
      displayText.value = currentPhrase.slice(0, currentLength + 1);
      timeoutId = setTimeout(typeText, 100);
    } else {
      isTyping.value = false;
      timeoutId = setTimeout(eraseText, 1000);
    }
  };
  
  const eraseText = () => {
    isTyping.value = true;
    if (displayText.value.length > 0) {
      displayText.value = displayText.value.slice(0, -1);
      timeoutId = setTimeout(eraseText, 50);
    } else {
      currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length;
      timeoutId = setTimeout(typeText, 500);
    }
  };
  
  onMounted(() => {
    timeoutId = setTimeout(typeText, 500);
  });
  
  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
  </script>
  
  <style scoped>
  .typewriter {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    display: inline-block;
  }
  
  .typed-text {
    color: #226925;
    font-weight: bold;
  }
  
  .cursor {
    display: inline-block;
    width: 3px;
    margin-left: 3px;
    color: #226925;
    animation: blink 1s infinite;
  }
  
  .cursor.typing {
    animation: none;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  </style>