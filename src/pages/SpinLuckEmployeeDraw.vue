<template>
    <!-- ROOT (bg-cover REMOVED from here) -->
    <div class="relative w-full min-h-screen overflow-hidden flex flex-col lg:flex-row justify-center items-center">

        <!-- FIXED BACKGROUND LAYER (THE ONLY REAL FIX) -->
        <div class="fixed inset-0 -z-10 bg-cover bg-center"
            style="background-image: url('https://0s3.sweetyhome.net.mm/shassets/sweety_home/images/sweetyhome_bg2.webp')">
        </div>

        <!-- FLOATING SOUND TOGGLE BUTTON -->
        <button @click="toggleSound" class="fixed bottom-0 left-0 z-[10000] w-10 h-10 flex items-center justify-center opacity-20
        hover:scale-110 transition-all duration-300 hover:opacity-100">
            <span class="text-2xl">
                {{ isSoundOn ? '🔊' : '🔇' }}
            </span>
        </button>

        <!-- Top Bar -->
        <div class="w-full flex justify-between absolute top-0 left-0 right-0 z-10">
            <img src="@/assets/images/SweetyHome.png" class="w-[260px] p-2">
            <img src="@/assets/images/30Years.png" class="w-[200px]">
        </div>

        <!-- Bottom Date -->
        <div
            class="w-full flex justify-end absolute items-end bottom-0 left-0 right-0 z-10 p-2 text-2xl text-white font-bold audiowide-regular text-center">
            <p>6 Dec 2025 (Saturday)</p>
        </div>

        <!-- INITIAL STATE -->
        <template v-if="initialState">
            <img src="https://0s3.sweetyhome.net.mm/shassets/sweety_home/images/sweetyhome_typ_emp.webp"
                alt="Lucky Draw" class="lucky-img w-xl cursor-pointer prize-zoom" @click.prevent="spinState()" />
        </template>

        <!-- MAIN DRAW STATE -->
        <template v-else>
            <!-- LEFT SIDE -->
            <div class="w-full lg:w-1/3 h-full flex flex-col items-center justify-start mb-8 lg:mb-0">
                <div class="flex flex-1 items-center justify-center">
                    <div class="relative bg-white/80 w-[100vw] max-w-[300px] h-[100vw] max-h-[300px]
                        rounded-2xl shadow-lg shadow-white/20 border-6 rotate-45
                        flex justify-center items-center transition-all duration-700"
                        :class="isSpecialPrize ? 'border-[#FFD700] special-prize-glow bg-amber-300' : 'border-[#0106A9]'">

                        <div class="-rotate-45 flex flex-col justify-center items-center text-center px-2 sm:px-4">
                            <transition name="fade-zoom" mode="out-in">
                                <div v-if="prizeLoaded && prize"
                                    class="flex flex-col justify-center items-center text-center px-6">
                                    <img :src="prize?.image || defaultPrizeImg"
                                        class="w-[40vw] sm:w-[30vw] md:w-[180px] h-auto mx-auto prize-zoom" />
                                    <h1 class="text-xl font-bold line-clamp-3 audiowide-regular text-center mx-auto capitalize p-1 pb-2 px-4 prize-zoom mb-4"
                                        :class="isSpecialPrize ? 'text-[#DAA520] special-prize-text' : 'text-[#080D88]'">
                                        <span v-if="!isNaN(Number(prize?.name))">
                                            {{ helper.priceFormat(prize.name) }} {{ $t("mmk") }}
                                        </span>
                                        <span v-else>
                                            {{ prize.name.length > 50 ? prize.name.slice(0, 50) + "…" : prize.name }}
                                        </span>
                                    </h1>
                                    <h1
                                        class="text font-bold audiowide-regular text-center mx-auto capitalize text-[#bb1d28] prize-zoom">
                                        <span>
                                            {{ prize.quantity }} {{ prize.quantity > 1 ? 'items' : 'item' }}
                                        </span>
                                    </h1>
                                </div>
                                <div v-else-if="apiError"
                                    class="flex flex-col justify-center items-center text-center px-6">
                                    <svg class="w-16 h-16 text-red-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="text-red-600 font-bold text-lg mt-4 audiowide-regular">Failed to Load
                                        Prize</p>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>

                <!-- START / RESET BUTTON -->
                <button @click="start" :disabled="isLoading" class="w-[60%] sm:w-[40%] md:w-[200px] h-12 md:h-14 flex items-center justify-center
                    rounded-lg cursor-pointer transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed fixed bottom-0 mb-6 md:mb-12" :class="apiError && clickStep === 1
                        ? 'bg-gradient-to-r from-[#DC3545] to-[#C82333] hover:from-[#C82333] hover:to-[#BD2130]'
                        : isSpecialPrize ? 'bg-gradient-to-r from-[#DAA520] to-[#B8860B] hover:from-[#FFD700] hover:to-[#DAA520]'
                            : 'bg-gradient-to-r from-[#00047D] to-[#0008CE] hover:opacity-90'">

                    <span class="text-[21px] font-light text-white uppercase audiowide-regular"
                        :class="isSpecialPrize ? 'special-prize-text' : ''">
                        {{ buttonText }}
                    </span>
                </button>
            </div>

            <!-- RIGHT SIDE: Winner List -->
            <transition-group name="list" tag="div"
                class="winner-scroll w-full lg:w-2/3 flex flex-wrap justify-center items-start gap-2">

                <div v-for="(p, i) in positioned" :key="i" class="item-card flex items-center bg-white rounded-lg shadow-md border-2
                    overflow-hidden transform transition-all duration-300" :class="[
                        { 'winner-flash': p.flash },
                        isSpecialPrize ? 'border-[#DAA520]' : 'border-[#080D88]',
                        positioned.length <= 3 ? 'w-[48%] min-h-[25vw] sm:min-h-[140px]' :
                            positioned.length <= 6 ? 'w-[32%] min-h-[22vw] sm:min-h-[120px]' :
                                positioned.length <= 14 ? 'w-[32%] min-h-[20vw] sm:min-h-[100px]' :
                                    positioned.length <= 30 ? 'w-[29%] min-h-[15vw] sm:min-h-[75px]' :
                                        'w-[19%] min-h-[12vw] sm:min-h-[65px]'
                    ]" :style="{ transitionDelay: i * 30 + 'ms' }">

                    <div class="h-full flex items-center justify-center self-stretch" :class="[
                        isSpecialPrize ? 'bg-[#DAA520]' : 'bg-[#080D88]',
                        positioned.length <= 3 ? 'px-4' : positioned.length <= 6 ? 'px-3' : positioned.length <= 14 ? 'px-2' : positioned.length <= 30 ? 'px-1.5' : 'px-1'
                    ]">
                        <span :class="[
                            isSpecialPrize ? 'special-prize-text' : 'text-white',
                            positioned.length <= 3 ? 'text-2xl' : positioned.length <= 14 ? 'text-xl' : positioned.length <= 30 ? 'text-base' : 'text-sm'
                        ]" class="font-bold whitespace-nowrap">
                            {{ (p.start_index + i).toString().padStart(3, "0") }}
                        </span>
                    </div>

                    <div class="flex flex-col items-center justify-center w-full"
                        :class="positioned.length > 30 ? 'py-1 gap-0' : positioned.length > 14 ? 'py-2 gap-0.5' : 'py-3 gap-1'">
                        <span
                            class="text-[#080D88] font-bold audiowide-regular px-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                            :class="positioned.length <= 3 ? 'text-2xl' : positioned.length <= 6 ? 'text-xl' : positioned.length <= 14 ? 'text-lg' : positioned.length <= 30 ? 'text-sm' : 'text-sm'">
                            {{ p.name }}
                        </span>
                        <span
                            class="text-[#080D88] font-bold audiowide-regular px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                            :class="positioned.length <= 3 ? 'text-base' : positioned.length <= 14 ? 'text-sm' : 'text-xs'">
                            {{ p.region }}
                        </span>
                        <span class="text-[#080D88] text-center px-1"
                            :class="positioned.length <= 3 ? 'text-base' : positioned.length <= 14 ? 'text-sm' : 'text-xs'">
                            <span class="font-bold whitespace-nowrap overflow-hidden text-ellipsis block">{{
                                p.company_name }}</span>
                            <span class="whitespace-nowrap overflow-hidden text-ellipsis block">{{ p.role }}</span>
                        </span>
                    </div>
                </div>
            </transition-group>

            <!-- Confetti -->
            <canvas ref="confettiCanvas"
                class="pointer-events-none w-full h-full fixed bottom-0 right-0 left-0 top-0 z-[9999]">
            </canvas>

            <Toast />
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import defaultPrizeImg from "@/assets/images/pz.png";
import backend from "@/api/backend";
import confetti from "canvas-confetti";
import { useToast } from "primevue/usetoast";
import helper from "@/helper";
import sound_1 from "@/assets/sounds/sound_1.mp3";
import sound_2 from "@/assets/sounds/sound_2.mp3";
import sound_3 from "@/assets/sounds/sound_3.mp3";
import sound_4 from "@/assets/sounds/sound_4.mp3";


const initialState = ref(true);
const positioned = ref([]);
const prize = ref(null);
const prizeLoaded = ref(false);
const isLoading = ref(false);
const clickStep = ref(1);
const virtualWinners = ref([]);
const toast = useToast();
const confettiCanvas = ref(null);
const apiError = ref(false);
const retryCount = ref(0);
const MAX_RETRIES = 2;
const isSoundOn = ref(false);

/* ---------------- SPECIAL PRIZES ---------------- */
const SPECIAL_PRIZE_NAMES = ['1000000', '2000000', '3000000'];

const isSpecialPrize = computed(() => {
    return prize.value?.name && SPECIAL_PRIZE_NAMES.includes(String(prize.value.name));
});

/* ---------------- API ---------------- */

const apiFetchPrize = async () => {
    try {
        const { data } = await backend.get("/employees/get-prize");

        if (!data?.data) {
            throw new Error("Prize data is empty");
        }

        apiError.value = false;
        retryCount.value = 0;
        return data.data;
    } catch (err) {
        apiError.value = true;
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch prize.";

        toast.add({
            severity: "error",
            summary: "Prize Fetch Error",
            detail: errorMessage,
            life: 5000
        });

        console.error("Prize fetch error:", err);
        return null;
    }
};

const apiFetchWinners = async () => {
    try {
        if (!prize.value?.id) {
            throw new Error("Prize ID is missing");
        }

        const { data } = await backend.get("/employees/get-winners", {
            params: { reward_id: prize.value.id }
        });

        virtualWinners.value = data?.virtual_winners || [];

        if (!data?.data || data.data.length === 0) {
            throw new Error("No winners found");
        }

        return data.data;
    } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch winners.";

        toast.add({
            severity: "error",
            summary: "Winners Fetch Error",
            detail: errorMessage,
            life: 5000
        });

        console.error("Winners fetch error:", err);
        return [];
    }
};

/* ---------------- PRIZE LOAD ---------------- */

async function loadPrize() {
    prizeLoaded.value = false;
    apiError.value = false;

    const fetchedPrize = await apiFetchPrize();

    if (!fetchedPrize) {
        prize.value = null;
        return false;
    }

    prize.value = fetchedPrize;

    // Smooth transition with delay
    await new Promise(resolve => setTimeout(resolve, 300));
    prizeLoaded.value = true;

    return true;
}

/* ---------------- RETRY LOGIC ---------------- */

async function retryLoadPrize() {
    if (retryCount.value >= MAX_RETRIES) {
        toast.add({
            severity: "error",
            summary: "Max Retries Reached",
            detail: "Please try again later or contact support.",
            life: 5000
        });
        return false;
    }

    retryCount.value++;

    return await loadPrize();
}

/* ---------------- MAIN BUTTON ---------------- */

async function start() {
    if (isLoading.value) return;

    isLoading.value = true;

    // STEP 1: LOAD PRIZE
    if (clickStep.value === 1) {
        toggleSound(true); // Turn on sound on spin start

        const success = await loadPrize();

        // If prize fetch fails, don't proceed to step 2
        if (!success) {
            // Offer retry option
            const shouldRetry = retryCount.value < MAX_RETRIES;

            if (shouldRetry) {
                const retrySuccess = await retryLoadPrize();

                if (retrySuccess) {
                    clickStep.value = 2;
                }
            }

            isLoading.value = false;
            return;
        }

        // Only proceed to step 2 if prize loaded successfully
        clickStep.value = 2;
        isLoading.value = false;
        return;
    }

    // STEP 2: SLOW-SPIN + WINNER
    if (clickStep.value === 2) {
        const winners = await apiFetchWinners();

        if (!winners || winners.length === 0) {
            toast.add({
                severity: "warn",
                summary: "No Winners",
                detail: "No winner data available for this prize.",
                life: 4000
            });
            isLoading.value = false;
            return;
        }

        if (!virtualWinners.value || virtualWinners.value.length === 0) {
            toast.add({
                severity: "error",
                summary: "Virtual Winners Missing",
                detail: "Cannot start animation without virtual winners data.",
                life: 4000
            });
            isLoading.value = false;
            return;
        }

        const sortedWinners = winners.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        positioned.value = [];

        for (let i = 0; i < sortedWinners.length; i++) {
            // More spins for single winner to increase suspense
            const totalSpins = isSpecialPrize.value ? 300 : 100;

            for (let s = 0; s < totalSpins; s++) {
                const progress = s / totalSpins;

                // Smooth progressive delay
                let delay = 30;
                if (progress > 0.6) delay = 80;
                if (progress > 0.8) delay = 150;
                if (progress > 0.92) delay = 300;
                if (progress > 0.99) delay = 400;

                const virtual = virtualWinners.value[
                    Math.floor(Math.random() * virtualWinners.value.length)
                ];

                positioned.value[i] = {
                    ...virtual,
                    start_index: sortedWinners[i].start_index,
                    flash: false,
                };

                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            // REAL WINNER REVEAL
            positioned.value[i] = {
                ...sortedWinners[i],
                flash: true,
            };

            setTimeout(() => {
                if (positioned.value[i]) {
                    positioned.value[i].flash = false;
                }
            }, 2000);

            await new Promise((resolve) => setTimeout(resolve, 600));
            launchConfetti();
        }

        clickStep.value = 3;
        isLoading.value = false;
        return;
    }

    // STEP 3: RESET
    toggleSound(false); // Turn off sound on reset
    positioned.value = [];
    prize.value = null;
    prizeLoaded.value = false;
    apiError.value = false;
    retryCount.value = 0;
    clickStep.value = 1;
    isLoading.value = false;
}

/* ---------------- BUTTON TEXT ---------------- */

const buttonText = computed(() => {
    if (isLoading.value) return "Loading...";
    if (apiError.value && clickStep.value === 1) return "Retry";
    return clickStep.value < 3 ? "START" : "RESET";
});

let balloon = confetti.shapeFromText({ text: '🎈' });
let star = confetti.shapeFromText({ text: '⭐' });
let money = confetti.shapeFromText({ text: '💰' });
let sparkle = confetti.shapeFromText({ text: '✨' });

/* ---------------- CONFETTI ---------------- */
function launchConfetti() {
    if (isSpecialPrize.value) {
        launchSpecialConfetti();
        return;
    }
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
            colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C'],
            shapes: [balloon],
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
            colors: ['#000DFF', '#343EFF', '#FFFFFF', '#2E3192', '#080D88', '#FFD700', '#FFA500', '#FF0000', '#DC143C'],
            shapes: [balloon],
        });
    }, 700);
}

/* ---------------- SPECIAL CONFETTI (for 1M, 2M, 3M prizes) ---------------- */
function launchSpecialConfetti() {
    if (!confettiCanvas.value) return;
    const myConfetti = confetti.create(confettiCanvas.value, {
        resize: true,
        useWorker: true,
    });

    const goldColors = ['#FFD700', '#FFA500', '#FFDF00', '#F0E68C', '#DAA520', '#B8860B', '#FFE135', '#FFFFFF'];

    // Massive initial gold burst
    myConfetti({
        particleCount: 250,
        spread: 120,
        origin: { y: 0.5 },
        colors: goldColors,
        shapes: [star, money, sparkle],
        scalar: 1.2,
    });

    // Continuous golden rain effect
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
        myConfetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors: goldColors,
            shapes: [star, money],
        });
        myConfetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors: goldColors,
            shapes: [star, money],
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };
    frame();

    // Multiple side bursts with gold theme
    setTimeout(() => {
        myConfetti({
            particleCount: 200,
            angle: 60,
            spread: 100,
            origin: { x: 0 },
            colors: goldColors,
            shapes: [balloon, star, money],
            scalar: 1.3,
        });
        myConfetti({
            particleCount: 200,
            angle: 120,
            spread: 100,
            origin: { x: 1 },
            colors: goldColors,
            shapes: [balloon, star, money],
            scalar: 1.3,
        });
    }, 300);

    // Top golden shower
    setTimeout(() => {
        myConfetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0, x: 0.5 },
            colors: goldColors,
            shapes: [sparkle, star],
            gravity: 0.8,
            scalar: 1.5,
        });
    }, 600);

    // Extra golden bursts
    setTimeout(() => {
        myConfetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: goldColors,
            shapes: [money, star],
            scalar: 1.4,
        });
    }, 900);

    // Final grand burst
    setTimeout(() => {
        myConfetti({
            particleCount: 300,
            spread: 180,
            origin: { y: 0.5, x: 0.5 },
            colors: goldColors,
            shapes: [star, money, sparkle, balloon],
            scalar: 1.5,
        });
    }, 1200);
}

// ---------------- RANDOM SOUND POOL ----------------

const soundPool = [
    new Audio(sound_1),
    new Audio(sound_2),
    new Audio(sound_3),
    new Audio(sound_4),
];

// Set common settings
soundPool.forEach((audio) => {
    audio.loop = false;   // set true if you want loop
    audio.volume = 0.7;  // adjust 0.0 - 1.0
});

function playRandomSound() {
    try {
        // Stop all sounds first (safety)
        soundPool.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });

        // Pick random index
        const randomIndex = Math.floor(Math.random() * soundPool.length);

        // Play random sound
        soundPool[randomIndex].play();
    } catch (e) {
        console.warn("Random sound blocked:", e);
    }
}

function stopAllRandomSounds() {
    soundPool.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
    });
}

function toggleSound(forceState = null) {
    // If parameter is passed, force that state
    if (typeof forceState === "boolean") {
        isSoundOn.value = forceState;
    } else {
        // Otherwise normal toggle
        isSoundOn.value = !isSoundOn.value;
    }

    if (isSoundOn.value) {
        playRandomSound();
    } else {
        stopAllRandomSounds();
    }
}

function spinState() {
    initialState.value = false;
    toggleSound(false); // Turn off sound on spin start
}

</script>

<style scoped>
/* Loading Spinner */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

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

/* Prize Animation - Smoother transitions */
.fade-zoom-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-zoom-leave-active {
    transition: all 0.3s ease-out;
}

.fade-zoom-enter-from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
}

.fade-zoom-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

.fade-zoom-enter-to,
.fade-zoom-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
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

/* Prize Zoom In / Zoom Out Effect */
@keyframes prizeZoom {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.08);
    }

    100% {
        transform: scale(1);
    }
}

.prize-zoom {
    animation: prizeZoom 2s ease-in-out infinite;
}

/* Special Prize Golden Glow Effect */
@keyframes goldenGlow {

    0%,
    100% {
        box-shadow:
            0 0 10px #FFD700,
            0 0 20px #FFA500,
            0 0 30px #FFD700,
            inset 0 0 10px rgba(255, 215, 0, 0.3);
    }

    50% {
        box-shadow:
            0 0 20px #FFD700,
            0 0 30px #FFA500,
            0 0 40px #FFD700,
            inset 0 0 20px rgba(255, 215, 0, 0.5);
    }
}

.special-prize-glow {
    animation: goldenGlow 1.5s ease-in-out infinite;
    border-width: 8px !important;
}

/* Special Prize Text Shimmer Effect */
@keyframes textShimmer {
    0% {
        background-position: -200% center;
    }

    100% {
        background-position: 200% center;
    }
}

.special-prize-text {
    background: linear-gradient(90deg,
            #FFD700 0%,
            #DAA520 25%,
            #FFFFFF 60%,
            #DAA520 75%,
            #FFD700 100%);

    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    animation: textShimmer 10s linear infinite;
    font-size: 1.5rem !important;

    -webkit-text-stroke: 0.5px #DAA520;
    /* dark gold border */
}
</style>
