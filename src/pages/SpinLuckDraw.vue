<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-contain bg-x-repeat"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <div class="rounded-md w-full px-[5%]">
            <!-- Slots -->
            <div class="grid grid-cols-2 gap-6 mb-16">
                <!-- Prize slot -->
                <div class="text-center relative overflow-hidden h-[260px]">
                    <!-- Prize list container -->
                    <div class="w-full h-[150px] overflow-hidden mt-14 relative z-30">
                        <div v-if="slots[1].length" :ref="el => setSlotRef(1, el)" class="flex flex-col">
                            <div v-for="(prize, i) in slots[1]" :key="`p-${i}`"
                                class="h-[150px] min-w-xl flex items-center justify-start gap-4 text-white font-semibold text-4xl px-10">
                                <img :src="prize.image" alt="" class="w-46 h-46 z-40" />

                                <div class="flex flex-col gap-4 font-bold text-white">
                                    <p class="text-white text-4xl z-40 text-start text-nowrap truncate max-w-[350px]">
                                        {{ (prize.name || 'iPhone 16 Pro - Desert Titanium').split(' - ')[0] }}
                                    </p>
                                    <p class="z-40 text-center text-2xl">
                                        {{ (prize.name || 'iPhone 16 Pro - Desert Titanium').split(' - ')[1] }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-else
                            class="h-full flex flex-col items-center justify-center text-white font-semibold text-4xl px-2">
                            <img src="@/assets/svg/vector.svg" alt="vector" class="w-35 z-40" />
                        </div>
                    </div>

                    <!-- Background layers -->
                    <img src="@/assets/svg/box.svg" alt="box" class="absolute bottom-6 left-0 right-0 top-0 z-20" />
                    <div
                        class="m-4 absolute bottom-0 left-0 right-0 top-0 z-10 bg-gradient-to-b from-[#010671] via-[#000DFF] to-[#010671]">
                    </div>
                </div>

                <!-- Customer slot -->
                <div class="text-center relative overflow-hidden h-[260px]">
                    <!-- Customer list container -->
                    <div class="w-full h-[150px] overflow-hidden mt-14 relative z-30">
                        <div v-if="slots[0].length" :ref="el => setSlotRef(0, el)" class="flex flex-col">
                            <div v-for="(customer, i) in slots[0]" :key="`c-${i}`"
                                class="h-[150px] min-w-xl flex items-center justify-center gap-4 text-white font-semibold text-4xl px-10">
                                <p
                                    class="text-white example font-bold text-4xl z-40 text-center text-nowrap truncate max-w-[500px]">
                                    {{ customer.name || 'Anonymous' }}
                                </p>
                            </div>
                        </div>
                        <div v-else
                            class="h-full flex flex-col items-center justify-center text-white font-semibold text-4xl px-2">
                            <img src="@/assets/svg/vector.svg" alt="vector" class="w-35 z-40" />
                        </div>
                    </div>

                    <!-- Background layers -->
                    <img src="@/assets/svg/box.svg" alt="box" class="absolute bottom-6 left-0 right-0 top-0 z-20" />
                    <div
                        class="m-4 absolute bottom-0 left-0 right-0 top-0 z-10 bg-gradient-to-b from-[#010671] via-[#000DFF] to-[#010671]">
                    </div>
                </div>
            </div>
            <!-- End Slots -->


            <!-- Roll Button -->
            <div class="flex justify-center">
                <button type="button" :disabled="processing"
                    class="w-[200px] h-14 hover:opacity-90 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                    <img v-if="!showNextBtn" @click="startSpinning" src="@/assets/svg/button.svg" alt="btn" />
                    <img v-else @click="goToNextStep" src="@/assets/svg/next.svg" alt="btn" />
                </button>
            </div>
        </div>

        <!-- Confetti -->
        <canvas ref="confettiCanvas"
            class="pointer-events-none w-full h-full fixed bottom-6 right-0 left-0 top-0"></canvas>

        <Toast />

        <!-- Winner Dialog -->
        <Dialog v-model:visible="successDialogVisible" modal :closable="false" :show-header="false" :show-footer="false" 
            :style="{ width: '40%', backgroundColor: '#FFF' }">
            <div class="text-center text-[#2E3192] pt-4 flex flex-col items-center gap-4 w-full">
                <div>
                    <h1 class="text-[#2E3192] text-4xl font-semibold uppercase mb-2">
                        Congratulations
                    </h1>
                    <h3 class="text-3xl uppercase">Winner is</h3>
                </div>
                <div class="flex flex-col items-center gap-2 w-full relative">
                    <p class="text-2xl font-semibold uppercase bg-[#E5F2FF] p-2 px-4">
                        {{ selectedCustomer?.shop_name }}
                    </p>
                    <h1 class="text-3xl font-semibold">
                        {{ selectedCustomer?.name || 'Khaing Yin Mon' }}
                    </h1>
                    <h1
                        class="text-2xl font-semibold text-white bg-[#000DFF] p-3 w-full border border-[#3B43FF] text-shadow-lg rounded">
                        {{ selectedPrize?.name || 'iPhone 16 Pro White Titanium' }}
                    </h1>
                    <img :src="selectedPrize?.image?.url || ''" alt="prize"
                        class="w-20 h-20 object-contain mt-4 absolute bottom-2 left-2 rounded border border-slate-100" />
                </div>
            </div>
            <div class="flex justify-center mt-10">
                <button type="button" @click="resetForNextRound"
                    class="w-[200px] h-14 hover:opacity-90 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                    <img src="@/assets/svg/button.svg" alt="btn" />
                </button>
            </div>
        </Dialog>
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
    VIRTUAL_COUNT: 1000,
    CONFETTI_DELAY: 250
}

const confettiCanvas = ref(null)
const winners = ref([])
const slots = ref([[], []]) // [customers, prizes]
const slotRefs = ref([null, null])
const processing = ref(false)
const selectedCustomer = ref(null)
const selectedPrize = ref(null)
const successDialogVisible = ref(false)
const showNextBtn = ref(false)

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

    if (!realPrize) {
        processing.value = false
        toast.add({ severity: 'error', summary: 'Spin Error', detail: 'Failed to fetch prize', life: 5000 })
        resetForNextRound()
        return
    }

    setTimeout(() => {
        if (realPrize) {
            selectedPrize.value = {
                'hash_id': realPrize.id,
                'name': realPrize.name,
                'image': realPrize.image?.url || ''
            }
        }
        slots.value[1].splice(-1, 1, selectedPrize.value)
        setTimeout(() => {
            showNextBtn.value = true
            processing.value = false
        }, CONFIG.ANIMATION_BASE_DURATION / 1.5)
    }, CONFIG.ANIMATION_BASE_DURATION / 4)
}

function goToNextStep() {
    processing.value = true
    spinCustomerAfterPrize()
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

    const realCustomer = await shuffleCustomer(selectedPrize.value?.hash_id)

    if (!realCustomer) {
        processing.value = false
        toast.add({ severity: 'error', summary: 'Spin Error', detail: 'Failed to fetch customer', life: 5000 })
        resetForNextRound()
        return
    }

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
            // successToast(`🎉 ${selectedCustomer.value.name} won ${selectedPrize.value.name} 🎉`)
            successDialogVisible.value = true
            launchConfetti()
        }, CONFIG.ANIMATION_BASE_DURATION)
    }, CONFIG.ANIMATION_BASE_DURATION / 10)
}

// -----------------
// RESET
// -----------------
function resetForNextRound() {
    slots.value = [[], []]
    selectedCustomer.value = null
    selectedPrize.value = null
    slotRefs.value.forEach(slotEl => cancelSlotAnimations(slotEl))
    successDialogVisible.value = false
    processing.value = false
    showNextBtn.value = false
}

// -----------------
// START
// -----------------
async function startSpinning() {
    if (processing.value) return

    try {
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
onMounted(async () => {
    slots.value = [[], []]
    await Promise.all([fetchPrizes(), fetchCustomers()])
})
</script>

<style>
.p-dialog {
    border: 1px solid red !important;
}
</style>
