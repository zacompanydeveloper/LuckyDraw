<template>
  <div class="text-center relative overflow-hidden h-[260px]">
    <div class="w-full h-[180px] overflow-hidden mt-11 relative z-30">
      <div v-if="items.length" :ref="el => setSlotRef(slotIndex, el)" class="flex flex-col">
        <div v-for="(item, i) in items" :key="`${type}-${i}`"
          class="h-[180px] min-w-xl flex items-center justify-center gap-4 text-white font-semibold text-4xl px-10">

          <!-- Prize -->
          <template v-if="type === 'prize'">
            <img :src="item.image" alt="" class="w-36 z-40 object-cover " />
            <div class="flex flex-col items-center justify-center gap-4 font-bold text-white w-[350px]">
              <p class="text-white text-4xl z-40 text-start truncate max-w-[350px]">
                {{ item.name }}
              </p>
              <!-- <p class="z-40 text-center text-2xl">
                {{ item.name.split(' ').slice(-1)[0] }}
              </p> -->
            </div>
          </template>

          <!-- Customer -->
          <template v-else>
            <p class="text-white example font-bold text-4xl z-40 text-center text-nowrap truncate max-w-[500px]">
              {{ item.name || 'Anonymous' }}
            </p>
          </template>

        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="h-full flex flex-col items-center justify-center text-white font-semibold text-4xl px-2">
        <img src="@/assets/svg/vector.svg" alt="vector" class="w-35 z-40" />
      </div>
    </div>

    <!-- Background layers -->
    <img src="@/assets/svg/box.svg" alt="box" class="absolute bottom-6 left-0 right-0 top-0 z-20" />
    <div
      class="m-4 absolute bottom-0 left-0 right-0 top-0 z-10 bg-gradient-to-b from-[#010671] via-[#000DFF] to-[#010671]">
    </div>
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
