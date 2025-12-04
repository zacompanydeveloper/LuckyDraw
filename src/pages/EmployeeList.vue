<template>
    <div class="relative w-full min-h-screen overflow-hidden flex flex-col items-center">
        <!-- FIXED BACKGROUND LAYER -->
        <div class="fixed inset-0 -z-10 bg-cover bg-center"
            style="background-image: url('https://0s3.sweetyhome.net.mm/shassets/sweety_home/images/sweetyhome_bg2.webp')">
        </div>

        <!-- Top Bar -->
        <div class="w-full flex justify-between absolute top-0 left-0 right-0 z-10">
            <img src="@/assets/images/SweetyHome.png" class="w-[260px] p-2">
            <h1 class="text-3xl md:text-4xl text-white font-bold audiowide-regular self-center">{{ $t('employee_list') }}</h1>
            <img src="@/assets/images/30Years.png" class="w-[200px]">
        </div>

        <!-- Bottom Bar with Date and Button -->
        <div
            class="w-full flex justify-between items-center absolute bottom-0 left-0 right-0 z-10 p-2 ps-8">
            <router-link to="/admin-panel/spin-luck-employee-draw"
                class="px-4 py-2 bg-gradient-to-r from-[#00047D] to-[#0008CE] hover:opacity-90 text-white rounded-lg audiowide-regular text-sm transition-all duration-300">
                Go to Draw
            </router-link>
            <p class="text-2xl text-white font-bold audiowide-regular">6 Dec 2025 (Saturday)</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center pt-20">
            <div class="text-white text-xl audiowide-regular">Loading...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="apiError" class="flex-1 flex flex-col items-center justify-center pt-20">
            <svg class="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-600 font-bold text-lg mt-4 audiowide-regular">Failed to Load Employees</p>
            <button @click="fetchEmployees"
                class="mt-4 px-6 py-2 bg-gradient-to-r from-[#00047D] to-[#0008CE] text-white rounded-lg audiowide-regular">
                Retry
            </button>
        </div>

        <!-- Employee List with Auto Scroll -->
        <div v-else ref="scrollContainer"
            class="w-full flex flex-wrap justify-center items-start content-start gap-2 mt-20 mb-12 px-4 overflow-y-auto h-[calc(100vh-8rem)] auto-scroll">
            <div v-for="(emp, i) in employees" :key="emp.id || i"
                class="item-card flex items-center bg-white rounded-lg shadow-md border-2 border-[#080D88] overflow-hidden transform transition-all duration-300"
                :class="[
                    employees.length <= 3 ? 'w-[48%] min-h-[25vw] sm:min-h-[140px]' :
                        employees.length <= 6 ? 'w-[32%] min-h-[22vw] sm:min-h-[120px]' :
                            employees.length <= 14 ? 'w-[32%] min-h-[20vw] sm:min-h-[100px]' :
                                employees.length <= 30 ? 'w-[29%] min-h-[15vw] sm:min-h-[75px]' :
                                    'w-[19%] min-h-[12vw] sm:min-h-[65px]'
                ]">

                <div class="bg-[#080D88] text-white h-full flex items-center justify-center self-stretch"
                    :class="employees.length <= 3 ? 'px-4' : employees.length <= 6 ? 'px-3' : employees.length <= 14 ? 'px-2' : employees.length <= 30 ? 'px-1.5' : 'px-1'">
                    <span
                        :class="employees.length <= 3 ? 'text-2xl' : employees.length <= 14 ? 'text-xl' : employees.length <= 30 ? 'text-base' : 'text-sm'"
                        class="font-bold whitespace-nowrap">
                        {{ (i + 1).toString().padStart(3, "0") }}
                    </span>
                </div>

                <div class="flex flex-col items-center justify-center w-full"
                    :class="employees.length > 30 ? 'py-1 gap-0' : employees.length > 14 ? 'py-2 gap-0.5' : 'py-3 gap-1'">
                    <span
                        class="text-[#080D88] font-bold audiowide-regular px-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        :class="employees.length <= 3 ? 'text-2xl' : employees.length <= 6 ? 'text-xl' : employees.length <= 14 ? 'text-lg' : employees.length <= 30 ? 'text-sm' : 'text-sm'">
                        {{ emp.name }}
                    </span>
                    <span
                        class="text-[#080D88] font-bold audiowide-regular px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        :class="employees.length <= 3 ? 'text-base' : employees.length <= 14 ? 'text-sm' : 'text-xs'">
                        {{ emp.region }}
                    </span>
                    <span class="text-[#080D88] text-center px-1"
                        :class="employees.length <= 3 ? 'text-base' : employees.length <= 14 ? 'text-sm' : 'text-xs'">
                        <span class="font-bold whitespace-nowrap overflow-hidden text-ellipsis block">{{
                            emp.company_name }}</span>
                        <span class="whitespace-nowrap overflow-hidden text-ellipsis block">{{ emp.role }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && !apiError && employees.length === 0"
            class="flex-1 flex items-center justify-center pt-20">
            <p class="text-white text-xl audiowide-regular">No employees found</p>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import backend from "@/api/backend";
import { useToast } from "primevue/usetoast";

const employees = ref([]);
const isLoading = ref(false);
const apiError = ref(false);
const toast = useToast();
const scrollContainer = ref(null);
let scrollInterval = null;
let scrollDirection = 1; // 1 = down, -1 = up

const fetchEmployees = async () => {
    isLoading.value = true;
    apiError.value = false;

    try {
        const { data } = await backend.get("/employees");

        if (!data?.data) {
            throw new Error("Employee data is empty");
        }

        employees.value = data.data;

        // Start auto scroll after data loads
        nextTick(() => {
            startAutoScroll();
        });
    } catch (err) {
        apiError.value = true;
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch employees.";

        toast.add({
            severity: "error",
            summary: "Fetch Error",
            detail: errorMessage,
            life: 5000
        });

        console.error("Employee fetch error:", err);
    } finally {
        isLoading.value = false;
    }
};

const startAutoScroll = () => {
    if (scrollInterval) clearInterval(scrollInterval);

    scrollInterval = setInterval(() => {
        if (!scrollContainer.value) return;

        const container = scrollContainer.value;
        const maxScroll = container.scrollHeight - container.clientHeight;

        // Change direction at boundaries
        if (container.scrollTop >= maxScroll) {
            scrollDirection = -1;
        } else if (container.scrollTop <= 0) {
            scrollDirection = 1;
        }

        container.scrollTop += scrollDirection * 1; // Scroll 1px at a time for smooth effect
    }, 30); // 30ms interval for smooth scrolling
};

const stopAutoScroll = () => {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
};

onMounted(() => {
    fetchEmployees();
});

onUnmounted(() => {
    stopAutoScroll();
});
</script>

<style scoped>
.item-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(8, 13, 136, 0.3);
    }
}

/* Hide Scrollbar */
.auto-scroll::-webkit-scrollbar {
    display: none;
}

.auto-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>
