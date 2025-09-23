<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>

        <div v-else>
            <DesktopLayout>
                <!-- Page Content -->
                <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('prizes') }}</h2>

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

                        <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left" :label="$t('search')"
                            severity="success" raised class="cursor-pointer w-35" />

                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div>

                    <Button type="button" iconPos="right" :label="$t('create')" @click="openDialog('right')"
                        class="cursor-pointer hover:opacity-90 w-35" style="background-color: #2E3192;" />
                </div>

                <div class="card mt-5 mb-10">
                    <DataTable :value="prizeList" showGridlines stripedRows scrollable scrollHeight="500px"
                        tableStyle="min-width: 50rem" :loading="loading.table">
                        <Column :header="$t('no')" headerStyle="width:3rem ;background-color: #2E3192; color: white;">
                            <template #body="slotProps">
                                {{ pagination.from + slotProps.index }}
                            </template>
                        </Column>
                        <Column headerStyle="background-color: #2E3192; color: white;" field="created_at"
                            :header="$t('created_date')" />
                        <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('label')">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <img :src="slotProps.data.image?.url" :alt="slotProps.data.image?.id"
                                        class="w-10 h-10" />
                                    <span>{{ slotProps.data.name }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column headerStyle="background-color: #2E3192; color: white;" field="quantity"
                            :header="$t('quantity')" />
                        <Column headerStyle="background-color: #2E3192; color: white;" field="created_by"
                            :header="$t('created_by')" />

                        <!-- Empty state -->
                        <template #empty>
                            <div class="p-4 text-center text-gray-500">
                                {{ $t('no_records_found') }}
                            </div>
                        </template>
                    </DataTable>

                    <Paginator class="mt-1" :rows="pagination.rows" :totalRecords="pagination.totalRecords"
                        @page="onPageChange" />
                </div>

                <!-- Dialog -->
                <Dialog v-model:visible="dialog.visible" :header="$t('prize_registration')"
                    :style="{ width: '25rem', height: '100%' }" :position="dialog.position" :modal="true"
                    :draggable="false">
                    <div class="flex flex-col justify-between h-full">
                        <div class="pt-2">
                            <FloatLabel variant="on" class="w-full mb-4">
                                <InputText id="name" autocomplete="off" v-model="form.name" fluid />
                                <label for="name">{{ $t('name') }}</label>
                            </FloatLabel>

                            <FloatLabel variant="on" class="w-full mb-4">
                                <InputText id="quantity" autocomplete="off" v-model="form.quantity" fluid
                                    v-keyfilter.num />
                                <label for="quantity">{{ $t('quantity') }}</label>
                            </FloatLabel>

                            <div class="border border-dashed border-gray-500 rounded-lg p-1">
                                <FileUpload v-if="!src" mode="basic" @select="onFileSelect" customUpload auto
                                    severity="secondary" :chooseLabel="$t('upload_image')" class="p-button-outlined w-full" />

                                <div class="relative">
                                    <img v-if="src" :src="src" alt="Image" class="shadow-md w-full rounded-lg" />

                                    <div v-if="src" class="absolute top-0 right-0 cursor-pointer">
                                        <i class="pi pi-times" style="color: red" @click="removeImage"></i>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div
                            class="flex justify-end gap-2 mt-4 fixed bottom-0 left-0 right-0 bg-white p-4 rounded-b-lg">
                            <Button type="button" iconPos="right" :label="$t('create')" :loading="loading.create"
                                :disabled="!isFormValid || loading.create" class="cursor-pointer hover:opacity-90 w-35"
                                @click="createPrize" style="background-color: #2E3192;" />
                        </div>

                    </div>
                </Dialog>

                <Toast />

            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import NotFound from "@/views/NotFound.vue"
const isMobile = helper.isMobile()
import helper from "@/helper"
import backend from "@/api/backend";
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const { t } = useI18n();

const dialog = reactive({
    visible: false,
    position: "center",
})

const fromDate = ref(null);
const toDate = ref(null);
const search = ref("");
const loading = reactive({
    table: false,
    create: false,
})

const prizeList = ref([])

const form = reactive({
    name: "",
    quantity: "",
    image: null
})

const pagination = reactive({
    totalRecords: 0,
    rows: 10,
    page: 1,
    from: 1,
});

// Pagination
const onPageChange = (event) => {
    pagination.page = event.page + 1;
    getPrizes(pagination.page);
};


const openDialog = (pos = "center") => {
    dialog.position = pos
    dialog.visible = true
}

const src = ref(null);

function onFileSelect(event) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        src.value = e.target.result;
        form.image = file;
    };

    reader.readAsDataURL(file);
}

const isFormValid = computed(() => {
    return form.name && form.quantity && form.image;
});

const removeImage = () => {
    src.value = null;
    form.image = null;
}

const createPrize = async () => {
    loading.create = true;
    try {
        const { data } = await backend.filePost("/lucky-draw-prizes", form);
        toast.add({ severity: 'success', summary: t('success'), detail: t('prize_created_successfully'), life: 3000 });
        dialog.visible = false;
        // Reset form
        form.name = "";
        form.quantity = "";
        form.image = null;
        src.value = null;
        getPrizes();
    } catch (error) {
        console.error("Error creating prize:", error);
        toast.add({ severity: 'error', summary: t('error'), detail: t('error_creating_prize'), life: 3000 });
    } finally {
        loading.create = false;
    }
}

const getPrizes = async (page = 1) => {
    loading.table = true;
    try {
        const { data } = await backend.get("/lucky-draw-prizes", {
            from_date: fromDate.value || null,
            to_date: toDate.value || null,
            search: search.value || null,
            page: page,
        });
        prizeList.value = data.data || [];

        // Update pagination info
        pagination.totalRecords = data?.meta.total;
        pagination.page = data?.meta.current_page;
        pagination.rows = data?.meta.per_page;
        pagination.from = data?.meta.from;

    } catch (error) {
        console.error("Error fetching prizes:", error);
        toast.add({ severity: 'error', summary: t('error'), detail: t('error_fetching_prizes'), life: 3000 });
    } finally {
        loading.table = false;
    }
}

onMounted(() => {
    getPrizes();
});

</script>

<!-- <style>
/* In your component's style block or a global CSS file */
.p-button-outlined {
    border: none !important;
    /* Removes the border */
    background-color: transparent !important;
    /* Makes the background transparent if needed */
    box-shadow: none !important;
    /* Removes any potential box-shadow */
}
</style> -->