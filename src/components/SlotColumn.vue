<template>
  <div class="text-center relative overflow-hidden h-[180px]">
    <div class="w-full h-[150px] overflow-hidden mt-3 relative z-30">
      <div v-if="items.length" :ref="el => setSlotRef(slotIndex, el)" class="flex flex-col"
        :class="{ 'fade-in-prize': type === 'prize' && items.length === 1 }">
        <div v-for="(item, i) in items" :key="`${type}-${i}`"
          class="h-[150px] min-w-md flex items-center justify-center gap-4 text-white font-semibold text-2xl">

          <!-- Prize -->
          <template v-if="type === 'prize'">
            <img :src="item.image" alt="" class="w-24 z-40 object-cover " />
            <div class="flex flex-col items-center justify-center gap-1 font-bold text-white w-[250px]">
              <p class="text-white text-[20px] z-40 text-start truncate max-w-[250px]">
                {{ item.name }}
              </p>
              <p class="z-40 text-center text-[20px]">
                {{ item.color}}
              </p>
            </div>
          </template>

          <!-- Customer -->
          <template v-else>
            <p class="text-white example font-bold text-3xl z-40 text-center text-nowrap truncate max-w-[350px]">
              {{ item.name || 'Anonymous' }}
            </p>
          </template>

        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="h-full flex flex-col items-center justify-center text-white font-semibold text-2xl px-2">
        <img src="@/assets/svg/vector.svg" alt="vector" class="w-35 z-40" />
      </div>
    </div>

    <!-- Background layers -->
    <img v-if="type == 'prize'" src="@/assets/svg/left_box.svg" alt="box" class="absolute bottom-6 left-0 right-0 top-0 z-20" />
    <img v-if="type == 'customer'" src="@/assets/svg/right_box.svg" alt="box" class="absolute bottom-6 left-0 right-0 top-0 z-20" />
    <!-- <div
      class="m-3 mx-4 absolute bottom-0 left-0 right-0 top-0 z-10 bg-gradient-to-b from-[#010671] via-[#000DFF] to-[#010671]">
    </div> -->
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  slotIndex: { type: Number, required: true },
  setSlotRef: { type: Function, required: true },
  type: { type: String, default: 'customer' } // 'prize' or 'customer'
})
</script>

<style scoped>
.fade-in-prize {
  animation: fadeInFromBottom 0.3s ease-out;
}

@keyframes fadeInFromBottom {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
