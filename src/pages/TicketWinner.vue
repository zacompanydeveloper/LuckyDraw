<template>
    <div>
        <DesktopLayout v-if="!isMobile">

            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-[#2E3192]">{{ $t('ticket_winner') }}</h2>
                <Button type="button" v-tooltip.top="$t('download_winners_list')" iconPos="right" icon="pi pi-download"
                    @click="exportData" raised style="background-color: #2E3192;" />
            </div>
            <!-- Table -->
            <div class="card mt-2">
                <DataTable class="mt-2" dataKey="id" showGridlines stripedRows :value="winners" :loading="loading.table"
                    scrollable scrollDirection="both" scrollHeight="500px" tableStyle="min-width: 150rem">

                    <Column headerStyle="background-color: #2E3192; color: white; width:3rem" class="table-header"
                        :header="$t('no')">
                        <template #body="slotProps">
                            {{ pagination.from + slotProps.index }}
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="created_at" :header="$t('created_date')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('prizes')">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <img :src="slotProps.data?.prize?.image?.url" :alt="slotProps.data?.prize?.id"
                                    class="w-10 rounded" />
                                <span>{{ slotProps.data?.prize?.name }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="customer_name" :header="$t('customer')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header" field="phone"
                        :header="$t('customer_phone')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="tracking_code" :header="$t('gift_code')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="shop_name" :header="$t('shop')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="business_type" :header="$t('business_type')">
                        <template #body="slotProps">
                            {{ $t(slotProps.data.business_type) }}
                        </template>
                    </Column>

                    <Column headerStyle="background-color: #2E3192; color: white;" class="table-header"
                        field="serial_code" :header="$t('serial_code')" />

                    <Column headerStyle="background-color: #2E3192; color: white;" :header="$t('action')"
                        class="w-24 table-header" :headerStyle="{ textAlign: 'right' }">
                        <template #body="{ data }">
                            <div class="flex justify-center items-center">
                                <Button v-tooltip.top="$t('export_png')" icon="pi pi-download" @click="exportPNG(data)"
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
            </div>

        </DesktopLayout>
        <div v-else>
            <NotFound />
        </div>

        <!-- Winner Dialog -->
         <div class="export-container-wrapper absolute top-[-10000px] left-[-10000px]">
        <div ref="imageContainer"
            :style="{ backgroundImage: `url(${bgImage})` }"
            class="winner-dialog flex items-center justify-center audiowide-regular w-full max-w-[1000px]  aspect-square py-6">
            <div
                class="flex flex-col justify-between items-center gap-4 w-full h-full text-center text-[#080D88] relative">
                <div class="w-full flex justify-between">
                    <img src="@/assets/images/sweetyhome_logo.png" alt="" srcset="">
                    <img src="@/assets/images/30_years_anni.png" alt="" srcset="">
                </div>
                <div class="w-full max-w-[820px]">
                    <h1 class="text-[#080D88] text-[75.85px] uppercase mb-4">Congratulation</h1>
                    <h3 class="text-[55.35px] uppercase">Winner is</h3>
                </div>
                <div class="flex flex-col items-center gap-4 w-full max-w-[820px]">
                    <p class="text-[49.91px] flex items-center font-semibold uppercase py-4 px-3 inter-custom text-white bg-[#2E3192]">
                        {{ selectedCustomer?.shop_name }} | {{ selectedCustomer?.shop_township }}
                    </p>
                    <h1 class="text-[65.56px] font-normal">{{ selectedCustomer?.name }}</h1>
                    <p class="text-[36px] text-[#2E3192] inter-custom">
                        {{ selectedCustomer?.township }}
                    </p>
                    <p class="text-[36px] font-light text-[#2E3192] inter-custom">
                        {{ selectedCustomer?.nrc }}
                    </p>
                    <div class="relative w-full min-w-[610px] mt-6">
                        <img :src="selectedPrize?.image" alt="prize"
                            class="w-50 object-contain absolute bottom-2 left-2" />
                        <h1
                            class="text-[61.74px] inter-custom font-semibold text-white text-shadow-lg ps-50 rounded-lg">
                            {{ selectedPrize?.name }} {{ selectedPrize?.color }}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import bgImage from "@/assets/images/winner_export_bg.png";
import examplePrize from "@/assets/images/prize.png";
import html2canvas from "html2canvas";
import { useI18n } from "vue-i18n";
import helper from "@/helper";
import backend from "@/api/backend";
import NotFound from "@/views/NotFound.vue";

const toast = useToast();
const { t } = useI18n();

const imageContainer = ref(null);
const selectedCustomer = ref({
    name: 'Ye Thura',
    shop_name: 'Pro(1)',
    shop_township: 'Botathaung',
    township: 'Sanchaung',
    nrc: '12/KaLaNa(N)123456',
});
const selectedPrize = ref({
    name: 'Iphone 16 Pro',
    color: 'White Titanium',
    image: examplePrize,
});

const isMobile = helper.isMobile();

const winners = ref([]);
const loading = reactive({
    table: false,
});
const pagination = reactive({
    page: 1,
    rows: 10,
    totalRecords: 0,
    from: 0,
});

const fetchWinnerData = async (page = 1) => {
    try {
        loading.table = true;
        const response = await backend.get('/lucky-draw-tickets/ticket-winners', {
            params: {
                page
            }
        });
        console.log('Winner Data:', response.data);
        winners.value = response.data.data;
        // Update pagination info

        pagination.totalRecords = response.data?.meta.total;
        pagination.page = response.data?.meta.current_page;
        pagination.rows = response.data?.meta.per_page;
        pagination.from = response.data?.meta.from;

    } catch (error) {
        console.error('Error fetching winner data:', error);
    }
    finally {
        loading.table = false;
    }
};

const onPageChange = (event) => {
    pagination.page = event.page + 1; // PrimeVue Paginator is zero-based
    fetchWinnerData(pagination.page);
};

const exportData = async () => {
    try {
        loading.table = true;
        const { data, status } = await backend.get("/lucky-draw-tickets/ticket-winners/export");
        if (status === 200) {
            const url = data.url;
            const link = document.createElement('a');
            link.href = url;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.add({
                severity: "success",
                summary: t('success'),
                detail: t('export_successful'),
                life: 3000
            });
        }
    } catch (error) {
        console.error("Error exporting data:", error);
        toast.add({
            severity: "error",
            summary: t('error'),
            detail: error.response?.data?.message || t('error_occurred'),
            life: 5000
        });
    } finally {
        loading.table = false;
    }
};

// png export for winner info
const exportPNG = async (data) => {
    selectedCustomer.value = {
        name: data.customer_name,
        shop_name: data.shop_name,
        shop_township: data.shop_township,
        township: data.township,
        nrc: data.nrc,
    };

    selectedPrize.value = {
        name: data.prize.name,
        color: data.prize.color || '',
        image: data.prize.image.url,
    };
    loading.table = true;
    console.log('Selected Customer:', selectedCustomer.value);
    console.log('Selected Prize:', selectedPrize.value);
    try {
        // need to settime here to wait for DOM update
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const captureElement = imageContainer.value;

        // do i need to wait here ?
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log('logging the capture element:', captureElement);
        
        html2canvas(captureElement, {
            useCORS: true,
            allowTaint: true,
        }).then((canvas) => {
            const image = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = image;
            link.download = "winner.png";
            link.click();
        });
        loading.table = false;
    } catch (error) {
        loading.table = false;
        console.error("Error exporting PNG:", error);
        toast.add({
            severity: "error",
            summary: t('error'),
            detail: error.response?.data?.message || t('error_occurred'),
            life: 5000
        });
    }
};

onMounted(() => {
    fetchWinnerData();
});
</script>

<style lang="scss" scoped></style>