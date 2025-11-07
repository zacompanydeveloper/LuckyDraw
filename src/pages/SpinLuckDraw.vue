<template>
    <!-- Spin Section -->
    <div v-if="spinSection"
        class="flex flex-col items-center justify-center min-h-screen bg-contain bg-repeat-x bg-center"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <div class="w-full flex justify-between absolute top-0 left-0 right-0 z-10">
            <img src="@/assets/images/sweetyhome_logo.png" alt="" srcset="">
            <img src="@/assets/images/30_years_anni.png" alt="" srcset="">
        </div>
        <div
            class="w-full flex justify-between absolute items-end bottom-0 left-0 right-0 z-10 p-2 text-2xl text-white font-bold audiowide-regular text-center">
            <p>8 November 2025 (Saturday)</p>
            <p class="">No.(2A1/16G),Sweety Home Tower,<br>East
                RaceCourse Road, Tamwe Township, Yangon.</p>
        </div>
        <!-- Initial Start Screen -->
        <div v-if="initialState" class="w-full flex flex-col items-center gap-16">
            <img src="@/assets/images/typo.png" alt="Lucky Draw" class="lucky-img" :class="{
                'disabled-img':
                    virtualPrizes.length === 0 || virtualCustomers.length === 0
            }" @click.prevent="
                !(virtualPrizes.length === 0 || virtualCustomers.length === 0) &&
                (initialState = false)
                " />
        </div>


        <!-- Spin Screen -->
        <div v-else class="rounded-md w-full px-[5%] pt-20">
            <!-- Marquee -->
            <!-- <Marquee :items="remainingPrizes" /> -->

            <!-- Slots -->
            <div class="grid grid-cols-2 gap-10 mb-16 px-[14%]">
                <SlotColumn :items="slots[1]" :slotIndex="1" :setSlotRef="setSlotRef" type="prize" />
                <SlotColumn :items="slots[0]" :slotIndex="0" :setSlotRef="setSlotRef" type="customer" />
            </div>

            <!-- Roll Button -->
            <div class="flex justify-center">
                <div class="rounded-xl bg-gradient-to-r from-[#000DFF] via-[#343EFF] to-[#FFFFFF] p-[4px]">
                    <button type="button" :disabled="processing" @click="handleRoll" :aria-disabled="processing"
                        class="w-[200px] h-14 flex items-center justify-center bg-gradient-to-r from-[#00047D] to-[#0008CE] rounded-lg cursor-pointer hover:opacity-80 disabled:opacity-10 disabled:cursor-not-allowed">
                        <span class="text-[21px] text-center font-light text-white uppercase audiowide-regular">
                            {{ showNextBtn ? "NEXT" : "START SPIN" }}
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Confetti - positioned to overflow over dialog -->
        <canvas ref="confettiCanvas"
            class="pointer-events-none w-full h-full fixed bottom-0 right-0 left-0 top-0 z-[9999]"></canvas>

        <Toast />

        <!-- Winner Dialog -->
        <Dialog v-model:visible="successDialogVisible" modal :closable="false" :show-header="false" :show-footer="false"
            :style="{ backgroundColor: '#FFF', borderRadius: '15px !important' }"
            class="winner-dialog flex items-center justify-center audiowide-regular min-w-3xl pt-6">
            <div
                class="flex flex-col justify-between items-center gap-4 w-full h-full text-center text-[#080D88] relative">

                <div>
                    <h1 class="text-[#080D88] text-4xl uppercase mb-4">Congratulation</h1>
                    <h3 class="text-2xl uppercase">Winner is</h3>
                    <!-- <pre>{{ selectedCustomer }}</pre> -->
                </div>
                <div class="flex flex-col items-center gap-4 w-full max-w-2xl">
                    <p class="text-xl font-semibold uppercase bg-[#E5F2FF] p-2 px-4 inter-custom text-[#2E3192]">
                        {{ selectedCustomer?.shop_name }} | {{ selectedCustomer?.shop_township }}
                    </p>
                    <h1 class="text-4xl font-semibold">{{ selectedCustomer?.name }}</h1>
                    <p class="text-xl text-[#2E3192] inter-custom">
                        {{ selectedCustomer?.township }}
                    </p>
                    <p class="text-xl font-light text-[#2E3192] inter-custom">
                        {{ selectedCustomer?.nrc }}
                    </p>
                    <div class="relative w-full min-w-2xl mt-6">
                        <img :src="selectedPrize?.image" alt="prize"
                            class="w-30 object-contain absolute bottom-2 left-2" />
                        <h1
                            class="text-3xl inter-custom font-semibold text-white bg-[#000DFF] p-4 border border-[#3B43FF] text-shadow-lg ps-28 rounded-lg">
                            {{ selectedPrize?.name }} {{ selectedPrize?.color }}
                        </h1>
                    </div>
                </div>
                <div class="flex justify-center">
                    <div class="rounded-xl bg-gradient-to-r from-[#000DFF] via-[#f1f0f0] to-[#000DFF] p-[4px]">
                        <button type="button" @click="resetForNextRound"
                            class="w-[200px] h-14 flex items-center justify-center bg-gradient-to-r from-[#00047D] to-[#0008CE] rounded-lg cursor-pointer hover:opacity-90">
                            <span class="text-[21px] text-center font-light text-white uppercase audiowide-regular">
                                SPIN AGAIN
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>

    <!-- Winner Section -->
    <div v-if="winnerSection"
        class="flex flex-col items-center justify-start min-h-screen bg-contain bg-repeat-x bg-center"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <Winners :winners="winners" />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useToast } from "primevue/usetoast";
import bgImage from "@/assets/images/background.png";
import confetti from "canvas-confetti";
import { useLuckyDraw } from "@/composables/useLuckyDraw";
import SlotColumn from "@/components/SlotColumn.vue";
import Marquee from "@/components/Marquee.vue";
import Winners from "@/components/Winners.vue";

const CONFIG = {
    ITEM_HEIGHT: 200,
    ANIMATION_BASE_DURATION: 10000,
    VIRTUAL_COUNT: 1000,
    CONFETTI_DELAY: 250,
};
const confettiCanvas = ref(null);
const winners = ref([]);
const slots = ref([[], []]); // [customers, prizes]
const slotRefs = ref([null, null]);
const processing = ref(false);
const selectedCustomer = ref(null);
const selectedPrize = ref(null);
const successDialogVisible = ref(false);
const showNextBtn = ref(false);
const initialState = ref(true);
const remainingPrizes = ref([]);
const spinSection = ref(true);
const winnerSection = ref(false);

const toast = useToast();
const {
    virtualPrizes,
    virtualCustomers,
    fetchPrizes,
    fetchCustomers,
    shufflePrize,
    shuffleCustomer,
} = useLuckyDraw();

function setSlotRef(index, el) {
    slotRefs.value[index] = el;
}
function cancelSlotAnimations(slotEl) {
    if (!slotEl) return;
    slotEl.getAnimations?.().forEach((a) => a.cancel());
    slotEl.style.transform = "translateY(0)";
}
function animateSlot(slotEl, itemCount) {
    if (!slotEl) return;
    cancelSlotAnimations(slotEl);

    const totalDistance = itemCount * CONFIG.ITEM_HEIGHT - CONFIG.ITEM_HEIGHT;

    // Multi-phase slowdown: fast → medium → slow → stop
    const keyframes = [
        { transform: "translateY(0)", offset: 0 },
        { transform: `translateY(-${totalDistance * 0.7}px)`, offset: 0.6 }, // fast phase
        { transform: `translateY(-${totalDistance * 0.9}px)`, offset: 0.85 }, // slower
        { transform: `translateY(-${totalDistance}px)`, offset: 1 }, // final stop
    ];

    slotEl.animate(keyframes, {
        duration: CONFIG.ANIMATION_BASE_DURATION * 2, // slightly longer spin
        easing: "cubic-bezier(0.05, 0.9, 0.25, 1.0)", // strong ease-out curve
        fill: "forwards",
    });
}
const handleRoll = () => {
    if (processing.value) return;
    showNextBtn.value ? goToNextStep() : startSpinning();
};

async function spinPrize() {
    if (!virtualPrizes.value.length || !virtualCustomers.value.length) {
        processing.value = false;
        toast.add({
            severity: "warn",
            summary: "Cannot Spin",
            detail: "No more prizes or customers!",
            life: 5000,
        });
        return;
    }

    // Directly get the real prize (no virtuals, no animation)
    const realPrize = await shufflePrize();

    if (!realPrize) {
        processing.value = false;
        toast.add({
            severity: "error",
            summary: "Spin Error",
            detail: "Failed to fetch prize",
            life: 5000,
        });
        resetForNextRound();
        return;
    }

    // Show the real prize directly
    selectedPrize.value = {
        hash_id: realPrize.id,
        name: realPrize.name,
        image: realPrize.image?.url || "",
        color: realPrize.color || "",
    };

    // Display only the actual prize in the slot
    slots.value[1] = [selectedPrize.value];

    // Instantly show NEXT button
    showNextBtn.value = true;
    processing.value = false;
}


function goToNextStep() {
    processing.value = true;
    spinCustomerAfterPrize();
}

async function spinCustomerAfterPrize() {
    if (!virtualCustomers.value.length) {
        processing.value = false;
        toast.add({
            severity: "warn",
            summary: "Cannot Spin",
            detail: "No more customers!",
            life: 5000,
        });
        return;
    }
    const virtualCustomerList = virtualCustomers.value.slice(
        0,
        Math.min(CONFIG.VIRTUAL_COUNT, virtualCustomers.value.length)
    );
    slots.value[0] = virtualCustomerList;
    await nextTick();
    animateSlot(slotRefs.value[0], virtualCustomerList.length);
    const realCustomer = await shuffleCustomer(selectedPrize.value?.hash_id);
    if (!realCustomer) {
        processing.value = false;
        toast.add({
            severity: "error",
            summary: "Spin Error",
            detail: "Failed to fetch customer",
            life: 5000,
        });
        resetForNextRound();
        return;
    }
    setTimeout(() => {
        selectedCustomer.value = { ...realCustomer };
        slots.value[0].splice(-1, 1, selectedCustomer.value);
        setTimeout(() => {
            winners.value.push({
                customer: selectedCustomer.value.name,
                prize: selectedPrize.value,
            });
            successDialogVisible.value = true;
            launchConfetti();
        }, CONFIG.ANIMATION_BASE_DURATION * 2 + CONFIG.CONFETTI_DELAY);
    }, CONFIG.ANIMATION_BASE_DURATION / 10);
}

function resetForNextRound() {
    fetchCustomers();
    remainingPrizes.value = remainingPrizes.value.filter(
        (p) => p.hash_id !== selectedPrize.value.hash_id
    );
    slots.value = [[], []];
    selectedCustomer.value = null;
    selectedPrize.value = null;
    slotRefs.value.forEach(cancelSlotAnimations);
    successDialogVisible.value = false;
    processing.value = false;
    showNextBtn.value = false;
}

async function startSpinning() {
    if (processing.value) return;
    try {
        processing.value = true;
        await spinPrize();
    } catch (e) {
        console.error(e);
        toast.add({
            severity: "error",
            summary: "Spin Error",
            detail: "An error occurred during spinning",
            life: 5000,
        });
        processing.value = false;
    }
}

function launchConfetti() {
    if (!confettiCanvas.value) return;
    const myConfetti = confetti.create(confettiCanvas.value, {
        resize: true,
        useWorker: true,
    });

    // Initial center burst
    myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C']
    });

    // Side bursts
    setTimeout(() => {
        myConfetti({
            particleCount: 120,
            angle: 60,
            spread: 100,
            origin: { x: 0 },
            colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C']
        });
        myConfetti({
            particleCount: 120,
            angle: 120,
            spread: 100,
            origin: { x: 1 },
            colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C']
        });
    }, 250);

    // Additional bursts
    setTimeout(() => {
        myConfetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C']
        });
    }, 500);

    // Extra top bursts for more coverage over dialog
    setTimeout(() => {
        myConfetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.3, x: 0.5 },
            colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C']
        });
    }, 700);
}

watch(remainingPrizes, (newVal) => {
    if (newVal.length === 0) {
        toast.add({
            severity: "info",
            summary: "All Prizes Drawn",
            detail: "No more prizes left to draw.",
            life: 7000,
        });
        spinSection.value = false;
        winnerSection.value = true;
    }
});

onMounted(async () => {
    slots.value = [[], []];
    await Promise.all([fetchPrizes(), fetchCustomers()]);
    remainingPrizes.value = [...virtualPrizes.value];
});
</script>

<style scoped>
.lucky-img {
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.4s ease;
    border-radius: 1rem;

    /* Pulse animation */
    animation: pulse 2.5s infinite ease-in-out;
}

/* Press-down animation */
.lucky-img:active {
    transform: scale(0.92);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Disabled State */
.disabled-img {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none !important;
    transform: none !important;
    animation: none !important;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        filter: brightness(1);
    }

    50% {
        transform: scale(1.03);
        filter: brightness(1.15);
    }
}
</style>
