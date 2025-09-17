<template>
    <div>
        <DesktopLayout v-if="!isMobile">
            <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('lucky_draw_ticket') }}</h2>
            <!-- Table -->
            <div class="card mt-4">
                <div class="flex justify-center">
                    <SelectButton v-model="filterMode" optionLabel="label" dataKey="label"
                        class="border border-gray-200 my-2" :options="filterOptions" />
                </div>
                <DataTable dataKey="id" showGridlines :value="luckyDrawRecords" :loading="loading.table" scrollable
                    scrollDirection="both" scrollHeight="460px" tableStyle="min-width: 120rem">
                    <Column headerStyle="background-color: #2E3192; color: white; width:3rem" class="table-header"
                        header="#">
                        <template #body="slotProps">
                            {{ pagination.from + slotProps.index + 1 }}
                        </template>
                    </Column>
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="created_at" header="Created Date" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="customer_name" header="Customer" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="phone"
                        header="Customer Phone" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="shop_name" header="Shop" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="business_type" header="Business Type" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="tracking_code" header="Gift Code" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="serial_code" header="Serial Code" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="status"
                        header="Status" />

                    <Column headerStyle="background-color: #2E3192; color: white;" header="Action"
                        class="w-24 table-header" :headerStyle="{ textAlign: 'right' }">
                        <template #body="{ data }">
                            <div class="flex justify-end items-center gap-2">
                                <Button v-tooltip.top="'Details'" icon="pi pi-search" @click="goToDetail(data.id)"
                                    severity="success" outlined rounded />
                            </div>
                        </template>
                    </Column>

                    <template #empty>
                        <div class="p-4 text-center text-gray-500">
                            No records found.
                        </div>
                    </template>
                </DataTable>

                <Paginator class="mt-1" :rows="pagination.rows" :totalRecords="pagination.totalRecords"
                    @page="onPageChange" />
                <Toast />
            </div>
        </DesktopLayout>
        <div v-else>
            <NotFound />
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import backend from "@/api/backend";
import helper from "@/helper";
import NotFound from "@/views/NotFound.vue";

const isMobile = helper.isMobile()
const filterOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Used', value: 'used' }
];
const filterMode = ref(filterOptions[0]);

watch(filterMode, () => {
    getLuckyDrawRecords(1);
});

const luckyDrawRecords = ref([]);
const loading = reactive({
    table: false,
});

const pagination = reactive({
    page: 1,
    totalRecords: 0,
    rows: 10,
    from: 0,
});

const getLuckyDrawRecords = async (page = 1) => {
    try {
        loading.table = true;
        const response = await backend.get("/lucky-draw/records", {
            params: {
                page: page,
                status: filterMode.value.value,
            },
        });
        if (response.status === 200) {
            luckyDrawRecords.value = response.data?.data;

            // Update pagination info
            pagination.totalRecords = response.data?.meta.total;
            pagination.page = response.data?.meta.current_page;
            pagination.rows = response.data?.meta.per_page;
            pagination.from = response.data?.meta.from;

            loading.table = false;
        }
    } catch (error) {
        console.error("Error fetching lucky draw records:", error);
        loading.table = false;
    }
};

const goToDetail = (luckyDrawId) => {

}

const onPageChange = (event) => {
    pagination.page = event.page + 1; // PrimeVue Paginator is zero-based
    getLuckyDrawRecords(pagination.page);
};

onMounted(() => {
    getLuckyDrawRecords();
});

</script>

<style lang="scss" scoped></style>