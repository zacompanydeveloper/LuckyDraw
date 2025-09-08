<template>
    <DesktopLayout>
        <div>

            <!-- Title -->
            <div class="w-full flex z-40 text-[var(--base-color)] shadow">

                <div class="w-full flex z-40">
                    <div class="flex items-center justify-between p-2 px-3 w-full">
                        <div class="" @click="backFun">
                            <i class="pi pi-arrow-left text-[var(--base-color)] text-2xl" />
                        </div>

                        <p class=" font-bold text-center text-3xl">
                            {{ $t('e_warranty_activation_agreement') }}
                        </p>
                        <div class="w-10 h-10"></div>
                    </div>
                </div>
            </div>

            <!-- Form Table -->
            <div class=" w-full flex justify-center p-5" v-if="!loading">
                <div class=" bg-white shadow-lg border border-gray-100 rounded-lg w-[500px] p-5 flex flex-col gap-5"
                    v-if="isSuccess">

                    <!-- Link Expired -->
                    <div v-if="status && status == 'expired'" class="">

                        <div class=" p-3 bg-red-100 rounded text-center">
                            <p class="text-red-600 py-1 text font-bold">
                                Link Expired!
                            </p>
                            <p class=" text-sm text-red-500">
                                Sorry, the link you are trying to access has expired or is invalid.
                            </p>
                        </div>

                        <div class=" flex justify-center">
                            <img src='https://filedata.sweetyhomemm.com/sweety_home/ewarranty/icon/link-expired.svg'
                                alt="Expired" class=" h-[200px] w-[200px] object-cover mt-5">
                        </div>
                    </div>

                    <!-- Successfully Activated -->
                    <div v-if="status && status == 'activated'" class="">

                        <div class=" p-3 bg-green-100 rounded text-center">
                            <p class="text-green-600 py-1 text font-bold">
                                Warranty Activated Successfully!
                            </p>
                            <p class=" text-sm text-green-500">
                                Thank you for activating your warranty. Your product is now covered under our warranty
                                policy.
                            </p>
                        </div>

                        <div class=" flex justify-center">
                            <img src='https://filedata.sweetyhomemm.com/sweety_home/ewarranty/icon/Womanholdinginsurancepolicy.svg'
                                alt="Expired" class=" h-[200px] w-[200px] object-cover mt-5">
                        </div>
                    </div>


                    <!-- Customer Info -->
                    <div>
                        <p class="text-lg font-bold text-[var(--base-color)]">
                            {{ $t('customer_information') }}
                        </p>
                        <table class=" w-full my-3 border text-sm divide-y">
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('customer_name') }}
                                </td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.customerName }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('customer_phone') }}
                                </td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.customerPhone }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('customer_address') }}
                                </td>
                                <td class=" p-2 bg-[var(--light-color)] text-xs">{{ formData.customerAddress }}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Product Info -->
                    <div>
                        <p class="text-lg font-bold text-[var(--base-color)]">
                            {{ $t('product_information') }}
                        </p>
                        <table class=" w-full my-3 border text-sm divide-y">
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('order_date') }}</td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.orderDate }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('product') }}</td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.product }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('lot_number') }}</td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.lotNumber }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('category') }}</td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.category }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('location') }}</td>
                                <td class=" p-2 bg-[var(--light-color)] text-xs">{{ formData.location }}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Warranty Info -->
                    <div>
                        <p class="text-lg font-bold text-[var(--base-color)]">
                            {{ $t('warranty_information') }}
                        </p>
                        <table class=" w-full my-3 border text-sm divide-y">
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('warranty_type') }}
                                </td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.warrantyType }}</td>
                            </tr>
                            <tr>
                                <td class=" w-[30%] bg-[var(--base-color)] text-white p-2">{{ $t('warranty_period') }}
                                </td>
                                <td class=" p-2 bg-[var(--light-color)]">{{ formData.warrantyPeriod }}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Agreement -->
                    <div class=" flex flex-col gap-5" v-if="!status">
                        <p class="text-sm text-gray-600 my-3">
                            Before activating your warranty, please carefully read and agree to the following terms.
                            Please read and agree to the following terms before activating your warranty.
                        </p>

                        <div class=" flex justify-center">
                            <input type="checkbox" id="agreement" class="mr-2 bg-[var(--base-color)]"
                                v-model="agreed" />
                            <p>
                                I have read and agree to the warranty terms and conditions.
                            </p>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="flex w-full flex-row-reverse" v-if="agreed && !status">
                        <button class="w-[48%] bg-[var(--base-color)] text-white p-2 rounded-lg" @click="activateFun">
                            {{ $t('warranty_activate') }}
                        </button>
                    </div>

                </div>

                <div class=" bg-red-100 shadow-lg border border-red-200 rounded-lg w-[500px] p-5 flex flex-col justify-center items-center text-red-500 text-lg gap-5"
                    v-else>
                    Your Link is Invalid!
                </div>
            </div>

            <!-- Loading -->
            <div v-else class="w-full h-[80vh]">
                <Loading />
            </div>
        </div>
    </DesktopLayout>
</template>
<script setup>
import DesktopLayout from '@/layouts/DesktopLayout.vue';
import api from '@/api';
import { onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const status = ref(null);
const isSuccess = ref(true);
const formData = reactive({
    customerName: null,
    customerPhone: null,
    customerEmail: null,
    customerAddress: null,
    orderDate: null,
    product: null,
    lotNumber: null,
    category: null,
    location: null,
    warrantyType: null,
    warrantyPeriod: null,
    township: null
});

onMounted(() => {
    fetchData();
});

const agreed = ref(false);

function backFun() {
    router.push('/');
}

function fetchData() {
    loading.value = true;

    api.get('/warranty/informations', {
        'signature': route.params.signature,
        'data': route.params.base64data
    })
        .then(response => {
            transformData(response.data.data);
            isSuccess.value = true;
        })
        .catch(error => {
            if (error) {
                isSuccess.value = false
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

function transformData(data) {

    status.value = data.is_expired ? 'expired' : null;
    formData.customerName = data.customer_name;
    formData.customerPhone = data.customer_phone;
    formData.customerEmail = null; // No email field in the provided data
    formData.customerAddress = data.customer_address;
    formData.orderDate = data.order_date;
    formData.product = data.product_name;
    formData.lotNumber = data.serial_number;
    formData.category = data.category_name;
    formData.location = data.showroom_address;
    formData.township = data.township;
    formData.warrantyType = `${data.warranty_type.amount} ${data.warranty_type.type} warranty`;
    formData.warrantyPeriod = `(${data.warranty_type.period_start}) - (${data.warranty_type.period_end})`;
}

function activateFun() {

    api.post('/warranty/activate-by-customer', {
        serial_number: formData.lotNumber,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_street: formData.customerAddress,
        customer_township: formData.township,
        activated_from: 'e_warranty_sms_url',
    }).then((response) => {
        status.value = 'activated';
        isSuccess.value = true;
    })
}

</script>