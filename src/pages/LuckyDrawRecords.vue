<template>
    <div>
        <DesktopLayout v-if="!isMobile">
            <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('lucky_draw_ticket') }}</h2>
            <!-- Table -->
            <div class="card mt-4">
                <DataTable dataKey="id" showGridlines :value="luckyDrawRecords" :loading="loading.table" scrollable
                    scrollDirection="both" scrollHeight="460px" tableStyle="min-width: 120rem">
                    <Column headerStyle="background-color: #2E3192; color: white; width:3rem" class="table-header"
                        header="#">
                        <template #body="slotProps">
                            {{ slotProps.index + 1 }}
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
                                <Button v-tooltip.top="'Details'"
                                    icon="pi pi-search" @click="goToDetail(data.id)" severity="success" outlined rounded />
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
import { onMounted, reactive, ref } from "vue";
import backend from "@/api/backend";
import helper from "@/helper";
import NotFound from "@/views/NotFound.vue";
import router from "@/router";

const isMobile = helper.isMobile()

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

const getLuckyDrawRecords = async () => {
    try {
        loading.table = true;
        const response = await backend.get("/lucky-draw/records", {
            params: {
                page: 1,
                status: 'pending'
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
    router.push(`/admin-panel/lucky-draw/${luckyDrawId}`)
}

onMounted(() => {
    getLuckyDrawRecords();
});

</script>

<style lang="scss" scoped></style>