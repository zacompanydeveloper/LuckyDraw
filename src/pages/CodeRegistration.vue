<template>
    <div>
        <!-- Mobile view -->
        <NotFound v-if="isMobile" />

        <!-- Desktop view -->
        <DesktopLayout v-else>
            <!-- Show form if not successful -->
            <section v-if="!success" class="flex flex-col items-center mt-20">
                <h2 class="text-2xl text-center font-bold text-[#2E3192] mb-4">
                    {{ $t("register_activate_for_lucky_draw") }}
                </h2>

                <section class="w-[400px] flex flex-col gap-4 mt-5">
                    <FloatLabel variant="on">
                        <InputText id="shop_name" v-model="form.shop_name" fluid autocomplete="off" disabled />
                        <label for="shop_name">{{ $t("shop") }}</label>
                        <span class=" text-sm text-gray-500 ps-2">{{ form.shop_address }}</span>
                    </FloatLabel>

                    <!-- <FloatLabel variant="on">
                        <InputText v-model="form.shop_address" fluid autocomplete="off" disabled />
                        <label for="shop_address">{{ $t("shop_address") }}</label>
                    </FloatLabel> -->

                    <FloatLabel variant="on">
                        <InputText v-model="form.invoice_no" fluid autocomplete="off" />
                        <label for="invoice_no">{{ $t("voucher_no") }}</label>
                    </FloatLabel>

                    <FloatLabel variant="on">
                        <InputText v-model="form.amount" v-keyfilter.num fluid autocomplete="off" />
                        <label for="amount">{{ $t("amount") }}</label>
                    </FloatLabel>

                    <FloatLabel variant="on">
                        <InputText id="numkeys" v-model="form.phone" v-keyfilter.num fluid autocomplete="off" />
                        <label for="numkeys">{{ $t("phone_number") }}</label>
                    </FloatLabel>

                    <Button :label="$t('activate')" class="hover:opacity-90 w-full" :loading="loading"
                        :disabled="!isFormValid || loading" @click.prevent="calculateTicket" :style="{
                            backgroundColor: '#2E3192',
                            cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer'
                        }" />
                </section>
            </section>

            <!-- Success state -->
            <section v-if="success" class="flex flex-col items-center justify-center mt-20 w-[500px] mx-auto">
                <StatusCard type="success" :title="$t('activation_successful')" action
                    :message="$t('thank_you_for_joining')" :image="successImg" :contact="contact" />
            </section>
        </DesktopLayout>

        <Dialog v-model:visible="activationDialogVisible" modal :style="{ width: '25rem' }">
            <div class="mb-4">
                <h3 class="text-lg font-bold mb-2">Confirm Activation</h3>
                <p>Please confirm the following details before activation:</p>
                <ul class="list-disc list-inside mt-2">
                    <li><strong>Invoice No:</strong> {{ dialogData.invoice_no }}</li>
                    <li><strong>Amount:</strong> {{ dialogData.amount }}</li>
                    <li><strong>Phone:</strong> {{ dialogData.phone }}</li>
                    <li><strong>Chance to Win:</strong> {{ dialogData.chance }}</li>
                </ul>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="resetDialog" :disabled="loading"></Button>
                <Button type="button" label="Save" @click="activate" :loading="loading" :disabled="loading"
                    style="background-color: #2E3192;"></Button>
            </div>

        </Dialog>

        <Toast />
    </div>
</template>


<script setup>
import { reactive, ref, computed } from "vue"
import NotFound from "@/views/NotFound.vue"
import DesktopLayout from "@/layouts/DesktopLayout.vue"
import helper from "@/helper"
import backend from "@/api/backend"
import { useToast } from "primevue/usetoast"
import successImg from '@/assets/svg/success.svg'
import StatusCard from '@/components/StatusCard.vue'
import router from "@/router"

const toast = useToast();
const isMobile = helper.isMobile()
const loading = ref(false)
const success = ref(false)
const contact = ref();
const activationDialogVisible = ref(false)

const dialogData = reactive({
    invoice_no: "",
    amount: "",
    phone: "",
    chance: 0,
})

const form = reactive({
    invoice_no: "",
    amount: "",
    phone: "",
    shop_name: "Home Mart",
})

const isFormValid = computed(() => {
    return form.invoice_no && form.amount && form.phone && form.shop_name && form.amount >= 100000
})

const calculateTicket = async () => {
    if (!isFormValid.value) return

    loading.value = true

    try {
        const response = await backend.post("/lucky-draw/calculate-tickets", {
            amount: form.amount,
        })
        if (response.status === 200) {
            console.log("Calculation successful! =>", response)
            const chance = response.data.chance;
            dialogData.invoice_no = form.invoice_no;
            dialogData.amount = form.amount;
            dialogData.phone = form.phone;
            dialogData.chance = chance;
            activationDialogVisible.value = true;
        }
    } catch (error) {
        console.error(error)
        toast.add({ severity: "error", summary: "Calculation failed!", detail: error?.response?.data?.message || "An error occurred during calculation.", life: 3000 })
        loading.value = false
    }

    loading.value = false
}


const activate = async () => {
    if (!isFormValid.value) return

    loading.value = true

    try {
        const response = await backend.post("/lucky-draw/create-by-retail", {
            invoice_no: form.invoice_no,
            amount: form.amount,
            phone: form.phone,
        })
        if (response.status === 200) {
            resetDialog();
            console.log("Activation successful! =>", response)
            form.invoice_no = ""
            form.amount = ""
            form.phone = ""
            success.value = true
            contact.value = `Customer have ${response.data.chance} chance to win!`
        }
    } catch (error) {
        console.error(error)
        toast.add({ severity: "error", summary: "Activation failed!", detail: error?.response?.data?.message || "An error occurred during activation.", life: 3000 })
    } finally {
        loading.value = false
    }
}

const resetDialog = () => {
    activationDialogVisible.value = false;
    dialogData.invoice_no = "";
    dialogData.amount = "";
    dialogData.phone = "";
    dialogData.chance = 0;
};

const setShopName = () => {
    const user = helper.authUser();
    if (user && user.member_branch) {
        form.shop_name = user.member_branch;
        form.shop_address = user.township + ', ' + user.region || '';
    } else {
        localStorage.clear();
        router.push('/admin-login');
    }
};

setShopName();

</script>

<style lang="scss" scoped></style>