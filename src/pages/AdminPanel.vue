<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <DesktopLayout>
                <!-- Loading Spinner (Centered) -->
                <div v-if="loading" class="flex items-center justify-center h-[70vh]">
                    <Loading />
                </div>

                <!-- Dashboard Content -->
                <div class="p-4 mx-auto max-w-2xl" v-else>
                    <h1 class="text-3xl text-center font-bold text-[#2E3192] my-10">
                        Lucky Draw Dashboard
                    </h1>
                    <div class="grid grid-cols-2 gap-4">
                        <div v-for="(stat, index) in dashboardStats" :key="index"
                            class="bg-white text-[#2E3192] rounded-lg shadow-md p-6 px-8 border border-gray-200">
                            <div class="flex items-center justify-between gap-2 mb-4">
                                <i :class="stat.icon" style="font-size: 30px"></i>
                                <h2 class="text-3xl">{{ formatNumber(stat.value) }}</h2>
                            </div>
                            <p>{{ $t(stat.label) }}</p>
                        </div>
                    </div>
                </div>
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import NotFound from "@/views/NotFound.vue"
import DesktopLayout from "@/layouts/DesktopLayout.vue"
import Loading from "@/components/Loading.vue" // <— add this
import helper from "@/helper"
import backend from "@/api/backend"
import { onMounted, ref } from "vue"

// detect mobile
const isMobile = helper.isMobile()

// loading state
const loading = ref(false)

// dashboard stats reactive array
const dashboardStats = ref([
    { icon: 'pi pi-file-edit', value: 0, label: 'lucky_draw_ticket' },
    { icon: 'pi pi-print', value: 0, label: 'pre_print_code' },
    { icon: 'pi pi-envelope', value: 0, label: 'sms_records' },
    { icon: 'pi pi-trophy', value: 0, label: 'prizes' }
])

// format numbers to 1K, 1.5M etc.
const formatNumber = (num) => {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num
}

// Fetch real data from API (dummy for now)
const fetchDashboardStats = async () => {
    loading.value = true
    try {
        const response = await backend.get('/admin/dashboard-stats')
        if (response && response.data) {
            dashboardStats.value[0].value = response.data.luckyDrawTickets || 0
            dashboardStats.value[1].value = response.data.prePrintCodes || 0
            dashboardStats.value[2].value = response.data.smsRecords || 0
            dashboardStats.value[3].value = response.data.prizes || 0
        }
        loading.value = false
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
    }
}

onMounted(() => {
    fetchDashboardStats()
})
</script>
