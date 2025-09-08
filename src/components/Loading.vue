<template>
    <div class=" w-full h-full flex justify-center items-center">
        <span class="loader"></span>
    </div>
</template>
<script setup>
</script>
<style scoped>
.loader {
  width: 48px;
  height: 48px;
  display: inline-block;
  position: relative;
}
.loader::after,
.loader::before {
  content: '';
  width: 50px;
  height: 50px;
  border: 2px solid var(--base-color);
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  animation: rotation 2s ease-in-out infinite;
}
.loader::after {
  border-color: var(--logo-text-color);
  animation-delay: 1s;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 
</style>