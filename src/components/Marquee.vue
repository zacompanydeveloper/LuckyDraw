<template>
  <div v-if="items.length"
       class="overflow-hidden relative mx-auto max-w-6xl -mt-50 mb-10 bg-gradient-to-r from-[#CAD6F41A] via-[#FFFFFFCC] to-[#CAD6F41A]">
    <div :class="['flex items-center justify-center gap-8 py-2', { 'marquee-container': items.length >= 4 }]">
      <template v-for="n in (items.length >= 4 ? 2 : 1)">
        <div v-for="(prize, index) in items" :key="`marquee-${n}-${index}`"
             class="flex items-center gap-3 flex-shrink-0">
          <img :src="prize.image?.url || prize.image" alt="" class="w-24 h-24 object-contain" />
          <div class="flex flex-col text-center items-center justify-center">
            <p class="text-white text-xl font-bold whitespace-nowrap">
              {{ (prize?.name).split(' - ')[0] }}
            </p>
            <p class="text-white text-lg font-semibold whitespace-nowrap">
              {{ (prize?.name).split(' - ')[1] }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})
</script>

<style scoped>
.marquee-container {
  animation: marquee 40s linear infinite;
  will-change: transform;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
