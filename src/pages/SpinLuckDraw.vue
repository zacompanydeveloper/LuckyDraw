<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-contain bg-x-repeat"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <div class="rounded-md w-full px-[10%]">
      <!-- Slots -->
      <div class="bg-linear-to-b from-[#1218FF] via-[#FFFFFF] to-[#1218FF] px-1.5 mb-16">
        <div class="grid grid-cols-2 p-5 bg-[#000DFF] divide-x divide-white/20 rounded-md shadow-white">
          <!-- Customer slot -->
          <div class="text-center bg-gradient-to-r from-[#1218FF] via-[#FFFFFF] to-[#1218FF] py-1.5">
            <div class="w-full h-[150px] overflow-hidden bg-[#000DFF]">
              <div :ref="el => slotRefs[0] = el">
                <div
                  v-for="(customer, i) in slots[0]"
                  :key="`c-${i}`"
                  class="h-[150px] flex items-center justify-center text-white font-semibold text-4xl capitalize px-2"
                >
                  {{ customer }}
                </div>
              </div>
            </div>
          </div>

          <!-- Prize slot -->
          <div class="text-center bg-gradient-to-r from-[#1218FF] via-[#FFFFFF] to-[#1218FF] py-1.5">
            <div class="w-full h-[150px] overflow-hidden bg-[#000DFF]">
              <div :ref="el => slotRefs[1] = el">
                <div
                  v-for="(prize, i) in slots[1]"
                  :key="`p-${i}`"
                  class="h-[150px] flex  items-center justify-center text-white font-semibold text-lg px-2"
                >
                  <img
                    v-if="prize.image"
                    :src="prize.image"
                    alt="prize image"
                    class="h-16 w-16"
                  />
                  <span class="text-white text-2xl">{{ prize.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Roll Button -->
      <div class="flex justify-center">
        <button
          type="button"
          @click="startSpinning"
          :disabled="processing"
          class="w-[200px] h-14 hover:opacity-90 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <img src="@/assets/svg/button.svg" alt="btn" />
        </button>
      </div>
    </div>

    <canvas
      ref="confettiCanvas"
      class="pointer-events-none w-full h-full fixed bottom-0 right-0 left-0 top-0"
    ></canvas>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import bgImage from '@/assets/svg/slot_bg.svg'
import confetti from 'canvas-confetti'
import backend from '@/api/backend'

// -----------------
// CONSTANTS
// -----------------
const ITEM_HEIGHT = 150
const ANIMATION_BASE_DURATION = 6000

// -----------------
// STATE
// -----------------
const confettiCanvas = ref(null)
const allCustomers = [
  'Ei Ei Phyo', 'Ms Myint Myint San', 'Ms Yoon Nandar', 'Ms Thin Thin Yee',
  'Mr Wai Linn Aung', 'Ms. Phyu Zar Khin', 'Mr Myo Zaw', 'Thazin Store', 'Family Mall'
] // shortened for demo

const allPrizes = [] // will hold objects: { hash_id, name, image }
const remainingCustomers = ref([...allCustomers])
const remainingPrizes = ref([...allPrizes])
const winners = ref([])

const slots = ref([['---'], ['---']])
const slotRefs = []
const processing = ref(false)
const selectedCustomer = ref(null)
const selectedPrize = ref(null)

const toast = useToast()

// -----------------
// HELPERS
// -----------------
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getRandomIndex(array) {
  return Math.floor(Math.random() * array.length)
}

// -----------------
// BUILD LISTS
// -----------------
function buildCustomerList() {
  if (!remainingCustomers.value.length) return null
  const cIndex = getRandomIndex(remainingCustomers.value)
  const winnerCustomer = remainingCustomers.value[cIndex]
  const otherCustomers = remainingCustomers.value.filter((_, i) => i !== cIndex)

  let customerList = [
    ...shuffle(otherCustomers),
    ...shuffle(winners.value.map(w => w.customer)),
    winnerCustomer
  ]
  customerList = [...shuffle(customerList.slice(0, -1)), customerList.at(-1)]
  slots.value[0] = customerList

  return { winnerCustomer, customerList, cIndex }
}

function buildPrizeList() {
  if (!remainingPrizes.value.length) return null
  const pIndex = getRandomIndex(remainingPrizes.value)
  const winnerPrize = remainingPrizes.value[pIndex]
  const otherPrizes = remainingPrizes.value.filter((_, i) => i !== pIndex)

  let prizeList = [
    ...shuffle(otherPrizes),
    ...shuffle(winners.value.map(w => w.prize)),
    winnerPrize
  ]
  prizeList = [...shuffle(prizeList.slice(0, -1)), prizeList.at(-1)]
  slots.value[1] = prizeList

  return { winnerPrize, prizeList, pIndex }
}

// -----------------
// ANIMATION
// -----------------
async function spinCustomer() {
  const result = buildCustomerList()
  if (!result) {
    processing.value = false
    return alert('No more remaining customers!')
  }
  await nextTick()
  const totalHeight = (result.customerList.length * ITEM_HEIGHT) - ITEM_HEIGHT
  slotRefs[0].animate(
    [{ transform: 'translateY(0)' }, { transform: `translateY(-${totalHeight}px)` }],
    { duration: ANIMATION_BASE_DURATION, fill: 'forwards', easing: 'ease-out' }
  )
  setTimeout(() => {
    selectedCustomer.value = { name: result.winnerCustomer, index: result.cIndex }
    setTimeout(() => spinPrize(), 500)
  }, ANIMATION_BASE_DURATION)
}

async function spinPrize() {
  if (!selectedCustomer.value) return
  const result = buildPrizeList()
  if (!result) {
    processing.value = false
    return alert('No more remaining prizes!')
  }
  await nextTick()
  const totalHeight = (result.prizeList.length * ITEM_HEIGHT) - ITEM_HEIGHT
  slotRefs[1].animate(
    [{ transform: 'translateY(0)' }, { transform: `translateY(-${totalHeight}px)` }],
    { duration: ANIMATION_BASE_DURATION, fill: 'forwards', easing: 'ease-out' }
  )
  setTimeout(() => {
    selectedPrize.value = { ...result.winnerPrize, index: result.pIndex }
    winners.value.push({ customer: selectedCustomer.value.name, prize: result.winnerPrize })
    remainingCustomers.value = remainingCustomers.value.filter((_, i) => i !== selectedCustomer.value.index)
    remainingPrizes.value = remainingPrizes.value.filter((_, i) => i !== result.pIndex)
    processing.value = false
    successToast(`🎉 ${selectedCustomer.value.name} won ${result.winnerPrize.name} 🎉`)
    launchConfetti()
    setTimeout(() => resetForNextRound(), 3000)
  }, ANIMATION_BASE_DURATION)
}

function resetForNextRound() {
  slots.value = [['---'], ['---']]
  selectedCustomer.value = null
  selectedPrize.value = null
  slotRefs.forEach(slot => {
    if (slot) {
      slot.getAnimations().forEach(a => a.cancel())
      slot.style.transform = 'translateY(0)'
    }
  })
}

function startSpinning() {
  if (processing.value) return
  resetForNextRound()
  processing.value = true
  spinCustomer()
}

function successToast(message) {
  toast.add({ severity: 'success', summary: 'Congratulations', detail: message, life: 10000 })
}

function launchConfetti() {
  if (!confettiCanvas.value) return
  const myConfetti = confetti.create(confettiCanvas.value, { resize: true, useWorker: true })
  myConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffdd00'] })
  setTimeout(() => {
    myConfetti({ particleCount: 120, angle: 60, spread: 100, origin: { x: 0 } })
    myConfetti({ particleCount: 120, angle: 120, spread: 100, origin: { x: 1 } })
  }, 250)
  setTimeout(() => {
    myConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffdd00'] })
  }, 500)
}

// -----------------
// FETCH PRIZES
// -----------------
const getPrizes = async () => {
  try {
    const response = await backend.get('/lucky-draw-prizes', { params: { withoutPaginate: true } })
    const prizesData = response.data.data
    if (Array.isArray(prizesData) && prizesData.length) {
      allPrizes.push(
        ...prizesData.map(p => ({ hash_id: p.id, name: p.name, image: p.image?.url }))
      )
      remainingPrizes.value = [...allPrizes]
    } else {
      toast.add({ severity: 'warn', summary: 'No Prizes', detail: 'No prizes available', life: 5000 })
    }
  } catch (err) {
    console.error('Error fetching prizes:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch prizes', life: 5000 })
  }
}

// -----------------
// INIT
// -----------------
onMounted(() => {
  slots.value = [['---'], ['---']]
  getPrizes()
})
</script>
