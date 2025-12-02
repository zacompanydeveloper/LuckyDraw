<template>
    <div class="w-full min-h-screen flex flex-col lg:flex-row justify-center items-center 
           bg-gradient-to-b from-blue-50 to-white p-6 lg:p-12" :style="{ backgroundImage: `url(${bgImage})` }">

        <!-- LEFT SIDE -->
        <div class="w-full lg:w-1/3 h-full flex flex-col items-center justify-start mb-8 lg:mb-0">

            <div class="flex flex-1 items-center justify-center">

                <!-- Prize box (Responsive square) -->
                <div class="relative w-[100vw] max-w-[300px] h-[100vw] max-h-[300px] 
                 rounded-2xl inset-shadow-sm inset-shadow-[#FFFFFF1A] 
                 border-6 border-[#0106A9] rotate-45 flex justify-center items-center 
                 transition-all duration-700">

                    <div class="-rotate-45 flex flex-col justify-center items-center text-center px-2 sm:px-4">

                        <!-- Prize content with smooth fade -->
                        <transition name="fade-zoom" mode="out-in">
                            <div v-if="prizeLoaded" class="flex flex-col justify-center items-start text-center px-6">

                                <!-- Prize Image (Responsive) -->
                                <img v-if="prize?.image" :src="prize?.image"
                                    class="w-[40vw] sm:w-[30vw] md:w-[180px] h-auto mx-auto" />

                                <img v-else src="@/assets/images/pz.png"
                                    class="w-[40vw] sm:w-[30vw] md:w-[180px] h-auto mx-auto" alt="">

                                <!-- Prize Name -->
                                <h1
                                    class="text-xl font-bold text-blue-700 line-clamp-3 audiowide-regular text-center mx-auto capitalize p-1 pb-2 mb-4">
                                    <template v-if="prize?.name">
                                        <span v-if="!isNaN(Number(prize.name))">
                                            {{ helper.priceFormat(prize.name) }} {{ $t("mmk") }}
                                        </span>
                                        <span v-else>
                                            {{ prize?.name?.length > 50
                                                ? prize.name.slice(0, 50) + "…"
                                            : prize.name
                                            }}
                                        </span>
                                    </template>
                                </h1>

                            </div>
                        </transition>
                    </div>
                </div>
            </div>

            <!-- BUTTON (Responsive) -->
            <button @click="start" :disabled="isLoading" class="w-[60%] sm:w-[40%] md:w-[200px] h-12 md:h-14
               flex items-center justify-center bg-gradient-to-r from-[#00047D] to-[#0008CE]
               rounded-lg cursor-pointer hover:opacity-90 
               disabled:opacity-50 disabled:cursor-not-allowed fixed bottom-0 mb-6 md:mb-12">
                <span class="text-[21px] font-light text-white uppercase audiowide-regular">
                    {{ buttonText }}
                </span>
            </button>

        </div>

        <!-- RIGHT SIDE WINNER LIST -->
        <transition-group name="list" tag="div"
            class="w-full lg:w-2/3 flex flex-wrap justify-center items-center gap-4 max-h-[85vh] overflow-y-auto">

            <div v-for="(p, i) in positioned" :key="i" class="item-card flex items-center bg-white rounded shadow-md border border-[#080D88] 
               overflow-hidden w-full sm:w-auto 
               h-[20vw] sm:h-[70px] transform" :style="{ transitionDelay: i * 50 + 'ms' }">

                <div class="bg-[#080D88] text-white h-full flex items-center justify-center px-2 text-lg font-bold">
                    {{ (p.start_index + i).toString().padStart(3, '0') }}
                </div>

                <div class="flex flex-col px-8 items-center justify-center py-2 w-full">
                    <span class="text-[#080D88] font-bold text-lg truncate audiowide-regular px-2">
                        {{ p.name }}
                    </span>
                    <span class="text-[#080D88] font-bold text-xs truncate audiowide-regular px-2">
                        {{ p.region }}
                    </span>
                    <span class="text-[#080D88] truncate text-xs">
                        <span class=" font-bold">{{ p.company_name }}</span>-{{ p.role }}
                    </span>
                </div>

            </div>
        </transition-group>

        <Toast />
    </div>
</template>


<script setup>
import { ref, computed } from "vue";
import bgImage from '@/assets/svg/bg.svg'
import backend from "@/api/backend";
import helper from "@/helper";
import { useToast } from "primevue/usetoast";

const positioned = ref([]);
const prize = ref(null);
const prizeLoaded = ref(false);
const toast = useToast();

const isLoading = ref(false);
const clickStep = ref(1); // 1 = fetch prize, 2 = fetch winner, 3 = reset

//Real API calls 
const apiFetchPrize = async () => {
    try {
        const response = await backend.get('/employees/get-prize');
        return response?.data?.data;
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Something went wrong while fetching prize.",
            life: 4000
        });
        return null;
    }
};

const apiFetchWinners = async () => {
    try {
        const response = await backend.get('/employees/get-winners', {
            params: { reward_id: prize.value?.id }
        });
        return response?.data?.data || [];
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Something went wrong while fetching winners.",
            life: 4000
        });
        return [];
    }
};

// Load prize animation
async function loadPrize() {
    prizeLoaded.value = false;
    prize.value = await apiFetchPrize();
    setTimeout(() => prizeLoaded.value = true, 200);
}

// Button actions
async function start() {
    if (isLoading.value) return;
    isLoading.value = true;

    if (clickStep.value === 1) {
        await loadPrize();
        clickStep.value = 2;
        isLoading.value = false;
        return;
    }

    if (clickStep.value === 2) {
        const winnerList = await apiFetchWinners();
        if (winnerList.length > 0) {
            positioned.value = winnerList.map(w => ({ ...w, drop: false }));
            setTimeout(() => positioned.value = positioned.value.map(w => ({ ...w, drop: true })), 200);
        }
        clickStep.value = 3;
        isLoading.value = false;
        return;
    }

    if (clickStep.value === 3) {
        positioned.value = [];
        prize.value = null;
        prizeLoaded.value = false;
        clickStep.value = 1;
        isLoading.value = false;
    }
}

// Button text
const buttonText = computed(() => {
    if (isLoading.value) return "Loading...";
    if (clickStep.value === 1 || clickStep.value === 2) return "START";
    return "RESET";
});
</script>

<style>
/* Prize fade + zoom */
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

/* Winner list smooth drop + fade */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
}

.list-enter-to,
.list-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}
</style>
