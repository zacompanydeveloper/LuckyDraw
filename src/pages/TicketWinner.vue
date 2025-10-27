<template>
    <div>
        <DesktopLayout v-if="!isMobile">

            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('ticket_winner') }}</h2>
                <Button type="button" v-tooltip.top="$t('download_winners_list')"
                    iconPos="right" icon="pi pi-download" @click="exportData" raised
                    style="background-color: #2E3192;" />
            </div>
            <!-- Table -->
            <div class="card mt-2">
                <DataTable class="mt-2" dataKey="id" showGridlines stripedRows :value="winners" :loading="loading.table"
                    scrollable scrollDirection="both" scrollHeight="500px" tableStyle="min-width: 150rem">

                    <Column headerStyle="background-color: #2E3192; color: white; width:3rem" class="table-header"
                        :header="$t('no')">
                        <template #body="slotProps">
                            {{ pagination.from + slotProps.index }}
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="created_at" :header="$t('created_date')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('prizes')">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <img :src="slotProps.data?.prize?.image?.url" :alt="slotProps.data?.prize?.id"
                                    class="w-10 rounded" />
                                <span>{{ slotProps.data?.prize?.name }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="customer_name" :header="$t('customer')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="phone"
                        :header="$t('customer_phone')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="tracking_code" :header="$t('gift_code')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="shop_name" :header="$t('shop')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="business_type" :header="$t('business_type')">
                        <template #body="slotProps">
                            {{ $t(slotProps.data.business_type) }}
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="serial_code" :header="$t('serial_code')" />

                    <template #empty>
                        <div class="p-4 text-center text-gray-500">
                            {{ $t('no_records_found') }}
                        </div>
                    </template>
                </DataTable>

                <Paginator class="mt-1" :rows="pagination.rows" :totalRecords="pagination.totalRecords"
                    @page="onPageChange" />
            </div>

        </DesktopLayout>
        <div v-else>
            <NotFound />
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import helper from "@/helper";
import backend from "@/api/backend";
import NotFound from "@/views/NotFound.vue";

const toast = useToast();
const { t } = useI18n();

const isMobile = helper.isMobile();

const winners = ref([]);
const loading = reactive({
    table: false,
});
const pagination = reactive({
    page: 1,
    rows: 10,
    totalRecords: 0,
    from: 0,
});

const fetchWinnerData = async (page = 1) => {
    try {
        loading.table = true;
        const response = await backend.get('/lucky-draw-tickets/ticket-winners', {
            params: {
                page
            }
        });
        console.log('Winner Data:', response.data);
        winners.value = response.data.data;
        // Update pagination info

        pagination.totalRecords = response.data?.meta.total;
        pagination.page = response.data?.meta.current_page;
        pagination.rows = response.data?.meta.per_page;
        pagination.from = response.data?.meta.from;

    } catch (error) {
        console.error('Error fetching winner data:', error);
    }
    finally {
        loading.table = false;
    }
};

const onPageChange = (event) => {
    pagination.page = event.page + 1; // PrimeVue Paginator is zero-based
    fetchWinnerData(pagination.page);
};

const exportData = async () => {
    try {
        loading.table = true;
        const { data, status } = await backend.get("/lucky-draw-tickets/ticket-winners/export");
        if (status === 200) {
            const url = data.url;
            const link = document.createElement('a');
            link.href = url;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.add({
                severity: "success",
                summary: t('success'),
                detail: t('export_successful'),
                life: 3000
            });
        }
    } catch (error) {
        console.error("Error exporting data:", error);
        toast.add({
            severity: "error",
            summary: t('error'),
            detail: error.response?.data?.message || t('error_occurred'),
            life: 5000
        });
    } finally {
        loading.table = false;
    }
};

onMounted(() => {
    fetchWinnerData();
});
</script>

<style lang="scss" scoped></style>