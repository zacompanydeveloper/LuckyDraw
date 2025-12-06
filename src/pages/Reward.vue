<template>
    <div>
        <DesktopLayout v-if="!isMobile">
            <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('reward_management') }}</h2>

            <div class="card mt-5 mb-10">
                <DataTable :value="rewardList" showGridlines stripedRows scrollable scrollHeight="500px"
                    tableStyle="min-width: 100rem" :loading="loading.table">
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
                                <img :src="slotProps.data.image?.url || defaultPrizeImg" :alt="slotProps.data.image?.id"
                                    class="w-12" />
                                <template v-if="slotProps.data">
                                    <span v-if="!isNaN(Number(slotProps.data.name))">
                                        {{ helper.priceFormat(slotProps.data.name) }} {{ $t("mmk") }}
                                    </span>
                                    <span v-else>
                                        {{ slotProps.data.name }}
                                    </span>
                                </template>
                            </div>
                        </template>
                    </Column>
                    <Column headerStyle="background-color: #2E3192; color: white;" field="quantity"
                        :header="$t('quantity')" />
                    <Column headerStyle="background-color: #2E3192; color: white;" field="sponsor_by"
                        :header="$t('sponsor_by')" />
                    <Column headerStyle="background-color: #2E3192; color: white;" field="sorting_no"
                        :header="$t('sorting_no')" />
                    <!-- Action column -->
                    <Column headerStyle="background-color: #2E3192; color: white; text-align: center;"
                        :header="$t('action')" class="w-24 !text-end">
                        <template #body="slotProps">
                            <div class="flex justify-center items-center gap-2">
                                <Button type="button" icon="pi pi-cloud-upload" severity="success" outlined
                                    v-tooltip.top="'Upload Image'" @click="editReward(slotProps.data)" />
                                <!-- <Button type="button" icon="pi pi-file-export" severity="info" outlined
                                    v-tooltip.top="'Export Image'" /> -->
                                <router-link :to="`/admin-panel/reward/${slotProps.data.id}/print`">
                                    <Button type="button" icon="pi pi-file-export" severity="info" outlined
                                        v-tooltip.top="'Export Image'" />
                                </router-link>
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
                                <InputText v-model="selectReward.name" fluid autocomplete="off" :disabled="true" />
                                <label for="name">{{ $t('name') }}</label>
                            </FloatLabel>
                            <FloatLabel variant="on">
                                <InputText id="numkeys" type="text" v-model="selectReward.sorting_no" v-keyfilter.num
                                    fluid autocomplete="off" />
                                <label for="sorting_no">{{ $t('sorting_no') }}</label>
                            </FloatLabel>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 mt-4 fixed bottom-0 left-0 right-0 bg-white p-4 rounded-b-lg">
                        <Button type="button" iconPos="right" :label="$t('edit_prize')" :loading="loading.create"
                            :disabled="!imagePreview || loading.create" class="cursor-pointer hover:opacity-90 w-35"
                            style="background-color: #2E3192;" @click="uploadPrizeImage" />
                    </div>
                </div>
            </Dialog>


            <Toast />

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
import defaultPrizeImg from "@/assets/images/pz.png";
import router from "@/router";

const isMobile = helper.isMobile();
const toast = useToast();
const { t } = useI18n();
const rewardList = ref([]);
const loading = reactive({
    table: false,
});
const pagination = reactive({
    totalRecords: 0,
    page: 1,
    rows: 10,
    from: 0,
});
const imageDialog = reactive({
    visible: false,
    position: "center",
});
const fromDate = ref(null);
const toDate = ref(null);
const search = ref("");

const imageFile = ref(null);
const imagePreview = ref(null);

const getRewards = async (page = 1) => {
    loading.table = true;
    try {
        const { data } = await backend.get("/employees/prize-list", {
            from_date: fromDate.value || null,
            to_date: toDate.value || null,
            search: search.value || null,
            page,
        });
        rewardList.value = data.data || [];
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
    getRewards(pagination.page);
};

const selectReward = ref(null);
const editReward = (reward) => {
    selectReward.value = reward;
    imagePreview.value = reward.image?.url || null;
    openImageDialog('right');
};

const openImageDialog = (pos = "center") => {
    imageDialog.position = pos;
    imageDialog.visible = true;
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
    if (!imagePreview.value || !selectReward.value) {
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
        if (imageFile.value) {
            formData.append("image", imageFile.value);
        }
        formData.append("sorting_no", selectReward.value.sorting_no);

        await backend.filePost(`/employees/lucky-draw-rewards/${selectReward.value.id}/upload-image`, formData);

        toast.add({
            severity: "success",
            summary: t("success"),
            life: 3000,
        });

        imageDialog.visible = false;
        imageFile.value = null;
        imagePreview.value = null;
        getRewards();
    } catch (error) {
        console.error("Error uploading image:", error);
        toast.add({
            severity: "error",
            summary: t("error"),
            detail: error.response?.data?.message || t("error_uploading_image"),
            life: 3000,
        });
    } finally {
        loading.create = false;
    }
};

onMounted(() => {
    getRewards();
});
</script>

<style lang="scss" scoped></style>