<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <div class="min-h-screen bg-contain bg-x-repeat bg-y-no-repeat"
                :style="{ backgroundImage: `url(${bgImage})` }">
                <!-- Header -->
                <header class="w-full flex justify-center items-center shadow-xl py-5">
                    <img src="@/assets/svg/logo.svg" alt="logo" class="w-60" />
                </header>

                <!-- Main -->
                <main class="px-[5%] mt-10">
                    <h1 class="text-2xl font-bold text-[#2E3192]">Pre-Print Code</h1>
                    <div class="flex justify-between items-center mt-2">
                        -
                        <Button type="button" iconPos="right" label="Create" @click="openDialog('right')"
                            class="cursor-pointer hover:opacity-90" style="background-color: #2E3192;">
                            <i class="pi pi-download" ></i>
                        </Button>
                    </div>

                    <!-- Table -->
                    <div class="card mt-5 mb-10">
                        <div class="flex justify-center mb-6">
                            <SelectButton v-model="filterMode" optionLabel="label" dataKey="label"
                                :options="filterOptions" />
                        </div>
                        <DataTable paginator :rows="7" dataKey="id" :value="codes" :loading="loading" scrollable
                            scrollHeight="550px" tableStyle="min-width: 50rem">
                            <Column header="#" headerStyle="width:3rem">
                                <template #body="slotProps">
                                    {{ slotProps.index + 1 }}
                                </template>
                            </Column>
                            <Column field="created_at" header="Created Date" />
                            <Column field="product" header="Name" />
                            <Column field="tracking_code" header="Code" />
                            <Column field="status" header="Status" />
                            <Column class="w-24 !text-end" header="Action" :headerStyle="{ textAlign: 'right' }">
                                <template #body="{ data }">
                                    <div class="flex justify-end items-center gap-2">
                                        <Button v-tooltip.top="'Approve'" icon="pi pi-check"
                                            @click="goToDetails(data.id)" severity="success" rounded />
                                        <Button v-tooltip.top="'Reject'" icon="pi pi-times" @click="downloadFile(data)"
                                            severity="warn" rounded />
                                    </div>
                                </template>
                            </Column>
                            <template #empty>
                                <div class="p-4 text-center text-gray-500">
                                    No records found.
                                </div>
                            </template>
                        </DataTable>

                        <Toast />
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import helper from "@/helper"
import NotFound from "@/views/NotFound.vue"
import bgImage from "@/assets/svg/bg.svg"
import backend from "@/api/backend"
import { useRoute } from "vue-router"

const isMobile = helper.isMobile()
const route = useRoute()
const codes = ref([])
const loading = ref(false)

const filterOptions = [
    { label: 'InActive', value: 'inactive' },
    { label: 'Active', value: 'active' },
    { label: 'Used', value: 'used' },
    { label: 'Rejected', value: 'rejected' },
]
const filterMode = ref({ label: 'InActive', value: 'inactive' });

onMounted(() => {
    fetchProductDetails(route.params.id)
})

const fetchProductDetails = async (productId) => {
    try {
        loading.value = true
        const { data, status } = await backend.get(`/preprint-products/${productId}`, {
            'status': filterMode.value.value
        })
        if (status === 200) {
            console.log("here =>", data.data);
            codes.value = data.data
        }
    } catch (error) {
        console.error('Fetch details failed:', error)
    } finally {
        loading.value = false
    }
}

watch(filterMode, (newVal) => {
    fetchProductDetails(route.params.id)
})


</script>

<style lang="scss" scoped></style>