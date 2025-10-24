<template>
    <div>
        <!-- Mobile view -->
        <NotFound v-if="isMobile" />
        <!-- Desktop view -->
        <div v-else>
            <DesktopLayout>
                <!-- Page Content -->
                <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('sms_records') }}</h2>
                <div class="flex justify-between items-center mt-2">
                    <!-- filters -->
                    <div class="flex gap-3">
                        <FloatLabel variant="on">
                            <DatePicker v-model="fromDate" dateFormat="dd-mm-yy" inputId="from_date" showIcon
                                iconDisplay="input" />
                            <label for="from_date">{{ $t('from_date') }}</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <DatePicker v-model="toDate" dateFormat="dd-mm-yy" inputId="to_date" showIcon
                                iconDisplay="input" />
                            <label for="to_date">{{ $t('to_date') }}</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <InputText id="search" v-model="search" autocomplete="off" />
                            <label for="search">{{ $t('search') }}</label>
                        </FloatLabel>
                        <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left"
                            :label="$t('search')" severity="success" raised class="cursor-pointer  w-35" />
                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div>
                    <div class=" flex">
                        <Button v-can="'export-lucky-draw'" type="button" v-tooltip.top="$t('export')" iconPos="right"
                            icon="pi pi-download" @click="exportData" raised style="background-color: #2E3192;" />
                    </div>
                </div>
                <!-- Table -->
                <div class="card mt-5 mb-10">
                    <DataTable dataKey="id" showGridlines stripedRows :value="smsRecords" :loading="loading.table"
                        scrollable scrollHeight="460px" tableStyle="min-width: 50rem">

                        <Column :header="$t('no')" headerStyle="width:3rem; background-color: #2E3192; color: white;">
                            <template #body="slotProps">
                                {{ pagination.from + slotProps.index }}
                            </template>
                        </Column>

                        <Column headerStyle="background-color: #2E3192; color: white;" field="created_at"
                            :header="$t('created_date_time')" />

                        <Column headerStyle="background-color: #2E3192; color: white;" field="phone"
                            :header="$t('phone_number')" />

                        <Column headerStyle="background-color: #2E3192; color: white;" field="type"
                            :header="$t('sms_type')">
                            <template #body="slotProps">
                                {{ slotProps.data.type === 'lucky_draw_link' ? $t('registration_link') :
                                    $t('successful')
                                }}
                            </template>
                        </Column>

                        <Column headerStyle="background-color: #2E3192; color: white;" field="sms_poh_id"
                            :header="$t('message_id')" />

                        <Column headerStyle="background-color: #2E3192; color: white;" field="amount"
                            :header="$t('amount_kyats')" />

                        <!-- Action column -->
                        <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('action')"
                            class="w-24 !text-end">
                            <template #body="{ data }">
                                <div class="flex justify-center items-center gap-2">
                                    <Button
                                        v-tooltip.top="$t('check_sms_status')" icon="pi pi-eye" severity="success"
                                        @click.prevent="checkSmsStatus(data.id)" rounded />
                                </div>
                            </template>
                        </Column>

                        <ColumnGroup type="footer" class=" font-bold mt-4">
                            <Row>
                                <Column :footer="$t('totals_kyats')" :colspan="5" footerStyle="text-align:left" />
                                <Column :colspan="2" :footer="totalAmount" />
                            </Row>
                        </ColumnGroup>


                        <!-- Empty state -->
                        <template #empty>
                            <div class="p-4 text-center text-gray-500">
                                {{ $t('no_records_found') }}
                            </div>
                        </template>
                    </DataTable>

                    <Paginator class="mt-1" :rows="pagination.rows" :totalRecords="pagination.totalRecords"
                        @page="onPageChange" />
                    <Toast />

                    <Dialog v-model:visible="checkSmsStatusVisible" modal header="Check SMS Status">
                        <div v-if="smsStatus">
                            <div v-for="(value, key) in smsStatus" :key="key"
                                class="flex justify-between items-center gap-4 border-b border-slate-200 py-4">
                                <span class="font-medium capitalize">{{ $t(key) }}</span>

                                <span class="px-3 py-1 rounded text-sm font-semibold" :class="{
                                    'bg-green-100 text-green-700': value === 'Success',
                                    'bg-red-100 text-red-700': value === 'Failed',
                                    'bg-gray-100 text-gray-700': value !== 'Success' && value !== 'Failed'
                                }">
                                    <template v-if="value === 'Success'">✅ {{ value }}</template>
                                    <template v-else-if="value === 'Failed'">❌ {{ value }}</template>
                                    <template v-else>{{ value }}</template>
                                </span>
                            </div>
                        </div>

                        <div v-else>
                            <p class="text-gray-500">No SMS status data available.</p>
                        </div>
                    </Dialog>


                </div>
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import backend from "@/api/backend";
import helper from "@/helper";
import NotFound from "@/views/NotFound.vue";
import DesktopLayout from "@/layouts/DesktopLayout.vue";
import { useToast } from "primevue";

const { t } = useI18n();
const isMobile = helper.isMobile()
const fromDate = ref(null);
const toDate = ref(null);
const search = ref(null);
const type = ref('daily');
const totalAmount = ref(0);
const selectedId = ref(null);
const toast = useToast();
const checkSmsStatusVisible = ref(false);
const smsStatus = ref(null);

const smsRecords = ref([]);
const loading = reactive({
    table: false,
});

const pagination = reactive({
    totalRecords: 0,
    rows: 10,
    page: 1,
    from: 1,
});

const getSmsRecords = async (page = 1) => {
    try {
        loading.table = true;
        const response = await backend.get("/lucky-draw-sms", {
            params: {
                from_date: fromDate.value,
                to_date: toDate.value,
                search: search.value,
                type: type.value,
                page: page,
            },
        });
        if (response.status === 200) {
            smsRecords.value = response.data?.data;
            totalAmount.value = response.data?.total_amount;

            // Update pagination info
            pagination.totalRecords = response.data?.meta.total;
            pagination.page = response.data?.meta.current_page;
            pagination.rows = response.data?.meta.per_page;
            pagination.from = response.data?.meta.from;
            loading.table = false;
        }

    } catch (error) {
        console.error("Error fetching SMS records:", error);
        loading.table = false;
        toast.add({ severity: 'error', summary: t('error'), detail: t('failed_fetch_sms'), life: 3000 });
    }
};

// Pagination
const onPageChange = (event) => {
    pagination.page = event.page + 1;
    getSmsRecords(pagination.page);
};

const searchProduct = () => {
    pagination.page = 1;
    getSmsRecords();
};

const clearFilters = () => {
    fromDate.value = null;
    toDate.value = null;
    search.value = null;
    type.value = 'daily';
    pagination.page = 1;
    getSmsRecords();
};

const exportData = async () => {
    try {
        loading.table = true;
        const { data, status } = await backend.get("/lucky-draw-sms/export", {
            params: {
                from_date: fromDate.value || null,
                to_date: toDate.value || null,
                search: search.value || null,
            },
        });
        if (status === 200) {
            const url = data.url
            const link = document.createElement('a')
            link.href = url
            link.download = ''
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    } catch (error) {
        console.error("Error exporting data:", error);
        toast.add({ severity: "error", summary: t('error'), detail: error.response?.data?.message || t('error_occurred'), life: 5000 });
    } finally {
        loading.table = false;
    }
};

const checkSmsStatus = async (id) => {
    try {
        loading.table = true;
        const { data, status } = await backend.get(`/lucky-draw-sms/${id}/status`);
        if (status === 200) {
            smsStatus.value = data;
            checkSmsStatusVisible.value = true;
        }
    } catch (error) {
        console.error("Error checking SMS status:", error);
        toast.add({ severity: "error", summary: t('error'), detail: error.response?.data?.message || t('error_occurred'), life: 5000 });
    } finally {
        loading.table = false;
    }
};

onMounted(() => {
    getSmsRecords();
});


</script>


<style lang="scss" scoped></style>
