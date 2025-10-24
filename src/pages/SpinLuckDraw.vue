<template>
    <!-- Spin Section -->
    <div v-if="spinSection"
        class="flex flex-col items-center justify-center min-h-screen bg-contain bg-repeat-x bg-center"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <!-- Initial Start Screen -->
        <div v-if="initialState" class="w-full px-[5%] flex flex-col items-center gap-16">
            <h1 class="text-5xl text-center text-white audiowide-regular uppercase">
                Thadingyut Lucky Draw
            </h1>
            <button
                class="rounded-xl h-full bg-gradient-to-r from-[#000DFF] via-[#343EFF] to-[#FFFFFF] p-[5px] cursor-pointer transition-transform duration-300 hover:scale-101 hover:shadow-lg disabled:cursor-not-allowed"
                :disabled="virtualPrizes.length === 0 || virtualCustomers.length === 0"
                :aria-disabled="virtualPrizes.length === 0 || virtualCustomers.length === 0"
                @click.prevent="initialState = false">
                <div
                    class="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#00047D] to-[#0008CE] rounded-lg hover:from-[#0015A8] hover:to-[#001FFF]">
                    <h1 class="text-xl text-white uppercase audiowide-regular p-4">
                        START Lucky Draw
                    </h1>
                </div>
            </button>
        </div>

        <!-- Spin Screen -->
        <div v-else class="rounded-md w-full px-[5%]">
            <!-- Marquee -->
            <Marquee :items="remainingPrizes" />

            <!-- Slots -->
            <div class="grid grid-cols-2 gap-6 mb-16">
                <SlotColumn :items="slots[1]" :slotIndex="1" :setSlotRef="setSlotRef" type="prize" />
                <SlotColumn :items="slots[0]" :slotIndex="0" :setSlotRef="setSlotRef" type="customer" />
            </div>

            <!-- Roll Button -->
            <div class="flex justify-center">
                <div class="rounded-xl bg-gradient-to-r from-[#000DFF] via-[#343EFF] to-[#FFFFFF] p-[4px]">
                    <button type="button" :disabled="processing" @click="handleRoll" :aria-disabled="processing"
                        class="w-[200px] h-14 flex items-center justify-center bg-gradient-to-r from-[#00047D] to-[#0008CE] rounded-lg cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed">
                        <span class="text-[21px] text-center font-light text-white uppercase audiowide-regular">
                            {{ showNextBtn ? "NEXT" : "START SPIN" }}
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Confetti -->
        <canvas ref="confettiCanvas"
            class="pointer-events-none w-full h-full fixed bottom-6 right-0 left-0 top-0"></canvas>

        <Toast />

        <!-- Winner Dialog -->
        <Dialog v-model:visible="successDialogVisible" modal :closable="false" :show-header="false" :show-footer="false"
            :style="{ backgroundColor: '#FFF', borderRadius: '5px !important' }"
            class="winner-dialog flex items-center justify-center audiowide-regular min-w-3xl pt-6">
            <div class="flex flex-col justify-between items-center gap-4 w-full h-full text-center text-[#080D88]">
                <div>
                    <h1 class="text-[#080D88] text-5xl uppercase mb-4">Congratulation</h1>
                    <h3 class="text-3xl uppercase">Winner is</h3>
                </div>
                <div class="flex flex-col items-center gap-4 w-full max-w-2xl">
                    <p class="text-2xl font-semibold uppercase bg-[#E5F2FF] p-2 px-4 inter-custom text-[#2E3192]">
                        {{ selectedCustomer?.shop_name }}
                    </p>
                    <h1 class="text-4xl font-semibold">{{ selectedCustomer?.name }}</h1>
                    <p class="text-xl font-light text-[#2E3192] inter-custom">
                        {{ selectedCustomer?.nrc }}
                    </p>
                    <div class="relative w-full min-w-2xl mt-6">
                        <img :src="selectedPrize?.image" alt="prize"
                            class="w-34 h-34 object-contain absolute bottom-2" />
                        <h1
                            class="text-3xl inter-custom font-semibold text-white bg-[#000DFF] p-4 border border-[#3B43FF] text-shadow-lg ps-28">
                            {{ selectedPrize?.name }}
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
        class="flex flex-col items-center justify-center min-h-screen bg-contain bg-repeat-x bg-center"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <Winners :winners="winners" />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useToast } from "primevue/usetoast";
import bgImage from "@/assets/svg/slot_bg.svg";
import confetti from "canvas-confetti";
import { useLuckyDraw } from "@/composables/useLuckyDraw";
import SlotColumn from "@/components/SlotColumn.vue";
import Marquee from "@/components/Marquee.vue";
import Winners from "@/components/Winners.vue";

const CONFIG = {
    ITEM_HEIGHT: 150,
    ANIMATION_BASE_DURATION: 6000,
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
    slotEl.animate(
        [
            { transform: "translateY(0)" },
            {
                transform: `translateY(-${itemCount * CONFIG.ITEM_HEIGHT - CONFIG.ITEM_HEIGHT}px)`,
            },
        ],
        {
            duration: CONFIG.ANIMATION_BASE_DURATION,
            fill: "forwards",
            easing: "ease-out",
        }
    );
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
    const virtualPrizeList = virtualPrizes.value.slice(
        0,
        Math.min(CONFIG.VIRTUAL_COUNT, virtualPrizes.value.length)
    );
    slots.value[1] = virtualPrizeList;
    await nextTick();
    animateSlot(slotRefs.value[1], virtualPrizeList.length);
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
    setTimeout(() => {
        selectedPrize.value = {
            hash_id: realPrize.id,
            name: realPrize.name,
            image: realPrize.image?.url || "",
        };
        slots.value[1].splice(-1, 1, selectedPrize.value);
        setTimeout(() => {
            showNextBtn.value = true;
            processing.value = false;
        }, CONFIG.ANIMATION_BASE_DURATION / 1.5);
    }, CONFIG.ANIMATION_BASE_DURATION / 4);
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
        }, CONFIG.ANIMATION_BASE_DURATION);
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
    myConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    setTimeout(() => {
        myConfetti({
            particleCount: 120,
            angle: 60,
            spread: 100,
            origin: { x: 0 },
        });
        myConfetti({
            particleCount: 120,
            angle: 120,
            spread: 100,
            origin: { x: 1 },
        });
    }, 250);
    setTimeout(() => {
        myConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }, 500);
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
