<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>

        <div v-else>
            <DesktopLayout>
                <!-- Page Content -->
                <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('prizes') }}</h2>

                <div class="flex justify-end items-center mt-2">
                    <!-- filters -->
                    <!-- <div class="flex gap-3">
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
                            :label="$t('search')" severity="success" raised class="cursor-pointer w-35" />

                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div> -->

                    <Button type="button" iconPos="right" :label="$t('create')" @click="openDialog('right')"
                        class="cursor-pointer hover:opacity-90 w-35" style="background-color: #2E3192;" />
                </div>

                <div class="card mt-5 mb-10">
                    <DataTable :value="prizeList" showGridlines stripedRows scrollable scrollHeight="500px"
                        tableStyle="min-width: 80rem" :loading="loading.table">
                        <Column :header="$t('no')" headerStyle="width:3rem ;background-color: #2E3192; color: white;">
                            <template #body="slotProps">
                                {{ pagination.from + slotProps.index }}
                            </template>
                        </Column>
                        <Column headerStyle="background-color: #2E3192; color: white;" field="created_at"
                            :header="$t('created_date')" />
                        <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('name')">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <img :src="slotProps.data.image?.url || '/src/assets/images/placeholder.png'"
                                        :alt="slotProps.data.image?.id" class="w-12" />
                                    <span>{{ slotProps.data.name }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column headerStyle="background-color: #2E3192; color: white;" field="color"
                            :header="$t('color')" />
                        <Column headerStyle="background-color: #2E3192; color: white;" field="sorting_no"
                            :header="$t('sorting_no')" />
                        <!-- <Column headerStyle="background-color: #2E3192; color: white;" field="slug"
                            :header="$t('info')" /> -->
                        <Column headerStyle="background-color: #2E3192; color: white;" field="created_by"
                            :header="$t('created_by')" />

                        <!-- Action column -->
                        <Column headerStyle="background-color: #2E3192; color: white; text-align: center;"
                            :header="$t('action')" class="w-24 !text-end">
                            <template #body="slotProps">
                                <div class="flex justify-center items-center gap-2">
                                    <Button type="button" icon="pi pi-cloud-upload" severity="success" outlined
                                        v-tooltip.top="'Upload Image'" @click="editPrize(slotProps.data)" />
                                </div>
                            </template>
                        </Column>

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
                            <div class="border border-dashed border-gray-500 rounded-lg p-2">
                                <FileUpload mode="basic" customUpload auto @select="onFileSelect"
                                    :chooseLabel="$t('upload_excel_file')" class="p-button-outlined w-full" />

                                <!-- Preview file name -->
                                <div v-if="excelFile"
                                    class="mt-3 flex items-center justify-between border rounded-md px-3 py-2 bg-gray-50">
                                    <span class="text-gray-700 truncate">{{ excelFile.name }}</span>
                                    <i class="pi pi-times text-red-500 cursor-pointer" @click="removeExcelFile"></i>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex justify-end gap-2 mt-4 fixed bottom-0 left-0 right-0 bg-white p-4 rounded-b-lg">
                            <Button type="button" iconPos="right" :label="$t('upload')" :loading="loading.create"
                                :disabled="!excelFile || loading.create" class="cursor-pointer hover:opacity-90 w-35"
                                style="background-color: #2E3192;" @click="uploadExcelFile" />
                        </div>
                    </div>
                </Dialog>

                <!-- Upload Image Dialog -->
                <Dialog v-model:visible="imageDialog.visible" header="Edit Prize"
                    :style="{ width: '25rem', height: '100%', color: 'gray' }" :position="imageDialog.position"
                    :modal="true" :draggable="false">

                    <div class="flex flex-col justify-between h-full">
                        <div class="pt-2 flex flex-col gap-4">
                            <div class="border border-dashed border-gray-500 rounded-lg p-2">
                                <FileUpload v-if="!imagePreview" mode="basic" customUpload auto @select="onImageSelect"
                                    :chooseLabel="$t('upload_image')" class="p-button-outlined w-full" />

                                <!-- Preview selected image -->
                                <div v-if="imagePreview" class="relative flex justify-center items-center">
                                    <img :src="imagePreview" alt="Preview" class="rounded-lg w-1/2" />
                                    <i class="pi pi-times absolute top-2 right-1 text-red-500 bg-white rounded-full p-1 cursor-pointer"
                                        @click="removeImage"></i>
                                </div>
                            </div>
                            <div class=" flex flex-col gap-4">
                                <FloatLabel variant="on">
                                    <InputText v-model="selectPrize.name" fluid autocomplete="off" disabled="true" />
                                    <label for="name">{{ $t('name') }}</label>
                                </FloatLabel>
                                <FloatLabel variant="on">
                                    <InputText v-model="selectPrize.color" fluid autocomplete="off" disabled="true" />
                                    <label for="color">{{ $t('color') }}</label>
                                </FloatLabel>
                                <FloatLabel variant="on">
                                    <InputText id="numkeys" type="text" v-model="selectPrize.sorting_no" v-keyfilter.num fluid autocomplete="off" />
                                    <label for="sorting_no">{{ $t('sorting_no') }}</label>
                                </FloatLabel>
                            </div>
                        </div>

                        <div
                            class="flex justify-end gap-2 mt-4 fixed bottom-0 left-0 right-0 bg-white p-4 rounded-b-lg">
                            <Button type="button" iconPos="right" :label="$t('edit_prize')" :loading="loading.create"
                                :disabled="!imagePreview || loading.create" class="cursor-pointer hover:opacity-90 w-35"
                                style="background-color: #2E3192;" @click="uploadPrizeImage" />
                        </div>
                    </div>
                </Dialog>


                <Toast />
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import NotFound from "@/views/NotFound.vue";
import helper from "@/helper";
import backend from "@/api/backend";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const { t } = useI18n();
const isMobile = helper.isMobile();

const dialog = reactive({ visible: false, position: "center" });
const imageDialog = reactive({ visible: false, position: "center" });
const fromDate = ref(null);
const toDate = ref(null);
const search = ref("");

const loading = reactive({ table: false, create: false });
const prizeList = ref([]);
const pagination = reactive({ totalRecords: 0, rows: 10, page: 1, from: 1 });

const excelFile = ref(null);

const imageFile = ref(null);
const imagePreview = ref(null);

const openDialog = (pos = "center") => {
    dialog.position = pos;
    dialog.visible = true;
};

const openImageDialog = (pos = "center") => {
    imageDialog.position = pos;
    imageDialog.visible = true;
};

const removeExcelFile = () => {
    excelFile.value = null;
};

const onFileSelect = (event) => {
    const file = event.files[0];
    if (!file) return;

    const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type)) {
        toast.add({
            severity: "warn",
            summary: t("invalid_file"),
            detail: t("please_upload_excel_file"),
            life: 3000,
        });
        return;
    }

    excelFile.value = file;
};

const uploadExcelFile = async () => {
    if (!excelFile.value) {
        toast.add({
            severity: "warn",
            summary: t("no_file"),
            detail: t("please_select_a_file_to_upload"),
            life: 3000,
        });
        return;
    }

    loading.create = true;
    try {
        const formData = new FormData();
        formData.append("file", excelFile.value);

        await backend.filePost("/lucky-draw-prizes/prize-excal-upload", formData);

        toast.add({
            severity: "success",
            summary: t("success"),
            detail: t("excel_uploaded_successfully"),
            life: 3000,
        });

        dialog.visible = false;
        excelFile.value = null;
        getPrizes();
    } catch (error) {
        console.error("Error uploading Excel file:", error);
        toast.add({
            severity: "error",
            summary: t("error"),
            detail: t("error_uploading_excel"),
            life: 3000,
        });
    } finally {
        loading.create = false;
    }
};

const getPrizes = async (page = 1) => {
    loading.table = true;
    try {
        const { data } = await backend.get("/lucky-draw-prizes", {
            from_date: fromDate.value || null,
            to_date: toDate.value || null,
            search: search.value || null,
            page,
        });
        prizeList.value = data.data || [];
        pagination.totalRecords = data?.meta.total;
        pagination.page = data?.meta.current_page;
        pagination.rows = data?.meta.per_page;
        pagination.from = data?.meta.from;
    } catch (error) {
        console.error("Error fetching prizes:", error);
        toast.add({
            severity: "error",
            summary: t("error"),
            detail: t("error_fetching_prizes"),
            life: 3000,
        });
    } finally {
        loading.table = false;
    }
};

const onPageChange = (event) => {
    pagination.page = event.page + 1;
    getPrizes(pagination.page);
};

const selectPrize = ref(null);
const editPrize = (prize) => {
    selectPrize.value = prize;
    imagePreview.value = prize.image?.url || null;
    openImageDialog('right');
};



const onImageSelect = (event) => {
    const file = event.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
        toast.add({
            severity: "warn",
            summary: t("invalid_file"),
            detail: t("please_upload_image_file"),
            life: 3000,
        });
        return;
    }

    imageFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const removeImage = () => {
    imageFile.value = null;
    imagePreview.value = null;
};

const uploadPrizeImage = async () => {
    if (!imagePreview.value || !selectPrize.value) {
        toast.add({
            severity: "warn",
            summary: t("no_file"),
            detail: t("please_select_an_image_to_upload"),
            life: 3000,
        });
        return;
    }

    loading.create = true;
    try {
        const formData = new FormData();
        if(imageFile.value){
            formData.append("image", imageFile.value);
        }
        formData.append("sorting_no", selectPrize.value.sorting_no);

        await backend.filePost(`/lucky-draw-prizes/${selectPrize.value.id}/upload-image`, formData);

        toast.add({
            severity: "success",
            summary: t("success"),
            // detail: t("image_uploaded_successfully"),
            life: 3000,
        });

        imageDialog.visible = false;
        imageFile.value = null;
        imagePreview.value = null;
        getPrizes();
    } catch (error) {
        console.error("Error uploading image:", error);
        toast.add({
            severity: "error",
            summary: t("error"),
            // detail: t("error_uploading_image"),
            life: 3000,
        });
    } finally {
        loading.create = false;
    }
};

onMounted(() => {
    getPrizes();
});
</script>
