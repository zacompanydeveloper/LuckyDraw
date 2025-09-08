<template>
    <MobileLayout>
        <div>
            <!-- Title -->
            <div class="w-full flex z-40 text-[var(--base-color)] shadow">

                <div class="w-full flex z-40">
                    <div class="flex items-center justify-between p-2 px-3 w-full">
                        <div class="" @click="backFun">
                            <i class="pi pi-arrow-left text-[var(--base-color)] text-2xl" />
                        </div>

                        <p class=" font-semibold text-center text-lg">
                            {{ $t('warranty_check') }}
                        </p>
                        <div class="w-10 h-10"></div>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <div class="flex flex-col w-full gap-4 p-10">

                <!-- Search Bar -->
                <div class=" w-full">
                    <IconField class="w-full">
                        <InputIcon class="pi pi-search w-5 h-5 " />
                        <InputText v-model="form.locNumber" placeholder="Search with LOT Number" class="w-full"
                            :invalid="locNumberError" :disabled="checked" />
                        <InputIcon class="pi pi-spin pi-spinner w-5 h-5" v-if="loading.checked" />
                        <InputIcon class="pi pi-check w-5 h-5" v-else />
                    </IconField>
                    <label class="text-red-500 text-xs px-3" v-if="locNumberError">
                        {{ $t(locNumberError) }}
                    </label>
                </div>

                <!-- Check -->
                <Button @click="checkingFun" v-if="!checked">
                    <span class="pi pi-spin pi-spinner w-5 h-5" v-if="loading.checked"></span>
                    <span> {{ $t('warranty_check') }} </span>
                </Button>

                <!--Checked Warranty Box -->
                <div v-else>
                    <CheckedWarrantyBox :item="checkedWarranty" @remove="removeCheckedWarrantyBox" />
                </div>

                <!-- Status -->
                <div>
                    <div class="flex w-full" v-if="checked && checkedWarranty">
                        <div class="bg-blue-100 p-5 border-2 rounded-md border-blue-500 w-full">
                            <label class="block text-gray-700 text-lg font-semibold mb-2">Warranty
                                Status</label>
                            <div class=" bg-blue-100 p-1 rounded-md flex flex-col gap-3">
                                <div class=" text text-[var(--base-color)]">{{ $t(checkedWarranty.status) }}</div>
                                <hr v-if="checkedWarranty.return_type">
                                <div class=" text-sm" v-if="checkedWarranty.return_type">Return-Type   :   {{ helper.ucfirst(checkedWarranty.return_type) }}</div>
                                <div class=" text-sm" v-if="checkedWarranty.return_remark">Return-remark :   {{ helper.ucfirst(checkedWarranty.return_remark) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Date -->
                <div class="flex text-xs text-gray-500 w-full" v-if="checked && checkedWarranty?.status != 'pending'">
                    <div class=" border-2 rounded-md border-blue-500 p-5 w-full">
                        <div class=" flex items-center" v-if="checkedWarranty.status == 'returned'">
                            <label class="block text-sm font-semibold ">Claimed Date</label>
                            <div class=" ml-3 rounded-md flex flex-col gap-3">
                                <div class=" text">{{ checkedWarranty.return_date }}</div>
                            </div>
                        </div>
                        <div class=" flex-col" v-if="checkedWarranty.status == 'active'">
                            <div class=" flex">
                                <label class="block text-sm font-semibold mb-2">Warranty Started Date : </label>
                                <div class="ml-3">
                                    <div class=" text">{{ checkedWarranty.sales_date }}</div>
                                </div>
                            </div>

                            <div class=" flex">
                                <label class="block text-sm font-semibold mb-2">Warranty Expired Date : </label>
                                <div class="ml-3">
                                    <div class=" text">{{ checkedWarranty.expiry_date }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Warranty Box -->
                <div v-if="checked">
                    <WarrantyBox :warranty="checkedWarranty" />
                </div>

            </div>     
        </div>
    </MobileLayout>
</template>
<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from "primevue/usetoast";
import helper from '@/helper';

import api from '@/api';
import backend from '@/api/backend';
import router from '@/router';
import CheckedWarrantyBox from '@/components/CheckedWarrantyBox.vue';

const form = reactive({
    locNumber: null,
});
const loading = reactive({
    checked: false,
});
const locNumberError = ref(null);
const checked = ref(false);
const checkedWarranty = ref(null);

function backFun() {
    router.back();
}

function checkingFun() {
    loading.checked = true;
    locNumberError.value = null;

    api.get('/warranty/track', {
        'serial_number': form.locNumber
    }).then((response) => {
        checkedWarranty.value = response.data.data;
        checked.value = true;
        locNumberError.value = null;
    }).catch((error) => {
        locNumberError.value = error.response.data.message;
        checked.value = false;
    }).finally(() => {
        loading.checked = false;
    });
}

function removeCheckedWarrantyBox() {
    checked.value = false;
    checkedWarranty.value = null;
}

</script>