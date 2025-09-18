<template>
    <div>
        <DesktopLayout v-if="!isMobile">
            <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('lucky_draw_ticket') }}</h2>

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

                    <FloatLabel variant="on">
                        <Select class="w-[200px] border border-gray-200" v-model="businessType" optionLabel="label"
                            dataKey="label" :options="businessTypeOptions" />
                        <label for="businessType">Business Type</label>
                    </FloatLabel>

                    <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left" label="Search"
                        severity="success" raised class="cursor-pointer  w-35" />
                    <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                        style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                </div>
            </div>

            <!-- Table -->
            <div class="card mt-2">
                <div class="flex justify-center">
                    <SelectButton v-model="filterMode" optionLabel="label" dataKey="label"
                        class="border border-gray-200 my-2" :options="filterOptions" />
                </div>
                <DataTable dataKey="id" showGridlines :value="luckyDrawRecords" :loading="loading.table" scrollable
                    scrollDirection="both" scrollHeight="460px" tableStyle="min-width: 80rem">
                    <Column headerStyle="background-color: #2E3192; color: white; width:3rem" class="table-header"
                        header="No.">
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
                        field="business_type" header="Business Type" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="serial_code" header="Serial Code" />
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="status"
                        header="Status" />

                    <Column headerStyle="background-color: #2E3192; color: white;" header="Action"
                        class="w-24 table-header" :headerStyle="{ textAlign: 'right' }">
                        <template #body="{ data }">
                            <div class="flex justify-center items-center">
                                <Button v-tooltip.top="'Details'" icon="pi pi-search" @click="getDetail(data.id)"
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

                <!-- Detail Dialog -->
                <Dialog v-model:visible="detailDialog" header="Lucky Draw Activation List Detail"
                    :style="{ width: '30rem', height: '100%', color: '#2E3192' }" :modal="true" :draggable="false"
                    position="right">
                    <div class="space-y-4 min-h-[700px]">
                        <!-- Voucher No -->
                        <div>
                            <label class="block text-gray-700 mb-1">{{ $t('voucher_no') }}</label>
                            <div class="bg-indigo-50 rounded-md px-4 py-2 text-gray-800">
                                {{ record.invoice_no }}
                            </div>
                        </div>

                        <!-- Amount -->
                        <div>
                            <label class="block text-gray-700 mb-1">{{ $t('amount') }}</label>
                            <div class="bg-indigo-50 rounded-md px-4 py-2 text-gray-800"
                                :class="{ 'text-red-500': !record.amount }">
                                {{ helper.priceFormat(record.amount) || '-' }} Ks
                            </div>
                        </div>

                        <!-- Name -->
                        <div>
                            <label class="block text-gray-700 mb-1">{{ $t('name') }}</label>
                            <div class="bg-indigo-50 rounded-md px-4 py-2 text-gray-800"
                                :class="{ 'text-red-500': !record.customer_name }">
                                {{ record.customer_name || '-' }}
                            </div>
                        </div>

                        <!-- Phone Number -->
                        <div>
                            <label class="block text-gray-700 mb-1">{{ $t('phone_number') }}</label>
                            <div class="bg-indigo-50 rounded-md px-4 py-2 text-gray-800"
                                :class="{ 'text-red-500': !record.phone }">
                                {{ record.phone || '-' }}
                            </div>
                        </div>

                        <!-- NRC No -->
                        <div>
                            <label class="block text-gray-700 mb-1">{{ $t('nrc_no') }}</label>
                            <div class="bg-indigo-50 rounded-md px-4 py-2 text-gray-800"
                                :class="{ 'text-red-500': !record.nrc }">
                                {{ record.nrc || '-' }}
                            </div>
                        </div>

                        <!-- Township -->
                        <div>
                            <label class="block text-gray-700 mb-1">{{ $t('township') }}</label>
                            <div class="bg-indigo-50 rounded-md px-4 py-2 text-gray-800"
                                :class="{ 'text-red-500': !record.township }">
                                {{ record.township || '-' }}
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <div class="grid grid-cols-3 gap-2 justify-items-end pt-4 w-full">
                            <Button v-if="record.status === 'pending'" class=" w-full" label="Approve"
                                severity="success" variant="outlined" :loading="loading.approve"
                                @click="confirmStatus('approved', record.id)" />
                            <Button v-if="record.status === 'pending' || record.status === 'approved'" class=" w-full"
                                label="Reject" severity="danger" variant="outlined" :loading="loading.reject"
                                @click="confirmStatus('rejected', record.id)" />
                            <Button v-if="record.status === 'pending'" class=" w-full" label="Retry Sms" severity="info"
                                variant="outlined" :loading="loading.retry" @click="retrySms(record.id)" />
                        </div>
                    </template>
                </Dialog>

                <!-- Reject Dialog -->
                <Dialog v-model:visible="rejectVisible" modal :style="{ width: '25rem' }"
                    :closable="false">
                    <div class="flex items-center gap-4 mb-8">
                        <InputText id="remark" class="flex-auto" placeholder="Remark" v-model="remark"
                            autocomplete="off" />
                    </div>
                    <div class="flex justify-end gap-2">
                        <Button type="button" label="Cancel" severity="secondary" @click="rejectVisible = false" />
                        <Button type="button" label="Confirm" style="background-color: #2E3192;"
                            @click="rejectConfirm" />
                    </div>
                </Dialog>

                <ConfirmPopup></ConfirmPopup>

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
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const rejectVisible = ref(false);
const remark = ref('');
const rejectId = ref(null);

const confirm = useConfirm();
const toast = useToast();
const businessType = ref(null);
const fromDate = ref(null);
const toDate = ref(null);
const search = ref('');
const detailDialog = ref(false);
const isMobile = helper.isMobile();

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
const loading = reactive({ table: false });

const pagination = reactive({
    page: 1,
    totalRecords: 0,
    rows: 10,
    from: 0,
});

const businessTypeOptions = [
    { label: 'All', value: '' },
    { label: 'Retail', value: 'retail' },
    { label: 'B2B', value: 'business' },
];

const getLuckyDrawRecords = async (page = 1) => {
    try {
        loading.table = true;
        const response = await backend.get("/lucky-draw/records", {
            params: {
                page,
                status: filterMode.value.value,
                from_date: fromDate.value || null,
                to_date: toDate.value || null,
                search: search.value || null,
                business_type: businessType.value?.value ?? null,
            },
        });
        if (response.status === 200) {
            luckyDrawRecords.value = response.data?.data;

            // Update pagination info
            pagination.totalRecords = response.data?.meta.total;
            pagination.page = response.data?.meta.current_page;
            pagination.rows = response.data?.meta.per_page;
            pagination.from = response.data?.meta.from;
        }
    } catch (error) {
        console.error("Error fetching lucky draw records:", error);
    } finally {
        loading.table = false;
    }
};


const onPageChange = (event) => {
    pagination.page = event.page + 1;
    getLuckyDrawRecords(pagination.page);
};

const searchProduct = () => {
    getLuckyDrawRecords(1);
};

const clearFilters = () => {
    fromDate.value = null;
    toDate.value = null;
    search.value = '';
    businessType.value = null;
    filterMode.value = filterOptions[0];
    getLuckyDrawRecords(1);
};

const record = ref({});

const getDetail = async (id) => {
    try {
        const response = await backend.get(`/lucky-draw/${id}`);
        if (response.status === 200) {
            record.value = response.data.data;
            detailDialog.value = true;
        }
    } catch (error) {
        console.error("Error fetching record details:", error);
    }
};

const confirmStatus = (action, id) => {
    confirm.require({
        message: 'Are you sure you want to ' + action + '?',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Yes',
            severity: 'success',
            outlined: true
        },
        accept: () => {
            if (action === 'rejected') {
                rejectId.value = id;
                rejectVisible.value = true;
                return;
            }
            changeStatus(id, action);
        },
        reject: () => {
        }
    });
};

const changeStatus = async (id, status) => {
    try {
        loading.approve = true;
        loading.reject = true;
        const response = await backend.post(`/lucky-draw/records/${id}/${status}`,
            {
                status: status,
                remark: remark.value || ''
            }
        );
        if (response.status === 200) {
            toast.add({ severity: "success", summary: "Success", life: 5000 });
            detailDialog.value = false;
            getLuckyDrawRecords(pagination.page);
        }
    } catch (error) {
        console.error("Error changing status:", error);
        toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "An error occurred", life: 5000 });
    } finally {
        loading.approve = false;
        loading.reject = false;
        loading.retry = false;
        remark.value = '';
        rejectId.value = null;
        rejectVisible.value = false;
    }
};

const rejectConfirm = () => {
    if (!remark.value.trim()) {
        toast.add({
            severity: "warn",
            summary: "Warning",
            detail: "Remark is required to reject.",
            life: 3000,
        });
        return;
    }
    rejectVisible.value = false;
    changeStatus(rejectId.value, "rejected");
};

const retrySms = async (id) => {
    try {
        loading.retry = true;
        const response = await backend.post(`/lucky-draw/send-sms/${id}`);
        if (response.status === 200) {
            toast.add({ severity: "success", summary: "SMS retried successfully", life: 5000 });
        }
    } catch (error) {
        console.error("Error retrying SMS:", error);
        toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "An error occurred", life: 5000 });
    } finally {
        loading.retry = false;
    }
};

onMounted(() => {
    getLuckyDrawRecords();
});
</script>


<style lang="scss" scoped></style>