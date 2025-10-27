<template>
  <div v-if="winners.length" class="text-white w-full h-screen pt-8 flex flex-col">
    <!-- Header -->
    <h1 class="text-5xl text-center text-white audiowide-regular uppercase">
      Congratulation
      <br>
      <span class="text-4xl">Our Winners</span>
    </h1>

    <!-- Winners List -->
    <div class="mt-2 mb-14 flex-1 overflow-y-auto px-6">
      <div
        v-for="winner in winners"
        :key="winner.id || winner.nrc"
        class="grid grid-cols-4 gap-1 mt-3 text-xl text-center items-stretch text-[#2E3192]"
      >
        <p class="bg-[#D8EBFF] p-6 flex items-center justify-center">{{ winner.customer_name }}</p>
        <p class="bg-[#D8EBFF] p-6 flex items-center justify-center">{{ winner.township }}</p>
        <p class="bg-[#D8EBFF] p-6 flex items-center justify-center">{{ winner.nrc }}</p>
        <p class="bg-[#D8EBFF] p-6 flex items-center justify-center">{{ winner.prize?.name || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import backend from '@/api/backend';

const winners = ref([]);

const fetchWinners = async () => {
  try {
    const response = await backend.get('/lucky-draw-tickets/ticket-winners');
    winners.value = response.data?.data || [];
  } catch (error) {
    console.error('Error fetching winners:', error);
  }
};

fetchWinners();
</script>

<style lang="scss" scoped></style>
