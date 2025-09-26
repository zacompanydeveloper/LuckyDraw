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
import backend from '@/api/backend'

const ITEM_HEIGHT = 150
const ANIMATION_BASE_DURATION = 6000

const confettiCanvas = ref(null)
const virtualPrizes = ref([])
const virtualCustomers = ref([])
const winners = ref([])
const slots = ref([['---'], ['---']]) // [customers, prizes]
const slotRefs = ref([null, null])
const processing = ref(false)
const selectedCustomer = ref(null)
const selectedPrize = ref(null)

const toast = useToast()

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

// -----------------
// PRIZE SPIN
// -----------------
async function spinPrize() {
    if (!virtualPrizes.value.length || !virtualCustomers.value.length) {
        processing.value = false
        return alert('No more prizes or customers!')
    }

    const VIRTUAL_COUNT = Math.min(5, virtualPrizes.value.length)
    const virtualPrizeList = virtualPrizes.value.slice(0, VIRTUAL_COUNT)
    slots.value[1] = virtualPrizeList

    await nextTick()
    const prizeSlotEl = slotRefs.value[1]
    if (!prizeSlotEl) return

    cancelSlotAnimations(prizeSlotEl)
    const totalHeight = (virtualPrizeList.length * ITEM_HEIGHT) - ITEM_HEIGHT
    prizeSlotEl.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(-${totalHeight}px)` }],
        { duration: ANIMATION_BASE_DURATION, fill: 'forwards', easing: 'ease-out' }
    )

    let realPrize = null
    try {
        const res = await backend.get('/lucky-draw-prizes/shuffle-prize')
        realPrize = res.data?.data ?? null
    } catch (err) {
        console.error('Failed to fetch real prize', err)
    }

    setTimeout(() => {
        console.log('Selected Prize:', realPrize);

        if (realPrize) {
            selectedPrize.value = { ...realPrize }
        }
        slots.value[1].splice(-1, 1, selectedPrize.value)
        setTimeout(() => spinCustomerAfterPrize(), ANIMATION_BASE_DURATION / 2)
    }, ANIMATION_BASE_DURATION / 4)
}

// -----------------
// CUSTOMER SPIN
// -----------------
async function spinCustomerAfterPrize() {
    if (!virtualCustomers.value.length) {
        processing.value = false
        return alert('No more customers!')
    }

    const VIRTUAL_COUNT = Math.min(5, virtualCustomers.value.length)
    const virtualCustomerList = virtualCustomers.value.slice(0, VIRTUAL_COUNT)
    console.log('Virtual Customers:', virtualCustomerList);

    slots.value[0] = virtualCustomerList

    await nextTick()
    const customerSlotEl = slotRefs.value[0]
    if (!customerSlotEl) return

    cancelSlotAnimations(customerSlotEl)
    const totalHeight = (virtualCustomerList.length * ITEM_HEIGHT) - ITEM_HEIGHT
    customerSlotEl.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(-${totalHeight}px)` }],
        { duration: ANIMATION_BASE_DURATION, fill: 'forwards', easing: 'ease-out' }
    )

    let realCustomer = { hash_id: null, name: null }
    try {
        const res = await backend.get('/lucky-draw-tickets/shuffle-customer')

        realCustomer.hash_id = res.data?.data?.id ?? null
        realCustomer.name = res.data?.data?.customer_name ?? null

        console.log('Fetched Real Customer:', realCustomer);

    } catch (err) {
        console.error('Failed to fetch real customer', err)
    }

    console.log('Selected Customer:', realCustomer);

    setTimeout(() => {
        if (realCustomer) {
            selectedCustomer.value = { ...realCustomer }
        }
        slots.value[0].splice(-1, 1, selectedCustomer.value)

        console.log('Winner:', selectedCustomer.value);

        setTimeout(() => {
            winners.value.push({
                customer: selectedCustomer.value.name,
                prize: selectedPrize.value
            })
            processing.value = false
            successToast(`🎉 ${selectedCustomer.value.name} won ${selectedPrize.value.name} 🎉`)
            launchConfetti()
            setTimeout(() => resetForNextRound(), 3000)
        }, ANIMATION_BASE_DURATION)
    }, ANIMATION_BASE_DURATION / 4)
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
function startSpinning() {
    if (processing.value) return
    resetForNextRound()
    processing.value = true
    spinPrize()
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
// FETCH DATA
// -----------------
const getPrizes = async () => {
    try {
        const response = await backend.get('/lucky-draw-prizes', { params: { withoutPaginate: true } })
        const prizesData = response.data?.data
        if (Array.isArray(prizesData) && prizesData.length) {
            virtualPrizes.value = prizesData.map(p => ({
                hash_id: p.id,
                name: p.name,
                image: p.image?.url
            }))
        } else {
            toast.add({ severity: 'warn', summary: 'No Prizes', detail: 'No prizes available', life: 5000 })
        }
    } catch (err) {
        console.error('Error fetching prizes:', err)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch prizes', life: 5000 })
    }
}

const getCustomers = async () => {
    try {
        const response = await backend.get('/lucky-draw-tickets/customers', { params: { withoutPaginate: true } })
        const customersData = response.data?.data
        if (Array.isArray(customersData) && customersData.length) {
            virtualCustomers.value = customersData.map(c => ({
                hash_id: c.id,
                name: c.customer_name
            }))
        } else {
            toast.add({ severity: 'warn', summary: 'No Customers', detail: 'No customers available', life: 5000 })
        }
    } catch (err) {
        console.error('Error fetching customers:', err)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch customers', life: 5000 })
    }
}

// -----------------
// INIT
// -----------------
onMounted(() => {
    slots.value = [['---'], ['---']]
    getPrizes()
    getCustomers()
})
</script>
