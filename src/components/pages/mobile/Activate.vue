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
                        {{ $t('warranty_activate') }}
                    </p>
                    <div class="w-10 h-10"></div>
                </div>
            </div>
            </div>


                    <!-- Form -->
                    <div class="flex flex-col w-full gap-5 p-10">

                        <!-- Search Bar -->
                        <div class=" w-full">
                            <IconField class="w-full">
                                <InputIcon class="pi pi-search w-5 h-5 " />
                                <InputText v-model="form.locNumber" placeholder="Search with LOT Number" class="w-full"
                                    :disabled="checked" :invalid="locNumberError" />
                                <InputIcon class="pi pi-spin pi-spinner w-5 h-5" v-if="loading.checked" />
                                <InputIcon class="pi pi-check w-5 h-5" v-if="checked" />
                            </IconField>
                            <label class="text-red-500 text-xs px-3" v-if="locNumberError">
                                {{ $t(locNumberError) }}
                            </label>
                        </div>


                        <!-- Check -->
                        <Button v-if="!checked" @click="checkingFun">
                            <span class="pi pi-spin pi-spinner w-5 h-5" v-if="loading.checked"></span>
                            <span> {{ $t('search') }} </span>
                        </Button>

                        <!--Checked Warranty Box -->
                        <div v-else>
                            <CheckedWarrantyBox :item="checkedWarranty" @remove="removeCheckedWarrantyBox" />
                        </div>

                        <div class=" border-t text-gray-500 border-dashed" />

                        <!-- Name  -->
                        <IconField class="w-full">
                            <InputIcon class="pi pi-user w-5 h-5 " />
                            <InputText v-model="form.name" placeholder="Enter your name" class="w-full"
                                :disabled="!checked || otpSend" />
                        </IconField>

                        <!-- Address -->
                        <IconField class="w-full">
                            <InputIcon class="pi pi-map-marker w-5 h-5 " />
                            <InputText v-model="form.address" placeholder="Enter your address" class="w-full"
                                :disabled="!checked || otpSend" />
                        </IconField>

                        <!-- Township -->

                        <Select v-model="selectedTownship" :options="townships" filter
                            :optionLabel="locale == 'en' ? 'township_en' : 'township'" placeholder="Select a township"
                            class="w-full" :loading="loading.townships" :disabled="!checked || otpSend" v-if="!loading.townships">
                            <template #value="slotProps">
                                <div class="flex items-center">

                                    <div>{{ (locale == 'en' ? slotProps?.value?.township_en :
                                        slotProps?.value?.township) ?? 'Select township' }}</div>
                                </div>
                            </template>
                            <template #option="slotProps">
                                <div class="flex items-center">
                                    <div>{{ locale == 'en' ? slotProps?.option?.township_en :
                                        slotProps?.option?.township }} </div>
                                </div>
                            </template>
                            <template #dropdownicon>
                                <i class="pi pi-map" />
                            </template>
                        </Select>

                        <div v-if="checked">
                            <WarrantyBox :warranty="checkedWarranty"/>
                        </div>

                        <div class=" border-t text-gray-500 border-dashed"/>

                        <!-- Phone Number -->
                        <IconField class="w-full">
                            <InputIcon class="pi pi-phone w-5 h-5 " />
                            <InputMask mask="99999999999" v-model="form.phoneNumber" placeholder="Enter your phone number" class="w-full"
                                :disabled="!checked || otpSend" :invalid="invalidOtp" />
                        </IconField>

                        <div>
                            <SlideVerify @update="slideVerify = true"/>
                        </div>

                        <!-- Otp  -->
                        <div class=" flex justify-center" v-if="valid">
                            <InputOtp v-model="form.otpCode" :length="6" :disabled="!checked" :invalid="invalidOtp"/>
                        </div>
                        

                        <Button v-if="valid && !otpSend" @click="requestOtp">
                            <span class="pi pi-spin pi-spinner w-5 h-5" v-if="loading.checked"></span>
                            <span> {{ $t('request_otp') }} </span>
                        </Button>

                     
                        <Button @click="activateFun" v-if="otpSend && !activated">
                            <span class="pi pi-spin pi-spinner w-5 h-5" v-if="loading.checked"></span>
                            <span> {{ $t('warranty_activate') }} </span>
                        </Button>

                    </div>
        </div>
        <Toast position="top-center" style="width: 80% !important;"/>

    </MobileLayout>
</template>
<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from "primevue/usetoast";


import api from '@/api';
import backend from '@/api/backend';
import router from '@/router'; 

const slideVerify = ref(false);
const locale = useI18n().locale;
const toast = useToast();
const locNumberError = ref(null);
const checkedWarranty = ref(null);
const townships = ref([]);
const checked = ref(false);
const selectedTownship = ref(null);
const otpSend = ref(false);
const invalidOtp = ref(false);
const activated = ref(false);

const loading = reactive({
    checked: false,
    townships: true
});
const form = reactive({
    locNumber: null,
    name: null,
    phoneNumber: null,
    address: null,
    township: null,
    otpCode :null
});

const valid = computed(() => {
    return form.locNumber && form.name && form.phoneNumber && form.address && form.township && checked.value && slideVerify.value;
});

onMounted(() => {
    fetchTownship()
});

function invalidOtpMessage() {
    toast.add({ severity: 'error', summary: 'error', detail: 'Your Otp is invalid', life: 10000 });
};

function successActivatedMessage() {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Your warranty has been activated successfully', life: 10000 });
};

function backFun() {
    router.back();
}

function fetchTownship() {
    loading.townships = true;
    backend.get('register-townships')
        .then((response) => {
            townships.value = response.data.data;
        })
        .finally(() => {
            loading.townships = false;
        });
}

function checkingFun() {
    loading.checked = true;
    locNumberError.value = null;

    api.get('/warranty/track', {
        'status': 'pending',
        'serial_number': form.locNumber
    }).then((response) => {
        checkedWarranty.value = response.data.data;
        checked.value = true;
    }).catch((error) => {
        locNumberError.value = error.response.data.message
        checked.value = false;
    }).finally(() => {
        loading.checked = false;
    });
}

function removeCheckedWarrantyBox() {
    checked.value = false;
    form.locNumber = null;
    checkedWarranty.value = null;
    otpSend.value = false;
    invalidOtp.value = false;
    activated.value = false;
}

function requestOtp() {
    if (!valid.value) {
        return;
    }
    otpSend.value = true;

    backend.post(`/${form.phoneNumber}/request-activation`,{'confirmation' : 1}).then((response) => {
        if (response.data.success) {
            console.log('OTP sent successfully');
        }
    }).catch((error) => {
        //
    });
}

function activateFun() {
    if (!valid.value) {
        return;
    }
    api.post('/warranty/activate-by-customer', {
        serial_number: form.locNumber,
        customer_name: form.name,
        customer_phone: form.phoneNumber,
        customer_street: form.address,
        customer_township: form.township,
        otp_code : form.otpCode,
        activated_from : 'e_warranty_website'
    }).then((response) => {
        activated.value = true;
        successActivatedMessage();
        // router.push({ name: 'home' });
    }).catch((error) => {
        if(error.message = "OTP မှား ယွင်းနေပါသည်။") {
            invalidOtp.value = true;
            invalidOtpMessage();
        } else {
            console.error('OTP request failed:', error);
        }
    });
}

watch(selectedTownship, (newValue) => {
    if (newValue) {
        form.township = locale == 'en' ? newValue.township_en : newValue.township;
    }
});

</script>