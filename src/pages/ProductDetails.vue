<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <DesktopLayout v-else>
            <!-- Main -->
            <main>
                <h2 class="text-2xl font-bold text-[#2E3192]">Pre-Print Code</h2>

                <!-- Actions -->
                <div class="flex justify-between items-center mt-2">
                    <!-- filters -->
                    <div class="flex gap-3">
                        <FloatLabel variant="on">
                            <InputText id="search" v-model="search" autocomplete="off" />
                            <label for="search">Search</label>
                        </FloatLabel>
                        <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left" label="Search"
                            severity="success" raised class="cursor-pointer  w-35" />
                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div>
                    <div class=" flex gap-1">
                        <Button v-if="filterMode.value === 'inactive'" type="button" v-tooltip.top="'Approve All'"
                            iconPos="right" icon="pi pi-check" severity="success" @click="openApproveDialog" raised>
                        </Button>
                        <Button v-if="filterMode.value === 'inactive'" type="button" v-tooltip.top="'Reject All'"
                            iconPos="right" icon="pi pi-times" severity="danger" @click="" raised>
                        </Button>
                        <Button type="button" v-tooltip.top="'Download'" iconPos="right" icon="pi pi-download" @click="downloadFile"
                            raised style="background-color: #2E3192;">
                        </Button>
                    </div>
                </div>

                <!-- Table -->
                <div class="card">
                    <div class="flex justify-center">
                        <SelectButton v-model="filterMode" optionLabel="label" dataKey="label"
                            class=" border border-gray-200 my-2" :options="filterOptions" />
                    </div>


                    <DataTable dataKey="id" :value="codes" :loading="loading" scrollable scrollHeight="460px"
                        tableStyle="min-width: 50rem">
                        <Column header="#" headerStyle="width:3rem">
                            <template #body="slotProps">
                                {{ pagination.from + slotProps.index }}
                            </template>
                        </Column>
                        <Column field="created_at" header="Created Date" />
                        <Column field="product" header="Name" />
                        <Column field="tracking_code" header="Gift Code" />
                        <Column field="serial_code" header="Serial Code" />
                        <Column field="status" header="Status" />

                        <!-- Action column (only for inactive) -->
                        <Column v-if="filterMode.value === 'inactive'" header="Action" class="w-24 !text-end"
                            :headerStyle="{ textAlign: 'right' }">
                            <template #body="{ data }">
                                <div class="flex justify-end items-center gap-2">
                                    <Button v-tooltip.top="'Approve'" icon="pi pi-check"
                                        @click="changeStatus(data.id, 'approved')" severity="success" rounded />
                                    <Button v-tooltip.top="'Reject'" icon="pi pi-times"
                                        @click="openRejectDialog(data.id)" severity="danger" rounded />
                                </div>
                            </template>
                        </Column>

                        <!-- Empty state -->
                        <template #empty>
                            <div class="p-4 text-center text-gray-500">No records found.</div>
                        </template>
                    </DataTable>
                    <Paginator class="mt-1" :rows="pagination.rows" :totalRecords="pagination.totalRecords"
                        @page="onPageChange">
                    </Paginator>
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
        <Dialog v-model:visible="approveVisible" modal :style="{ width: '25rem' }" header="Approve All Codes"
            :closable="false">
            <div class="flex items-center gap-4 mb-8">
                <p>Are you sure you want to approve all inactive codes?</p>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="approveVisible = false" />
                <Button type="button" label="Confirm" severity="success" @click="approveAll" />
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
import bgImage from "@/assets/svg/bg.svg";
import DesktopLayout from "@/layouts/DesktopLayout.vue";
import app from "@/app_root";

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
const remark = ref(null);
const selectedCodeId = ref(null);
const pagination = reactive({
    page: 1,
    totalRecords: 0,
    rows: 10,
    from: 0,
});

// -------------------
// Lifecycle
// -------------------
onMounted(() => {
    fetchProductDetails(route.params.id);
});

watch(filterMode, () => {
    fetchProductDetails(route.params.id);
});

// -------------------
// Methods
// -------------------
const fetchProductDetails = async (productId, page = 1) => {
    try {
        loading.value = true;
        const { data, status } = await backend.get(`/preprint-products/${productId}`,
            { status: filterMode.value.value, page });
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

const changeStatus = async (codeId, action) => {
    try {
        const { data, status } = await backend.post(`/preprint-products/change-status`, {
            code_id: codeId,
            action,
            remark: remark.value ?? null,
        });

        if (status === 200) {
            await fetchProductDetails(route.params.id);
            toast.add({ severity: "success", summary: "Success", detail: data.message, life: 3000 });
        }
    } catch (error) {
        console.error("Status change failed:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "An error occurred while changing status.",
            life: 5000,
        });
    }
};

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

const onPageChange = (event) => {
    console.log("Page changed:", event);
    fetchProductDetails(route.params.id, event.page + 1);
};

const openApproveDialog = () => {
    approveVisible.value = true;
}

const approveAll = async () => {
    try {
        const { data, status } = await backend.post(`/preprint-products/approve-all`, {
            product_id: route.params.id,
        });

        if (status === 200) {
            await fetchProductDetails(route.params.id);
            toast.add({ severity: "success", summary: "Success", detail: data.message, life: 3000 });
        }
    } catch (error) {
        console.error("Approve all failed:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "An error occurred while approving all codes.",
            life: 5000,
        });
    } finally {
        approveVisible.value = false;
    }
};

const downloadFile = async () => {
    const id = route.params.id;
    try {
        const { data, status } = await backend.get(`/preprint-products/${id}/download`,
            {
                status: filterMode.value.value,
            }
        )
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
        console.error('Download failed:', error)
    }
}
</script>

<style lang="scss" scoped></style>
