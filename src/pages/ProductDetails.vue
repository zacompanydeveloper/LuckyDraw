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
                    <!-- Breadcrumb -->
                    <Breadcrumb :home="home" :model="items">
                        <template #item="{ item, props }">
                            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                                <a :href="href" v-bind="props.action" @click="navigate">
                                    <span :class="[item.icon, 'text-color']" />
                                    <span class="text-primary font-semibold">{{ item.label }}</span>
                                </a>
                            </router-link>
                            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                                <span class="text-surface-700 dark:text-surface-0 text-[#2E3192]">
                                    {{ item.label }}
                                </span>
                            </a>
                        </template>
                    </Breadcrumb>

                    <!-- Actions -->
                    <div class="flex justify-between items-center mt-2">
                        <Button type="button" iconPos="right" label="Create" @click="openDialog('right')"
                            class="cursor-pointer hover:opacity-90" style="background-color: #2E3192;">
                            <i class="pi pi-download"></i>
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
                                            @click="openRejectDialog(data.id)" severity="warn" rounded />
                                    </div>
                                </template>
                            </Column>

                            <!-- Empty state -->
                            <template #empty>
                                <div class="p-4 text-center text-gray-500">No records found.</div>
                            </template>
                        </DataTable>

                        <Toast />
                    </div>
                </main>
            </div>
        </div>

        <!-- Reject Dialog -->
        <Dialog v-model:visible="visible" modal :style="{ width: '25rem' }" header="Reject Code" :closable="false">
            <div class="flex items-center gap-4 mb-8">
                <InputText id="remark" class="flex-auto" placeholder="Remark" v-model="remark" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
                <Button type="button" label="Confirm" style="background-color: #2E3192;" @click="rejectConfirm" />
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import helper from "@/helper";
import backend from "@/api/backend";
import NotFound from "@/views/NotFound.vue";
import bgImage from "@/assets/svg/bg.svg";

// -------------------
// Constants
// -------------------
const home = { icon: "pi pi-home", route: "/" };
const items = [
    { label: "Pre-Print", route: "/admin-panel" },
    { label: "Pre-Print Code" },
];
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
const visible = ref(false);
const remark = ref("");
const selectedCodeId = ref(null);

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
const fetchProductDetails = async (productId) => {
    try {
        loading.value = true;
        const { data, status } = await backend.get(`/preprint-products/${productId}`,
            { status: filterMode.value.value });
        if (status === 200) {
            codes.value = data.data;
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
            remark: remark.value,
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
    visible.value = true;
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
    visible.value = false;
    changeStatus(selectedCodeId.value, "rejected");
};
</script>

<style lang="scss" scoped></style>
