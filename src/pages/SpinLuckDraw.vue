<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-contain bg-x-repeat"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <div class="rounded-md w-full px-[10%]">
            <!-- Slots -->
            <div class="bg-linear-to-b from-[#1218FF] via-[#FFFFFF] to-[#1218FF] px-1.5 mb-16">
                <div class="grid grid-cols-2 p-5 bg-[#000DFF] divide-x divide-white/20 rounded-md shadow-white">
                    <!-- Prize slot -->
                    <div class="text-center bg-gradient-to-r from-[#1218FF] via-[#FFFFFF] to-[#1218FF] py-1.5">
                        <div class="w-full h-[150px] overflow-hidden bg-[#000DFF]">
                            <div :ref="el => setSlotRef(1, el)">
                                <div v-for="(prize, i) in slots[1]" :key="`p-${i}`"
                                    class="h-[150px] flex items-center justify-center text-white font-semibold text-4xl px-2">
                                    <span class="text-white text-4xl">
                                        {{ prize.name || '---' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Customer slot -->
                    <div class="text-center bg-gradient-to-r from-[#1218FF] via-[#FFFFFF] to-[#1218FF] py-1.5">
                        <div class="w-full h-[150px] overflow-hidden bg-[#000DFF]">
                            <div :ref="el => setSlotRef(0, el)">
                                <div v-for="(customer, i) in slots[0]" :key="`c-${i}`"
                                    class="h-[150px] flex items-center justify-center text-white font-semibold text-4xl capitalize px-2">
                                    {{ customer.name || '---' }}
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

        <canvas ref="confettiCanvas"
            class="pointer-events-none w-full h-full fixed bottom-0 right-0 left-0 top-0"></canvas>
        <Toast />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import bgImage from '@/assets/svg/slot_bg.svg'
import confetti from 'canvas-confetti'
import { useLuckyDraw } from '@/composables/useLuckyDraw'

const CONFIG = {
    ITEM_HEIGHT: 150,
    ANIMATION_BASE_DURATION: 6000,
    VIRTUAL_COUNT: 5,
    CONFETTI_DELAY: 250
}

const confettiCanvas = ref(null)
const winners = ref([])
const slots = ref([['---'], ['---']]) // [customers, prizes]
const slotRefs = ref([null, null])
const processing = ref(false)
const selectedCustomer = ref(null)
const selectedPrize = ref(null)

const toast = useToast()
const { virtualPrizes, virtualCustomers, fetchPrizes, fetchCustomers, shufflePrize, shuffleCustomer } = useLuckyDraw()

function setSlotRef(index, el) {
    slotRefs.value[index] = el
}

function cancelSlotAnimations(slotEl) {
    if (!slotEl) return
    try {
        const anims = slotEl.getAnimations ? slotEl.getAnimations() : []
        anims.forEach(a => a.cancel())
        slotEl.style.transform = 'translateY(0)'
    } catch (e) { }
}

function animateSlot(slotEl, itemCount) {
    if (!slotEl) return
    cancelSlotAnimations(slotEl)
    const totalHeight = (itemCount * CONFIG.ITEM_HEIGHT) - CONFIG.ITEM_HEIGHT
    slotEl.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(-${totalHeight}px)` }],
        { duration: CONFIG.ANIMATION_BASE_DURATION, fill: 'forwards', easing: 'ease-out' }
    )
}

// -----------------
// PRIZE SPIN
// -----------------
async function spinPrize() {
    if (!virtualPrizes.value.length || !virtualCustomers.value.length) {
        processing.value = false
        toast.add({ severity: 'warn', summary: 'Cannot Spin', detail: 'No more prizes or customers!', life: 5000 })
        return
    }

    const VIRTUAL_COUNT = Math.min(CONFIG.VIRTUAL_COUNT, virtualPrizes.value.length)
    const virtualPrizeList = virtualPrizes.value.slice(0, VIRTUAL_COUNT)
    slots.value[1] = virtualPrizeList

    await nextTick()
    const prizeSlotEl = slotRefs.value[1]
    if (!prizeSlotEl) return

    animateSlot(prizeSlotEl, virtualPrizeList.length)

    const realPrize = await shufflePrize()

    setTimeout(() => {
        if (realPrize) {
            selectedPrize.value = { ...realPrize }
        }
        slots.value[1].splice(-1, 1, selectedPrize.value)
        setTimeout(() => spinCustomerAfterPrize(), CONFIG.ANIMATION_BASE_DURATION / 2)
    }, CONFIG.ANIMATION_BASE_DURATION / 4)
}

// -----------------
// CUSTOMER SPIN
// -----------------
async function spinCustomerAfterPrize() {
    if (!virtualCustomers.value.length) {
        processing.value = false
        toast.add({ severity: 'warn', summary: 'Cannot Spin', detail: 'No more customers!', life: 5000 })
        return
    }

    const VIRTUAL_COUNT = Math.min(CONFIG.VIRTUAL_COUNT, virtualCustomers.value.length)
    const virtualCustomerList = virtualCustomers.value.slice(0, VIRTUAL_COUNT)

    slots.value[0] = virtualCustomerList

    await nextTick()
    const customerSlotEl = slotRefs.value[0]
    if (!customerSlotEl) return

    animateSlot(customerSlotEl, virtualCustomerList.length)

    const realCustomer = await shuffleCustomer()

    setTimeout(() => {
        if (realCustomer) {
            selectedCustomer.value = { ...realCustomer }
        }
        slots.value[0].splice(-1, 1, selectedCustomer.value)

        setTimeout(() => {
            winners.value.push({
                customer: selectedCustomer.value.name,
                prize: selectedPrize.value
            })
            processing.value = false
            successToast(`🎉 ${selectedCustomer.value.name} won ${selectedPrize.value.name} 🎉`)
            launchConfetti()
            setTimeout(() => resetForNextRound(), 3000)
        }, CONFIG.ANIMATION_BASE_DURATION)
    }, CONFIG.ANIMATION_BASE_DURATION / 4)
}

// -----------------
// RESET
// -----------------
function resetForNextRound() {
    slots.value = [['---'], ['---']]
    selectedCustomer.value = null
    selectedPrize.value = null
    slotRefs.value.forEach(slotEl => cancelSlotAnimations(slotEl))
}

// -----------------
// START
// -----------------
async function startSpinning() {
    if (processing.value) return

    try {
        resetForNextRound()
        processing.value = true
        await spinPrize()
    } catch (error) {
        console.error('Error during spinning:', error)
        toast.add({ severity: 'error', summary: 'Spin Error', detail: 'An error occurred during spinning', life: 5000 })
        processing.value = false
    }
}

// -----------------
// TOAST & CONFETTI
// -----------------
function successToast(message) {
    toast.add({ severity: 'success', summary: 'Congratulations', detail: message, life: 10000 })
}

function launchConfetti() {
    if (!confettiCanvas.value) return
    const myConfetti = confetti.create(confettiCanvas.value, { resize: true, useWorker: true })
    myConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } })
    setTimeout(() => {
        myConfetti({ particleCount: 120, angle: 60, spread: 100, origin: { x: 0 } })
        myConfetti({ particleCount: 120, angle: 120, spread: 100, origin: { x: 1 } })
    }, 250)
    setTimeout(() => {
        myConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } })
    }, 500)
}


// -----------------
// INIT
// -----------------
onMounted(() => {
    slots.value = [['---'], ['---']]
    fetchPrizes()
    fetchCustomers()
})
</script>
