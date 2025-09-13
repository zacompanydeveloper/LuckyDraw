<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <DesktopLayout v-else>
            <!-- Main -->
            <main>
                <router-link to="/admin-panel/pre-print-code" class="text-[#2E3192] mb-4 text-2xl font-bold">
                    &larr; Pre-Print Code
                </router-link>

                <!-- Actions -->
                <div class="flex justify-between items-center mt-2">
                    <!-- filters -->
                    <div class="flex gap-3">
                        <FloatLabel variant="on">
                            <InputText id="search" v-model="search" autocomplete="off" />
                            <label for="search">Search</label>
                        </FloatLabel>
                        <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left" label="Search"
                            severity="success" raised class="cursor-pointer w-35" />
                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div>

                    <div class="flex gap-1">
                        <Button v-if="filterMode.value === 'inactive'" type="button" v-tooltip.top="'Approve All'"
                            iconPos="right" icon="pi pi-check" severity="success" @click="openApproveDialog('all')"
                            raised />
                        <Button type="button" v-tooltip.top="'Download'" iconPos="right" icon="pi pi-download"
                            @click="downloadFile" raised style="background-color: #2E3192;" />
                    </div>
                </div>

                <!-- Table -->
                <div class="card">
                    <div class="flex justify-center">
                        <SelectButton v-model="filterMode" optionLabel="label" dataKey="label"
                            class="border border-gray-200 my-2" :options="filterOptions" />
                    </div>

                    <DataTable dataKey="id" showGridlines :value="codes" :loading="loading" scrollable scrollHeight="460px"
                        tableStyle="min-width: 50rem">
                        <Column header="#" headerStyle="width:3rem">
                            <template #body="slotProps">
                                {{ pagination.from + slotProps.index - 1 }}
                            </template>
                        </Column>
                        <Column field="created_at" header="Created Date" />
                        <Column field="product" header="Name" />
                        <Column field="tracking_code" header="Gift Code" />
                        <Column field="serial_code" header="Serial Code" />
                        <Column field="status" header="Status" />

                        <!-- Action column -->
                        <Column v-if="
                            filterMode.value === 'inactive' ||
                            filterMode.value === 'active'
                        " header="Action" class="w-24 !text-end" :headerStyle="{ textAlign: 'right' }">
                            <template #body="{ data }">
                                <div class="flex justify-end items-center gap-2">
                                    <Button v-if="filterMode.value === 'inactive'" v-tooltip.top="'Approve'"
                                        icon="pi pi-check" @click="openApproveDialog('single', data.id)"
                                        severity="success" rounded />
                                    <Button v-if="filterMode.value === 'active'" v-tooltip.top="'Details'"
                                        icon="pi pi-search" @click="viewDetails(data.id)" rounded />
                                    <Button v-tooltip.top="'Reject'" icon="pi pi-times"
                                        @click="openRejectDialog(data.id)" severity="danger" rounded />
                                </div>
                            </template>
                        </Column>

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
            </main>
        </DesktopLayout>

        <!-- Reject Dialog -->
        <Dialog v-model:visible="rejectVisible" modal :style="{ width: '25rem' }" header="Reject Code"
            :closable="false">
            <div class="flex items-center gap-4 mb-8">
                <InputText id="remark" class="flex-auto" placeholder="Remark" v-model="remark" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="rejectVisible = false" />
                <Button type="button" label="Confirm" style="background-color: #2E3192;" @click="rejectConfirm" />
            </div>
        </Dialog>

        <!-- Approve Dialog -->
        <Dialog v-model:visible="approveVisible" modal :style="{ width: '25rem' }" :header="approveType === 'all' ? 'Approve All Codes' : 'Approve Code'
            " :closable="false">
            <div class="flex items-center gap-4 mb-8">
                <p>
                    {{
                        approveType === 'all'
                            ? 'Are you sure you want to approve all inactive codes?'
                            : 'Are you sure you want to approve this code?'
                    }}
                </p>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="approveVisible = false" />
                <Button type="button" label="Confirm" severity="success" @click="approveConfirm" />
            </div>
        </Dialog>

        <!-- Detail Dialog -->
        <Dialog v-model:visible="codeDetailVisible" modal :style="{ width: '25rem' }" header="Code Details"
            :closable="true">
            <div class="flex flex-col gap-4 mb-8">
                <div class="flex justify-between">
                    <span class="font-semibold">Serial Number:</span>
                    <span>{{ codeDetail.serial_code }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Created At:</span>
                    <span>{{ codeDetail.created_at }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Approved At:</span>
                    <span>{{ codeDetail.activated_at }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Approved By:</span>
                    <span>{{ codeDetail.activated_by }}</span>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import helper from "@/helper";
import backend from "@/api/backend";
import NotFound from "@/views/NotFound.vue";
import DesktopLayout from "@/layouts/DesktopLayout.vue";

// -------------------
// Constants
// -------------------
const filterOptions = [
    { label: "InActive", value: "inactive" },
    { label: "Active", value: "active" },
    { label: "Rejected", value: "rejected" },
    { label: "Used", value: "used" },
];

// -------------------
// State
// -------------------
const isMobile = helper.isMobile();
const route = useRoute();
const toast = useToast();

const codes = ref([]);
const loading = ref(false);

const filterMode = ref(filterOptions[0]); // Default: Inactive
const rejectVisible = ref(false);
const approveVisible = ref(false);
const remark = ref("");
const search = ref("");
const selectedCodeId = ref(null);
const approveType = ref("all"); // 'all' or 'single'
const pagination = reactive({
    page: 1,
    totalRecords: 0,
    rows: 10,
    from: 0,
});
const codeDetailVisible = ref(false);
const codeDetail = ref({});

// -------------------
// Lifecycle
// -------------------
onMounted(() => {
    fetchProductDetails();
});

watch(filterMode, () => {
    pagination.page = 1;
    fetchProductDetails();
});

// -------------------
// Methods
// -------------------
const fetchProductDetails = async (page = pagination.page) => {
    try {
        loading.value = true;
        const { data, status } = await backend.get(
            `/preprint-products/${route.params.id}`,
            {
                params: {
                    status: filterMode.value.value,
                    page,
                    search: search.value.trim() || null,
                },
            }
        );

        if (status === 200) {
            codes.value = data.data;
            pagination.totalRecords = data.meta.total;
            pagination.page = data.meta.current_page;
            pagination.rows = data.meta.per_page;
            pagination.from = data.meta.from;
        }
    } catch (error) {
        console.error("Fetch details failed:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Unable to fetch product details.",
            life: 5000,
        });
    } finally {
        loading.value = false;
    }
};

// change status of a single code
const changeStatus = async (codeId, action) => {
    try {
        const { data, status } = await backend.post(
            `/preprint-products/change-status`,
            {
                code_id: codeId,
                action,
                remark: remark.value ?? null,
            }
        );

        if (status === 200) {
            await fetchProductDetails();
            toast.add({
                severity: "success",
                summary: "Success",
                detail: data.message,
                life: 3000,
            });
        }
    } catch (error) {
        console.error("Status change failed:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "An error occurred while changing status.",
            life: 5000,
        });
    }
};

// Reject
const openRejectDialog = (codeId) => {
    selectedCodeId.value = codeId;
    remark.value = "";
    rejectVisible.value = true;
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
    changeStatus(selectedCodeId.value, "rejected");
};

// Pagination
const onPageChange = (event) => {
    pagination.page = event.page + 1;
    fetchProductDetails();
};

// Approve
const openApproveDialog = (type = "all", codeId = null) => {
    approveType.value = type;
    selectedCodeId.value = codeId;
    approveVisible.value = true;
};

const approveConfirm = async () => {
    approveVisible.value = false;

    try {
        if (approveType.value === "all") {
            const { data, status } = await backend.post(
                `/preprint-products/approve-all`,
                { product_id: route.params.id }
            );

            if (status === 200) {
                await fetchProductDetails();
                toast.add({
                    severity: "success",
                    summary: "Success",
                    detail: data.message,
                    life: 3000,
                });
            }
        } else {
            // single code
            await changeStatus(selectedCodeId.value, "approved");
        }
    } catch (error) {
        console.error("Approve failed:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail:
                error.response?.data?.message ||
                "An error occurred while approving codes.",
            life: 5000,
        });
    }
};

// Download
const downloadFile = async () => {
    const id = route.params.id;
    try {
        const { data, status } = await backend.get(
            `/preprint-products/${id}/download`,
            {
                params: { status: filterMode.value.value },
            }
        );
        if (status === 200) {
            const link = document.createElement("a");
            link.href = data.url;
            link.download = "";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error("Download failed:", error);
    }
};

// filters
const clearFilters = () => {
    filterMode.value = filterOptions[0];
    search.value = "";
    pagination.page = 1;
    fetchProductDetails();
};

const searchProduct = () => {
    pagination.page = 1;
    fetchProductDetails();
};

const viewDetails = async (codeId) => {
    try {
        const { data, status } = await backend.get(`/preprint-products/preprint-codes/${codeId}`);
        if (status === 200) {
            console.log("Code Details:", data);
            codeDetail.value = data.data
            codeDetailVisible.value = true;
        }
    } catch (error) {
        console.error("Fetch code detail failed:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Unable to fetch code details.",
            life: 5000,
        });
    }
}
</script>

<style lang="scss" scoped></style>
