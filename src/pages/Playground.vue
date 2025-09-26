<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-contain bg-x-repeat"
    :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="rounded-md w-full px-[10%]">
      <!-- Slots -->
      <div class="bg-linear-to-b from-[#1218FF] via-[#FFFFFF] to-[#1218FF] px-1.5 mb-16">
        <div class="grid grid-cols-2 p-5 bg-[#000DFF] divide-x divide-white/20 rounded-md shadow-white">
          <!-- Customer slot -->
          <div class="text-center bg-gradient-to-r from-[#1218FF] via-[#FFFFFF] to-[#1218FF] py-1.5">
            <div class="w-full h-[150px] overflow-hidden bg-[#000DFF]">
              <div :ref="el => slotRefs[0] = el">
                <div v-for="(customer, i) in slots[0]" :key="`c-${i}`"
                  class="h-[150px] flex items-center justify-center text-white font-semibold text-4xl capitalize px-2">
                  {{ customer }}
                </div>
              </div>
            </div>
          </div>

          <!-- Prize slot -->
          <div class="text-center bg-gradient-to-r from-[#1218FF] via-[#FFFFFF] to-[#1218FF] py-1.5">
            <div class="w-full h-[150px] overflow-hidden bg-[#000DFF]">
              <div :ref="el => slotRefs[1] = el">
                <div v-for="(prize, i) in slots[1]" :key="`p-${i}`"
                  class="h-[150px] flex items-center justify-center text-white font-semibold text-4xl capitalize px-2">
                  {{ prize }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Roll Button -->
      <div class="flex justify-center">
        <button type="button" @click="startSpinning" :disabled="processing"
          class="w-[200px] h-14 hover:opacity-90 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
          <img src="@/assets/svg/button.svg" alt="btn" />
        </button>
      </div>
    </div>

    <canvas ref="confettiCanvas" class="pointer-events-none w-full h-full fixed bottom-0 right-0 left-0 top-0"></canvas>
    <Toast />
    <Dialog v-model:visible="successBox" modal header="Edit Profile" :style="{ width: '25rem' }">
      <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
      <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">Username</label>
        <InputText id="username" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="email" class="font-semibold w-24">Email</label>
        <InputText id="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
        <Button type="button" label="Save" @click="visible = false"></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import bgImage from '@/assets/svg/slot_bg.svg'
import confetti from 'canvas-confetti'

const confettiCanvas = ref(null)
const successBox = ref(false)

// -----------------
// CONSTANTS
// -----------------
const ITEM_HEIGHT = 150
const TOTAL_DUPLICATES = 30
const ANIMATION_BASE_DURATION = 6000
const ANIMATION_DELAY_STEP = 500

// -----------------
// STATE
// -----------------
const allCustomers = [
  'Ei Ei Phyo', 'Ms Myint Myint San', 'Ms Yoon Nandar', 'Ms Thin Thin Yee',
  'Mr Wai Linn Aung', 'Ms. Phyu Zar Khin', 'Mr Myo Zaw', 'Thazin Store',
  'Family Mall', 'We Love Natogyi', 'Happy Mart', 'Super Shop', 'Daily Needs',
  'Shop & Save', 'Budget Bazaar', 'Quick Pick', 'Urban Market', 'Fresh Finds',
  'Grocery Hub', 'Value Mart', 'City Store', 'Neighborhood Market', 'Local Goods',
  'Everyday Essentials', 'Smart Shop', 'Mega Mart', ' Shop Easy', 'Best Buy', 'Shop Smart',
  'Daily Deals', 'Family Store', 'Super Saver', 'Market Place', 'Shop & Go', 'Quick Mart', 'Urban Shop', 'Fresh Market', 'Grocery World', 'Value Shop', 'City Market', 'Neighborhood Store', 'Local Mart', 'Everyday Shops', 'Smart Mart', 'Mega Shop', 'Shop Now', 'Best Deals',
  'Shop Right', 'Daily Shop', 'Family Mart', 'Super Market', 'Market Hub', 'Shop Plus', 'Quick Shop', 'Urban Mart', 'Fresh Shop', 'Grocery Store', 'Value Market', 'City Shop', 'Neighborhood Mart', 'Local Store', 'Everyday Market', 'Smart Store', 'Mega Market', 'Shop & Save', 'Best Store',
  'Shop Easy', 'Daily Needs', 'Family Goods', 'Super Shop', 'Market Place', 'Shop & Go', 'Quick Mart', 'Urban Shop', 'Fresh Market', 'Grocery World', 'Value Shop', 'City Market', 'Neighborhood Store', 'Local Mart', 'Everyday Shops', 'Smart Mart', 'Mega Shop', 'Shop Now', 'Best Deals',
  'Shop Right', 'Daily Shop', 'Family Mart', 'Super Market', 'Market Hub', 'Shop Plus', 'Quick Shop', 'Urban Mart', 'Fresh Shop', 'Grocery Store', 'Value Market', 'City Shop', 'Neighborhood Mart', 'Local Store', 'Everyday Market', 'Smart Store', 'Mega Market',
  'Shop & Save', 'Best Store', 'Shop Easy', 'Daily Needs', 'Family Goods', 'Super Shop', 'Market Place', 'Shop & Go', 'Quick Mart', 'Urban Shop', 'Fresh Market', 'Grocery World', 'Value Shop', 'City Market', 'Neighborhood Store', 'Local Mart', 'Everyday Shops', 'Smart Mart', 'Mega Shop', 'Shop Now', 'Best Deals',
  'Shop Right', 'Daily Shop', 'Family Mart', 'Super Market', 'Market Hub', 'Shop Plus', 'Quick Shop', 'Urban Mart', 'Fresh Shop', 'Grocery Store', 'Value Market', 'City Shop', 'Neighborhood Mart', 'Local Store', 'Everyday Market', 'Smart Store', 'Mega Market'
]

const allPrizes = [
  'iPhone 15', 'Samsung Galaxy', 'MacBook Pro', 'iPad Air', 'Apple Watch',
  'AirPods Pro', 'Sony WH-1000XM5', 'Dell XPS 13', 'Google Pixel 8', 'Amazon Echo',
  'Fitbit Charge 5', 'Nintendo Switch', 'GoPro HERO11', 'Kindle Paperwhite', 'Bose QuietComfort 45',
  'Microsoft Surface Pro 9', 'Jabra Elite 7 Pro', 'HP Spectre x360', 'Logitech MX Master 3', 'Razer Blade 15', 'Anker PowerCore 20100',
  'iPhone 15', 'Samsung Galaxy', 'MacBook Pro', 'iPad Air', 'Apple Watch',
  'AirPods Pro', 'Sony WH-1000XM5', 'Dell XPS 13', 'Google Pixel 8', 'Amazon Echo',
  'Fitbit Charge 5', 'Nintendo Switch', 'GoPro HERO11', 'Kindle Paperwhite', 'Bose QuietComfort 45',
  'Microsoft Surface Pro 9', 'Jabra Elite 7 Pro', 'HP Spectre x360', 'Logitech MX Master 3', 'Razer Blade 15', 'Anker PowerCore 20100',
  'iPhone 15', 'Samsung Galaxy', 'MacBook Pro', 'iPad Air', 'Apple Watch',
  'AirPods Pro', 'Sony WH-1000XM5', 'Dell XPS 13', 'Google Pixel 8', 'Amazon Echo',
  'Fitbit Charge 5', 'Nintendo Switch', 'GoPro HERO11', 'Kindle Paperwhite', 'Bose QuietComfort 45',
  'Microsoft Surface Pro 9', 'Jabra Elite 7 Pro', 'HP Spectre x360', 'Logitech MX Master 3', 'Razer Blade 15', 'Anker PowerCore 20100',
  'iPhone 15', 'Samsung Galaxy', 'MacBook Pro', 'iPad Air', 'Apple Watch',
  'AirPods Pro', 'Sony WH-1000XM5', 'Dell XPS 13', 'Google Pixel 8', 'Amazon Echo'
]

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

  // Build spinning list
  let customerList = [
    ...shuffle(otherCustomers),
    ...shuffle(winners.value.map(w => w.customer).flatMap(c => Array(1).fill(c))),
    winnerCustomer // Winner at the end
  ];

  // Extra shuffle for stronger randomness
  customerList = [...shuffle(customerList.slice(0, -1)), customerList.at(-1)];

  slots.value[0] = customerList

  return { winnerCustomer, customerList, cIndex }
}

function buildPrizeList() {
  if (!remainingPrizes.value.length) return null

  const pIndex = getRandomIndex(remainingPrizes.value)
  const winnerPrize = remainingPrizes.value[pIndex]

  const otherPrizes = remainingPrizes.value.filter((_, i) => i !== pIndex)

  // Build spinning list
  let prizeList = [
    ...shuffle(otherPrizes),
    ...shuffle(winners.value.map(w => w.prize).flatMap(p => Array(1).fill(p))),
    winnerPrize // Winner at the end
  ];

  // Extra shuffle for stronger randomness
  prizeList = [...shuffle(prizeList.slice(0, -1)), prizeList.at(-1)];

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

  // animate customer slot only
  slotRefs[0].animate(
    [
      { transform: 'translateY(0)' },
      { transform: `translateY(-${totalHeight}px)` }
    ],
    {
      duration: ANIMATION_BASE_DURATION,
      fill: 'forwards',
      easing: 'ease-out'
    }
  )

  setTimeout(() => {
    selectedCustomer.value = { name: result.winnerCustomer, index: result.cIndex }
    // toast.add({ severity: 'info', summary: 'Customer Selected', detail: `${result.winnerCustomer} has been selected!`, life: 5000 })

    // Automatically spin prize after a short delay
    setTimeout(() => {
      spinPrize()
    }, 500)
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

  // animate prize slot only
  slotRefs[1].animate(
    [
      { transform: 'translateY(0)' },
      { transform: `translateY(-${totalHeight}px)` }
    ],
    {
      duration: ANIMATION_BASE_DURATION,
      fill: 'forwards',
      easing: 'ease-out'
    }
  )

  setTimeout(() => {
    selectedPrize.value = { name: result.winnerPrize, index: result.pIndex }

    // Record winner and update remaining lists
    winners.value.push({ customer: selectedCustomer.value.name, prize: result.winnerPrize })
    remainingCustomers.value = remainingCustomers.value.filter((_, i) => i !== selectedCustomer.value.index)
    remainingPrizes.value = remainingPrizes.value.filter((_, i) => i !== result.pIndex)

    processing.value = false
    successToast(`🎉 ${selectedCustomer.value.name} won ${result.winnerPrize} 🎉`)
    launchConfetti()

    // Reset for next round
    setTimeout(() => {
      resetForNextRound()
    }, 3000)
  }, ANIMATION_BASE_DURATION)
}

function resetForNextRound() {
  // Reset arrays
  slots.value = [['---'], ['---']]
  selectedCustomer.value = null
  selectedPrize.value = null

  // **Reset the transform of each slot container immediately**
  slotRefs.forEach(slot => {
    if (slot) {
      // cancel any animation frames still running
      slot.getAnimations().forEach(a => a.cancel())
      slot.style.transform = 'translateY(0)'
    }
  })
}

function startSpinning() {
  if (processing.value) return
  resetForNextRound() // optional if you want clean reset before spin
  processing.value = true
  spinCustomer()
}

function successToast(message) {
  toast.add({ severity: 'success', summary: 'Congratulations', detail: message, life: 10000 })
  // successBox.value = true
}

function launchConfetti() {

  if (!confettiCanvas.value) return
  const myConfetti = confetti.create(confettiCanvas.value, { resize: true, useWorker: true })

  // A nice burst:
  myConfetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffdd00'],
  })

  // Optional second burst for extra effect
  setTimeout(() => {
    myConfetti({
      particleCount: 120,
      angle: 60,
      spread: 100,
      origin: { x: 0 },
    })
    myConfetti({
      particleCount: 120,
      angle: 120,
      spread: 100,
      origin: { x: 1 },
    })
  }, 250)

  // Optional third burst for extra effect
  setTimeout(() => {
    myConfetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffdd00'],
    })
  }, 500)
}


// -----------------
// INIT
// -----------------
onMounted(() => {
  slots.value = [['---'], ['---']]
})
</script>
