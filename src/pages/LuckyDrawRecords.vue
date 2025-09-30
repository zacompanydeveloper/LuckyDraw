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

                    <FloatLabel variant="on">
                        <Select class="w-[200px] border border-gray-200" v-model="businessType" optionLabel="label"
                            dataKey="label" :options="businessTypeOptions" />
                        <label for="businessType">{{ $t('business_type') }}</label>
                    </FloatLabel>

                    <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left"
                        :label="$t('search')" severity="success" raised class="cursor-pointer  w-35" />
                    <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                        style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                </div>
                <div class="flex gap-2">
                    <Button v-can="'manage-lucky-draw'" v-if="filterMode.value === 'in_review'" type="button"
                        v-tooltip.top="$t('approve_all')" iconPos="right" icon="pi pi-check" severity="success"
                        @click="confirmApproveAll" raised />
                    <Button v-can="'export-lucky-draw'" type="button" v-tooltip.top="$t('download_ticket')"
                        iconPos="right" icon="pi pi-download" @click="exportData" raised
                        style="background-color: #2E3192;" />
                </div>
            </div>

            <!-- Table -->
            <div class="card mt-2">
                <div v-can="'manage-lucky-draw'" class="flex justify-center">
                    <SelectButton v-model="filterMode" optionLabel="label" dataKey="label"
                        class="border border-gray-200 mt-2" :options="filterOptions" />
                </div>
                <DataTable class="mt-2" dataKey="id" showGridlines stripedRows :value="luckyDrawRecords" :loading="loading.table"
                    scrollable scrollDirection="both" scrollHeight="460px" tableStyle="min-width: 80rem">

                    <Column headerStyle="background-color: #2E3192; color: white; width:3rem" class="table-header"
                        :header="$t('no')">
                        <template #body="slotProps">
                            {{ pagination.from + slotProps.index }}
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="created_at" :header="$t('created_date')" />

                    <!-- <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="customer_name" :header="$t('customer')" /> -->
                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="phone"
                        :header="$t('customer_phone')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="business_type" :header="$t('business_type')">
                        <template #body="slotProps">
                            {{ $t(slotProps.data.business_type) }}
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="tracking_code" :header="$t('gift_code')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="serial_code" :header="$t('serial_code')" />

                    <!-- <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="status"
                        :header="$t('status')">
                        <template #body="slotProps">
                            {{ $t(slotProps.data.status) }}
                        </template>
                    </Column> -->

                    <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('action')"
                        class="w-24 table-header" :headerStyle="{ textAlign: 'right' }">
                        <template #body="{ data }">
                            <div class="flex justify-center items-center">
                                <Button v-tooltip.top="$t('details')" icon="pi pi-search" @click="getDetail(data.id)"
                                    severity="success" outlined rounded />
                            </div>
                        </template>
                    </Column>

                    <template #empty>
                        <div class="p-4 text-center text-gray-500">
                            {{ $t('no_records_found') }}
                        </div>
                    </template>
                </DataTable>

                <Paginator class="mt-1" :rows="pagination.rows" :totalRecords="pagination.totalRecords"
                    @page="onPageChange" />
                <Toast />

                <!-- Detail Dialog -->
                <Dialog v-model:visible="detailDialog" :header="$t('lucky_draw_activation_detail')"
                    :style="{ width: '30rem', height: '100%', color: '#2E3192' }" :modal="true" :draggable="false"
                    position="right">
                    <div class="space-y-4 min-h-[700px]">

                        <div class=" border border-gray-200 rounded-md p-4 pt-2 grid grid-cols-1 gap-4">
                            <!-- Shop Name -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('shop') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.shop_name }">
                                    {{ record.shop_name || '-' }}
                                </div>
                            </div>

                            <!-- Creator -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('created_by') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.creator_name }">
                                    {{ record.creator_name || '-' }}
                                </div>
                            </div>

                            <!-- Serial Code -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('serial_code') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.serial_code }">
                                    {{ record.serial_code || '-' }}
                                </div>
                            </div>

                            <!-- Tracking Code -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('gift_code') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.tracking_code }">
                                    {{ record.tracking_code || '-' }}
                                </div>
                            </div>

                            <!-- Voucher No -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('voucher_no') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.invoice_no }">
                                    {{ record.invoice_no || '-' }}
                                </div>
                            </div>

                            <!-- Amount -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('amount') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.amount }">
                                    {{ record.amount ? helper.priceFormat(record.amount) + ' ' + $t('ks') : '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="border border-gray-200 rounded-md p-4 pt-2 grid grid-cols-1 gap-4">
                            <!-- Name -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('customer_name') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.customer_name }">
                                    {{ record.customer_name || '-' }}
                                </div>
                            </div>

                            <!-- Phone Number -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('phone_number') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.phone }">
                                    {{ record.phone || '-' }}
                                </div>
                            </div>

                            <!-- NRC No -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('nrc_no') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.nrc }">
                                    {{ record.nrc || '-' }}
                                </div>
                            </div>

                            <!-- Township -->
                            <div>
                                <label class="block text-gray-700 mb-1">{{ $t('township') }}</label>
                                <div class="bg-indigo-50 rounded-md p-2 text-gray-800"
                                    :class="{ 'text-red-500': !record.township }">
                                    {{ record.township || '-' }}
                                </div>
                            </div>
                        </div>


                    </div>
                    <template #footer>
                        <div class="grid grid-cols-3 gap-2 justify-items-end pt-4 w-full">
                            <Button v-can="'manage-lucky-draw'" v-if="record.status === 'in_review'" class=" w-full"
                                label="Approve" severity="success" variant="outlined" :loading="loading.approve"
                                @click="confirmStatus('approved', record.id)" />
                            <Button v-can="'manage-lucky-draw'"
                                v-if="record.status === 'pending' || record.status === 'in_review' || record.status === 'approved'"
                                class=" w-full" label="Reject" severity="danger" variant="outlined"
                                :loading="loading.reject" @click="confirmStatus('rejected', record.id)" />
                            <Button v-if="record.status === 'pending' && record.can_send_sms" class=" w-full"
                                label="Retry Sms" severity="info" variant="outlined" :loading="loading.retry"
                                @click="retrySms(record.id)" />
                        </div>
                    </template>
                </Dialog>

                <!-- Reject Dialog -->
                <Dialog v-model:visible="rejectVisible" modal :style="{ width: '25rem' }" :closable="false">
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
import { useI18n } from "vue-i18n";
import backend from "@/api/backend";
import helper from "@/helper";
import NotFound from "@/views/NotFound.vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import router from "@/router";

const { t } = useI18n();
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
    { label: 'In Review', value: 'in_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Used', value: 'used' },
    { label: 'Failed', value: 'failed' },
    { label: 'Double Winner Rejected', value: 'double_winner_rejected' },
];
const filterMode = ref(
    filterOptions.find(opt => opt.value === (router.currentRoute.value.query.status || "pending")) || filterOptions[0]
); // Default: Pending

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
    { label: 'All', value: 'all' },
    { label: 'Retail', value: 'retail' },
    { label: 'B2B', value: 'business' },
];

const getLuckyDrawRecords = async (page = 1) => {
    try {
        router.replace({
            query: {
                status: filterMode.value.value,
                page: page,
            },
        });
        loading.table = true;
        const response = await backend.get("/lucky-draw-tickets/records", {
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
        toast.add({ severity: "error", summary: t('error'), detail: error.response?.data?.message || t('error_occurred'), life: 5000 });
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
        const response = await backend.get(`/lucky-draw-tickets/${id}`);
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

const approveAllTickets = async () => {
    try {
        loading.approve = true;
        const response = await backend.post(`/lucky-draw-tickets/approve-all`, {
            status: 'approved'
        });
        if (response.status === 200) {
            toast.add({ severity: "success", summary: t('success'), life: 5000 });
            getLuckyDrawRecords(pagination.page);
        }
    } catch (error) {
        console.error("Error approving all tickets:", error);
        toast.add({ severity: "error", summary: t('error'), detail: error.response?.data?.message || t('error_occurred'), life: 5000 });
    } finally {
        loading.approve = false;
    }
};

const confirmApproveAll = () => {
    confirm.require({
        message: 'Are you sure you want to approve all?',
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
            approveAllTickets();
        },
        reject: () => {
        }
    });
};

const changeStatus = async (id, status) => {
    try {
        loading.approve = true;
        loading.reject = true;
        const response = await backend.post(`/lucky-draw-tickets/records/${id}/${status}`,
            {
                status: status,
                remark: remark.value || ''
            }
        );
        if (response.status === 200) {
            toast.add({ severity: "success", summary: t('success'), life: 5000 });
            detailDialog.value = false;
            getLuckyDrawRecords(pagination.page);
        }
    } catch (error) {
        console.error("Error changing status:", error);
        toast.add({ severity: "error", summary: t('error'), detail: error.response?.data?.message || t('error_occurred'), life: 5000 });
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
            summary: t('warning'),
            detail: t('remark_required_reject'),
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
        const response = await backend.post(`/lucky-draw-tickets/send-sms/${id}`);
        if (response.status === 200) {
            toast.add({ severity: "success", summary: "SMS retried successfully", life: 5000 });
        }
    } catch (error) {
        console.error("Error retrying SMS:", error);
        toast.add({ severity: "error", summary: t('error'), detail: error.response?.data?.message || t('error_occurred'), life: 5000 });
    } finally {
        loading.retry = false;
    }
};

const exportData = async () => {
    try {
        loading.table = true;
        const { data, status } = await backend.get("/lucky-draw-tickets/export", {
            params: {
                status: filterMode.value.value,
                from_date: fromDate.value || null,
                to_date: toDate.value || null,
                search: search.value || null,
                business_type: businessType.value?.value ?? null,
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

onMounted(() => {
    getLuckyDrawRecords();
});
</script>


<style lang="scss" scoped></style>