<template>
    <div>
        <!-- Mobile view -->
        <NotFound v-if="isMobile" />
        <!-- Desktop view -->
        <div v-else>
            <DesktopLayout>
                <!-- Page Content -->
                <h2 class="text-2xl font-bold text-[#2E3192]">Pre-Print Code</h2>
                <div class="flex justify-between items-center mt-2">
                    <!-- filters -->
                    <div class="flex gap-3">
                        <FloatLabel variant="on">
                            <DatePicker v-model="fromDate" dateFormat="dd-mm-yy" inputId="from_date" showIcon
                                iconDisplay="input" />
                            <label for="from_date">From Date</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <DatePicker v-model="toDate" dateFormat="dd-mm-yy" inputId="to_date" showIcon
                                iconDisplay="input" />
                            <label for="to_date">To Date</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <InputText id="search" v-model="search" autocomplete="off" />
                            <label for="search">Search</label>
                        </FloatLabel>
                        <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left" label="Search"
                            severity="success" raised class="cursor-pointer  w-35" />
                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div>
                </div>
                <!-- Table -->
                <div class="card mt-5 mb-10">
                    <DataTable dataKey="id" stripedRows :value="smsRecords" :loading="loading.table" scrollable
                        scrollHeight="460px" tableStyle="min-width: 50rem">

                        <Column header="#" headerStyle="width:3rem; background-color: #2E3192; color: white;">
                            <template #body="slotProps">
                                {{ pagination.from + slotProps.index }}
                            </template>
                        </Column>

                        <Column headerStyle="background-color: #2E3192; color: white;" field="created_at"
                            header="Created Date & Time" />

                        <Column headerStyle="background-color: #2E3192; color: white;" field="phone"
                            header="Phone Number" />

                        <Column headerStyle="background-color: #2E3192; color: white;" field="type" header="SMS Type">
                            <template #body="slotProps">
                                {{ slotProps.data.type === 'lucky_draw_link' ? 'Registration Link' : 'Successful'
                                }}
                            </template>
                        </Column>

                        <Column headerStyle="background-color: #2E3192; color: white;" field="amount"
                            header="Amount (Kyats)" />

                        <Column headerStyle="background-color: #2E3192; color: white;" field="sms_poh_id"
                            header="Message ID" />

                        <!-- Action column -->
                        <Column headerStyle="background-color: #2E3192; color: white;" header=" Action"
                            class="w-24 !text-end" :headerStyle="{ textAlign: 'right' }">
                            <template #body="{ data }">
                                <div class="flex justify-end items-center gap-2">
                                    <Button v-if="data.type === 'lucky_draw_link'" v-tooltip.top="'Retry'"
                                        icon="pi pi-replay" @click="openRetryDialog(data.id)" severity="success"
                                        rounded />
                                </div>
                            </template>
                        </Column>

                        <ColumnGroup type="footer" class=" font-bold mt-4">
                            <Row>
                                <Column footer="Totals (Kyats)" :colspan="5" footerStyle="text-align:left" />
                                <Column :colspan="2" :footer="totalAmount" footerStyle="text-align:center" />
                            </Row>
                        </ColumnGroup>


                        <!-- Empty state -->
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

            <!-- Retry Dialog -->
            <Dialog v-model:visible="retryVisible" header="Retry SMS" modal>
                <div class="p-4">
                    <p>Are you sure you want to retry sending this SMS?</p>
                </div>
                <template #footer>
                    <Button label="Cancel" icon="pi pi-times" @click="retryVisible = false" />
                    <Button label="Retry" icon="pi pi-check" severity="success" @click="retrySms(selectedId)" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import backend from "@/api/backend";
import helper from "@/helper";
import NotFound from "@/views/NotFound.vue";
import DesktopLayout from "@/layouts/DesktopLayout.vue";
import { useToast } from "primevue";

const isMobile = helper.isMobile()
const fromDate = ref(null);
const toDate = ref(null);
const search = ref(null);
const type = ref('daily');
const totalAmount = ref(0);
const selectedId = ref(null);
const retryVisible = ref(false);
const toast = useToast();

const smsRecords = ref([]);
const loading = ref({
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
        loading.value.table = true;
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
            loading.value.table = false;
        }

    } catch (error) {
        console.error("Error fetching SMS records:", error);
        loading.value.table = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch SMS records', life: 3000 });
    }
};

// Pagination
const onPageChange = (event) => {
    pagination.page = event.page + 1;
    getSmsRecords(pagination.page);
};

const openRetryDialog = (id) => {
    selectedId.value = id;
    retryVisible.value = true;
};

const retrySms = async (id) => {
    try {
        const response = await backend.post(`lucky-draw/retry-sms/${id}`);
        if (response.status === 200) {
            retryVisible.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: 'SMS retried successfully', life: 3000 });
        }
    } catch (error) {
        console.error("Error retrying SMS:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to retry SMS', life: 3000 });
    }finally {
        retryVisible.value = false;
        getSmsRecords(pagination.page);
    }
};

onMounted(() => {
    getSmsRecords();
});


</script>


<style lang="scss" scoped></style>
