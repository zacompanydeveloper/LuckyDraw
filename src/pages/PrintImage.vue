<template>
    <!-- PRINT WRAPPER -->
    <div v-if="reward" class="print-wrapper" ref="printArea">

        <!-- BACKGROUND -->
        <div class="absolute inset-0 -z-10 bg-cover bg-center" :style="{ backgroundImage: `url(${backgroundImg})` }">
        </div>

        <!-- Top Bar -->
        <div class="w-full flex justify-between absolute top-0 left-0 right-0 z-10">
            <img src="@/assets/images/SweetyHome.png" class="w-[260px] p-2">
            <img src="@/assets/images/30Years.png" class="w-[200px]">
        </div>

        <!-- Bottom Date -->
        <div class="w-full flex justify-end absolute items-end bottom-0 left-0 right-0 z-10 p-2 text-2xl font-bold audiowide-regular text-center"
            style="color: #ffffff;">
            <p>6 Dec 2025 (Saturday)</p>
        </div>

        <!-- CONTENT -->
        <div class="relative w-full min-h-screen flex justify-center items-center">

            <!-- LEFT SIDE -->
            <div class="w-full lg:w-1/3 h-full flex flex-col items-center justify-start mb-8 lg:mb-0">
                <div class="flex flex-1 items-center justify-center">

                    <!-- OKLAB SAFE CARD -->
                    <div class="relative w-[100vw] max-w-[300px] h-[100vw] max-h-[300px]
                        rounded-2xl shadow-lg border-6 rotate-45
                        flex justify-center items-center transition-all duration-700 border-[#0106A9]" style="
                          background: rgba(255,255,255,0.8);
                          box-shadow: 0 10px 25px rgba(255,255,255,0.2);
                        ">

                        <div class="-rotate-45 flex flex-col justify-center items-center text-center px-6">

                            <!-- IMAGE -->
                            <img :src="reward?.image || defaultPrizeImg"
                                class="w-[40vw] sm:w-[30vw] md:w-[180px] h-auto mx-auto prize-zoom" />

                            <!-- NAME -->
                            <h1
                                class="text-xl font-bold line-clamp-3 audiowide-regular text-center capitalize p-1 pb-2 px-4 prize-zoom mb-4 text-[#0106A9]">

                                <span v-if="isRewardNumber">
                                    {{ helper.priceFormat(reward.name) }} {{ $t("mmk") }}
                                </span>

                                <span v-else>
                                    {{ truncatedRewardName }}
                                </span>

                            </h1>

                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT SIDE -->
            <div class="w-full lg:w-2/3 flex flex-wrap justify-center items-start gap-2">

                <div v-for="(winner, i) in winners" :key="i" class="item-card flex items-center bg-white rounded-lg shadow-md border-2
                        overflow-hidden transition-all duration-300 border-[#080D88] z-[9999]" :class="winnerSizeClass">

                    <!-- INDEX -->
                    <div class="h-full flex items-center justify-center self-stretch" :class="winnerPadClass"
                        style="background: #080D88;">

                        <span class="font-bold whitespace-nowrap" :class="winnerTextSizeClass" style="color: #ffffff;">
                            {{ formatIndex(winner.start_index + i) }}
                        </span>
                    </div>

                    <!-- INFO -->
                    <div class="flex flex-col items-center justify-center w-full" :class="winnerContentSpacing">

                        <span
                            class="font-bold audiowide-regular px-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                            :class="winnerNameSizeClass" style="color: #080D88;">
                            {{ winner.name }}
                        </span>

                        <span
                            class="font-bold audiowide-regular px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                            :class="winnerRegionSizeClass" style="color: #080D88;">
                            {{ winner.region }}
                        </span>

                        <span class="text-center px-1" :class="winnerCompanySizeClass" style="color: #080D88;">
                            <span class="font-bold block truncate">
                                {{ winner.company_name }}
                            </span>
                            <span class="block truncate">
                                {{ winner.role }}
                            </span>
                        </span>

                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- <button @click="exportPNG"
        class="fixed bottom-4 right-4 z-20 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-lg">
        Download Image
    </button> -->

    <!-- LOADING -->
    <div v-if="loading" class="loading">
        Processing Print...
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import html2canvas from "html2canvas";
import backend from "@/api/backend";
import defaultPrizeImg from "@/assets/images/pz.png";
import helper from "@/helper";

const route = useRoute();
const router = useRouter();

const reward = ref(null);
const winners = ref([]);
const printArea = ref(null);
const loading = ref(true);

const backgroundImg =
    "https://0s3.sweetyhome.net.mm/shassets/sweety_home/images/sweetyhome_bg2.webp";

/* ========================
   COMPUTED
======================== */
const isRewardNumber = computed(() =>
    !isNaN(Number(reward.value?.name))
);

const truncatedRewardName = computed(() =>
    reward.value?.name?.length > 50
        ? reward.value.name.slice(0, 50) + "…"
        : reward.value?.name
);

/* ========================
   WINNER DYNAMIC CLASSES
======================== */
const winnerSizeClass = computed(() => {
    const t = winners.value.length;
    return t <= 3 ? "w-[48%] min-h-[25vw] sm:min-h-[140px]"
        : t <= 6 ? "w-[32%] min-h-[22vw] sm:min-h-[120px]"
            : t <= 14 ? "w-[32%] min-h-[20vw] sm:min-h-[100px]"
                : t <= 30 ? "w-[29%] min-h-[15vw] sm:min-h-[75px]"
                    : "w-[19%] min-h-[12vw] sm:min-h-[65px]";
});

const winnerPadClass = computed(() => {
    const t = winners.value.length;
    return t <= 3 ? "px-4"
        : t <= 6 ? "px-3"
            : t <= 14 ? "px-2"
                : t <= 30 ? "px-1.5"
                    : "px-1";
});

const winnerTextSizeClass = computed(() => {
    const t = winners.value.length;
    return t <= 3 ? "text-2xl"
        : t <= 14 ? "text-xl"
            : t <= 30 ? "text-base"
                : "text-sm";
});

const winnerContentSpacing = computed(() => {
    const t = winners.value.length;
    return t > 30 ? "py-1 gap-0"
        : t > 14 ? "py-2 gap-0.5"
            : "py-3 gap-1";
});

const winnerNameSizeClass = computed(() => {
    const t = winners.value.length;
    return t <= 3 ? "text-2xl"
        : t <= 6 ? "text-xl"
            : t <= 14 ? "text-lg"
                : "text-sm";
});

const winnerRegionSizeClass = computed(() => {
    const t = winners.value.length;
    return t <= 3 ? "text-base"
        : t <= 14 ? "text-sm"
            : "text-xs";
});

const winnerCompanySizeClass = computed(() => {
    const t = winners.value.length;
    return t <= 3 ? "text-base"
        : t <= 14 ? "text-sm"
            : "text-xs";
});

/* ========================
   METHODS
======================== */
const formatIndex = (num) => String(num).padStart(3, "0");

/* ========================
   FETCH DATA
======================== */
onMounted(fetchReward);

async function fetchReward() {
    try {
        const { data } = await backend.get(`/employees/prize/${route.params.id}`);
        reward.value = data.data;
        winners.value = data.data?.winners || [];
        loading.value = false;
    } catch (err) {
        console.error("API ERROR:", err);
        router.back();
    }
}

/* ========================
   CAPTURE & DOWNLOAD (OKLAB SAFE)
======================== */
const exportPNG = async () => {
    try {
        loading.value = true;
        // Wait for Vue DOM update
        await nextTick();

        // Wait a bit to ensure styles applied (if needed)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const captureElement = printArea.value;
        console.log('Capture element:', captureElement);

        // Generate canvas
        const canvas = await html2canvas(captureElement, {
            useCORS: true,
            allowTaint: true,
            scale: 3, // better resolution
        });

        const image = canvas.toDataURL("image/png");
        console.log('Generated Image Data URL:', image);

        // Trigger download
        const link = document.createElement("a");
        link.href = image;
        link.download = "winner.png";
        link.click();

        loading.value = false;
    } catch (error) {
        loading.value = false;
        console.error("Error exporting PNG:", error);
    }
};

</script>

<style scoped>
.loading {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.9);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    z-index: 50;
}
</style>
