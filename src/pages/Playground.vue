<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#16213e]">
    <div class="p-5 bg-[#0f3460] rounded-md">
      <!-- Slots -->
      <div class="grid grid-cols-3 gap-5 p-5 bg-black/20 rounded-md mb-2.5">
        <div v-for="(slot, index) in slots" :key="index" class="w-[100px] h-[100px] overflow-hidden">
          <div :ref="el => slotRefs[index] = el">
            <img v-for="(prize, pIndex) in slot" :key="pIndex" :src="prize" :width="defaultSize" :height="defaultSize"
              class="block" />
          </div>
        </div>
      </div>

      <!-- Button -->
      <button type="button" @click="startAnimation"
        class="block w-full h-10 bg-[#5c2e7e] text-white uppercase text-lg rounded-md hover:opacity-70">
        Roll
      </button>

      <!-- Log -->
      <div class="max-w-[380px] text-white text-sm mt-2 break-words">
        Ganhou: {{ playerWon ? 'Sim' : 'Não' }}<br />
        <span v-if="playerWon">Item sorteado: {{ winningItem }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const prizes = [
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/174955058326tBK_400_400.webp',
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/1741859175FtPU2_400_400.webp',
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/1749636404vZvs2_400_400.webp',
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/1745555594GWQBo_400_400.webp',
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/1741151150MHniG_400_400.webp',
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/174963606957CYP_400_400.webp',
  'https://access.cdndata.cloud/marketplace/pos-lite/proxyImg/1749463488isUux_400_400.webp'
]

const slots = ref([[], [], []])
const defaultSize = 100
const totalDuplicates = 7

const playerWon = ref(false)
const winningItem = ref('')
const slotRefs = []

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
  }
  return array
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const buildItemLists = (won, item, randomDifference = 0) => {
  playerWon.value = won
  winningItem.value = item

  slots.value = slots.value.map((_, s) => {
    let randomPrizes = shuffle(
      prizes.flatMap(i => Array(totalDuplicates).fill(i))
    )

    if (won) {
      randomPrizes.push(item)
    } else {
      const position = s < 2 ? 0 : s
      randomPrizes.push(prizes[position + randomDifference])
    }

    return randomPrizes
  })
}

const startAnimation = async () => {
  const won = Math.random() < 0.5
  const item = prizes[getRandomInt(0, prizes.length - 1)]
  const randomDifference = getRandomInt(0, prizes.length - 3)

  buildItemLists(won, item, randomDifference)

  await nextTick()
  const totalHeight =
    prizes.length * totalDuplicates * defaultSize

  slotRefs.forEach((slot, s) => {
    slot.animate(
      [
        { transform: 'translateY(0)' },
        { transform: `translateY(-${totalHeight}px)` },
      ],
      {
        duration: 3000 + s * 500,
        fill: 'forwards',
      }
    )
  })
}

onMounted(() => {
  buildItemLists(false, '')
})
</script>
