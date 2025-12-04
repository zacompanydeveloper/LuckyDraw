<template>
    <div class="w-full min-h-screen flex flex-col lg:flex-row justify-center items-center bg-contain bg-center bg-repeat-x"
        :style="{ backgroundImage: `url(${bgImage})` }">
        <!-- Top Bar -->
        <div v-if="initialState" class="w-full flex justify-between absolute top-0 left-0 right-0 z-10">
            <img src="@/assets/images/SweetyHome.png" alt="" srcset="" class=" w-[260px] p-2">
            <img src="@/assets/images/30Years.png" alt="" srcset="" class=" w-[200px]">
        </div>

        <!-- Bottom Date -->
        <div
            class="w-full flex justify-end absolute items-end bottom-0 left-0 right-0 z-10 p-2 text-2xl text-white font-bold audiowide-regular text-center">
            <p>6 Dec 2025 (Saturday)</p>
        </div>

        <!-- INITIAL STATE -->
        <template v-if="initialState">
            <img src="@/assets/images/typ_emp.png" alt="Lucky Draw" class="lucky-img w-xl cursor-pointer"
                @click.prevent="initialState = false" />
        </template>

        <!-- MAIN DRAW STATE -->
        <template v-else>
            <!-- LEFT SIDE: Prize + Button -->
            <div class="w-full lg:w-1/3 h-full flex flex-col items-center justify-start mb-8 lg:mb-0">
                <div class="flex flex-1 items-center justify-center">
                    <!-- PRIZE BOX -->
                    <div
                        class="relative bg-white/40 w-[100vw] max-w-[300px] h-[100vw] max-h-[300px] rounded-2xl shadow-lg shadow-white/20 border-6 border-[#0106A9] rotate-45 flex justify-center items-center transition-all duration-700">
                        <div class="-rotate-45 flex flex-col justify-center items-center text-center px-2 sm:px-4">
                            <!-- Prize Content -->
                            <transition name="fade-zoom" mode="out-in">
                                <div v-if="prizeLoaded"
                                    class="flex flex-col justify-center items-center text-center px-6">
                                    <img :src="prize?.image || defaultPrizeImg"
                                        class="w-[40vw] sm:w-[30vw] md:w-[180px] h-auto mx-auto" />
                                    <h1
                                        class="text-xl font-bold text-[#080D88] line-clamp-3 audiowide-regular text-center mx-auto capitalize p-1 pb-2 mb-4">
                                        <span v-if="!isNaN(Number(prize?.name))">
                                            {{ helper.priceFormat(prize.name) }} {{ $t("mmk") }}
                                        </span>
                                        <span v-else>
                                            {{ prize.name.length > 50 ? prize.name.slice(0, 50) + "…" : prize.name }}
                                        </span>
                                    </h1>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>

                <!-- START / RESET BUTTON -->
                <button @click="start" :disabled="isLoading"
                    class="w-[60%] sm:w-[40%] md:w-[200px] h-12 md:h-14 flex items-center justify-center bg-gradient-to-r from-[#00047D] to-[#0008CE] rounded-lg cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed fixed bottom-0 mb-6 md:mb-12">
                    <span class="text-[21px] font-light text-white uppercase audiowide-regular">
                        {{ buttonText }}
                    </span>
                </button>
            </div>

            <!-- RIGHT SIDE: Winner List -->
            <transition-group name="list" tag="div"
                class="winner-scroll w-full lg:w-2/3 flex flex-wrap justify-center items-start gap-1 max-h-[85vh] overflow-y-auto">
                <div v-for="(p, i) in positioned" :key="i"
                    class="item-card flex items-center bg-white rounded shadow-md border border-[#080D88] overflow-hidden w-[32%] h-[20vw] sm:h-[80px] transform"
                    :class="{ 'winner-flash': p.flash }" :style="{ transitionDelay: i * 30 + 'ms' }">
                    <div class="bg-[#080D88] text-white h-full flex items-center justify-center px-2 text-lg font-bold">
                        {{ (p.start_index + i).toString().padStart(3, "0") }}
                    </div>
                    <div class="flex flex-col items-center justify-center py-2 w-full">
                        <span class="text-[#080D88] font-bold text-lg truncate audiowide-regular px-2">
                            {{ p.name }}
                        </span>
                        <span class="text-[#080D88] font-bold text-xs truncate audiowide-regular px-2">
                            {{ p.region }}
                        </span>
                        <span class="text-[#080D88] truncate text-xs text-center px-2">
                            <span class="font-bold">{{ p.company_name }}</span><br>{{ p.role }}
                        </span>
                    </div>
                </div>
            </transition-group>

            <Toast />
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import bgImage from "@/assets/images/bg_emp.png";
import defaultPrizeImg from "@/assets/images/pz.png";
import backend from "@/api/backend";
import helper from "@/helper";
import { useToast } from "primevue/usetoast";

const initialState = ref(true);
const positioned = ref([]);
const prize = ref(null);
const prizeLoaded = ref(false);
const isLoading = ref(false);
const clickStep = ref(1);
const virtualWinners = ref([]);
const toast = useToast();

// --------------------
// API Calls
// --------------------
const apiFetchPrize = async () => {
    try {
        const { data } = await backend.get("/employees/get-prize");
        return data?.data || null;
    } catch (err) {
        toast.add({ severity: "error", summary: "Error", detail: err?.response?.data?.message || "Failed to fetch prize.", life: 4000 });
        return null;
    }
};

const apiFetchWinners = async () => {
    try {
        const { data } = await backend.get("/employees/get-winners", { params: { reward_id: prize.value?.id } });
        virtualWinners.value = data?.virtual_winners || [];
        return data?.data || [];
    } catch (err) {
        toast.add({ severity: "error", summary: "Error", detail: err?.response?.data?.message || "Failed to fetch winners.", life: 4000 });
        return [];
    }
};

// --------------------
// Prize Loader
// --------------------
async function loadPrize() {
    prizeLoaded.value = false;
    prize.value = await apiFetchPrize();
    setTimeout(() => (prizeLoaded.value = true), 200);
}

// --------------------
// Main Button Logic
// --------------------
async function start() {
    if (isLoading.value) return;
    isLoading.value = true;

    // STEP 1: Load Prize
    if (clickStep.value === 1) {
        await loadPrize();
        clickStep.value = 2;
        isLoading.value = false;
        return;
    }

    // STEP 2: Spin + Reveal Winners
    if (clickStep.value === 2) {
        const winners = await apiFetchWinners();
        if (!winners.length) {
            toast.add({ severity: "warn", summary: "No Winners", detail: "No winner data found.", life: 3000 });
            isLoading.value = false;
            return;
        }

        const sortedWinners = winners.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        positioned.value = [];

        // Spin animation
        for (let i = 0; i < sortedWinners.length; i++) {
            for (let s = 0; s < 40; s++) {
                const virtual = virtualWinners.value[Math.floor(Math.random() * virtualWinners.value.length)];
                positioned.value[i] = { ...virtual, start_index: sortedWinners[i].start_index, flash: false };
                await new Promise((res) => setTimeout(res, 50)); // faster spin
            }
            positioned.value[i] = { ...sortedWinners[i], flash: true };
            setTimeout(() => (positioned.value[i].flash = false), 2000);
            await new Promise((res) => setTimeout(res, 300)); // faster reveal
        }

        clickStep.value = 3;
        isLoading.value = false;
        return;
    }

    // STEP 3: RESET
    positioned.value = [];
    prize.value = null;
    prizeLoaded.value = false;
    clickStep.value = 1;
    isLoading.value = false;
}

// --------------------
// Button Text
// --------------------
const buttonText = computed(() => {
    if (isLoading.value) return "Loading...";
    return clickStep.value < 3 ? "START" : "RESET";
});
</script>

<style scoped>
/* Winner Flash Animation */
@keyframes flashGlow {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.winner-flash {
    animation: flashGlow 0.7s ease-out;
    border-color: #080d88 !important;
}

/* Prize Animation */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: all 0.6s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.fade-zoom-enter-to,
.fade-zoom-leave-from {
    opacity: 1;
    transform: scale(1);
}

/* Winner list animation */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(-40px) scale(0.95);
    /* slide from top */
}

.list-enter-to,
.list-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* Hide Scrollbar */
.winner-scroll::-webkit-scrollbar {
    display: none;
}

.winner-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>
