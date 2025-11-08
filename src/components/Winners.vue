<template>
  <div v-if="winners.length" class="text-white w-full h-screen p-6 flex flex-col">
    <!-- Header -->
    <h1 class="text-5xl text-center text-white audiowide-regular uppercase">
      Congratulation
      <br />
      <span class="text-4xl">Our Winners</span>
    </h1>

    <!-- Winners List -->
    <div ref="scrollContainer" class="mt-2 flex-1 overflow-hidden px-6 relative text-3xl font-bold">
      <div class="absolute top-0 left-0 right-0 transition-transform duration-500 ease-linear"
        :style="{ transform: `translateY(-${scrollOffset}px)` }">
        <!-- Original Winners -->
        <div v-for="(winner, index) in winners" :key="winner.id || winner.nrc"
          class="grid grid-cols-4 gap-1 mt-1 text-center items-stretch text-[#2E3192]">
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.customer_name }}
          </p>
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.business_type == 'business' ? winner.township : winner.shop_name }}
          </p>
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.nrc }}
          </p>
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.prize?.name || '-' }} <br> {{ winner.prize?.color || '' }}
          </p>
        </div>

        <!-- Duplicate Winners for seamless scroll -->
        <div v-for="(winner, index) in winners" :key="`duplicate-${winner.id || winner.nrc}`"
          class="grid grid-cols-4 gap-1 mt-3 text-center items-stretch text-[#2E3192]">
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.customer_name }}
          </p>
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.business_type == 'business' ? winner.township : winner.shop_name }}
          </p>
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.nrc }}
          </p>
          <p class="p-6 flex items-center justify-center" :class="index % 2 === 0 ? 'bg-[#D8EBFF]' : 'bg-[#C8E0FF]'">
            {{ winner.prize?.name || '-' }} <br> {{ winner.prize?.color || '' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import backend from '@/api/backend';

const winners = ref([]);
const scrollContainer = ref(null);
const scrollOffset = ref(0);
let scrollInterval = null;

const fetchWinners = async () => {
  try {
    const response = await backend.get('/lucky-draw-tickets/ticket-winners');
    winners.value = response.data?.data || [];
  } catch (error) {
    console.error('Error fetching winners:', error);
  }
};

fetchWinners();

onMounted(() => {
  scrollInterval = setInterval(() => {
    if (!scrollContainer.value) return;

    const contentHeight = scrollContainer.value.scrollHeight / 2; // because of duplication
    scrollOffset.value += 1; // scroll speed in px

    if (scrollOffset.value >= contentHeight) {
      scrollOffset.value = 0; // seamless reset
    }
  }, 30); // adjust speed here
});

onUnmounted(() => {
  clearInterval(scrollInterval);
});
</script>

<style lang="scss" scoped></style>
