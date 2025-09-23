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
                        <span class="text-sm text-gray-500 ps-2">{{
                            form.shop_address
                        }}</span>
                    </FloatLabel>

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
                            cursor: !isFormValid || loading ? 'not-allowed' : 'pointer',
                        }" />
                </section>
            </section>

            <!-- Success state -->
            <section v-if="success" class="flex flex-col items-center justify-center mt-20 w-[500px] mx-auto">
                <StatusCard type="success" :title="$t('activation_successful')" action
                    :message="$t('thank_you_for_joining')" :image="successImg" :contact="contact" />
            </section>
        </DesktopLayout>

        <Dialog v-model:visible="activationDialogVisible" :closable="false" :show-header="false" modal
            :style="{ width: '60%' }">
            <div class="p-6">
                <h3 class="text-xl mb-4 text-[#2E3192]">
                    {{ $t("confirm_activation") }}
                </h3>
                <p class="mb-4">
                    {{
                        $t(
                            "please_confirm_the_information_and_the_number_of_tickets_received_are_correct?"
                        )
                    }}
                </p>
                <img src="@/assets/svg/confirmation.svg" alt="" srcset="" class="mx-auto w-80 mb-4" />
                <div class="grid grid-cols-2 gap-4 text-[#2E3192] my-8">
                    <div>
                        <span class="font-medium me-2">{{ $t("voucher_no") }}:</span>
                        <span>{{ dialogData.invoice_no }}</span>
                    </div>
                    <div>
                        <span class="font-medium me-2">{{ $t("phone_number") }}:</span>
                        <span>{{ dialogData.phone }}</span>
                    </div>
                    <div>
                        <span class="font-medium me-2">{{ $t("amount") }}:</span>
                        <span>{{ helper.priceFormat(dialogData.amount) }} {{ $t("ks")  }}</span>
                    </div>
                    <div>
                        <span class="font-medium me-2">{{ $t("ticket") }}:</span>
                        <span>{{ dialogData.chance }}</span>
                    </div>
                </div>
                <div class="flex w-[80%] gap-4 mx-auto">
                    <Button type="button" class="w-full" :label="$t('cancel')" severity="secondary" @click="resetDialog"
                        :disabled="loading"></Button>
                    <Button type="button" class="w-full" :label="$t('activate')" @click="activate" :loading="loading"
                        :disabled="loading" style="background-color: #2e3192"></Button>
                </div>
            </div>
        </Dialog>

        <Toast />
    </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import NotFound from "@/views/NotFound.vue";
import DesktopLayout from "@/layouts/DesktopLayout.vue";
import helper from "@/helper";
import backend from "@/api/backend";
import { useToast } from "primevue/usetoast";
import successImg from "@/assets/svg/success.svg";
import StatusCard from "@/components/StatusCard.vue";
import router from "@/router";

const toast = useToast();
const isMobile = helper.isMobile();
const loading = ref(false);
const success = ref(false);
const contact = ref();
const activationDialogVisible = ref(false);

const dialogData = reactive({
    invoice_no: "",
    amount: "",
    phone: "",
    chance: 0,
});

const form = reactive({
    invoice_no: "",
    amount: "",
    phone: "",
    shop_name: "Home Mart",
});

const isFormValid = computed(() => {
    return (
        form.invoice_no &&
        form.amount &&
        form.phone &&
        form.shop_name &&
        form.amount >= 100000
    );
});

const calculateTicket = async () => {
    if (!isFormValid.value) return;

    loading.value = true;

    try {
        const response = await backend.post("/lucky-draw-tickets/calculate-tickets", {
            amount: form.amount,
        });
        if (response.status === 200) {
            const chance = response.data.chance;
            dialogData.invoice_no = form.invoice_no;
            dialogData.amount = form.amount;
            dialogData.phone = form.phone;
            dialogData.chance = chance;
            activationDialogVisible.value = true;
        }
    } catch (error) {
        console.error(error);
        toast.add({
            severity: "error",
            summary: "Calculation failed!",
            detail:
                error?.response?.data?.message ||
                "An error occurred during calculation.",
            life: 3000,
        });
        loading.value = false;
    }

    loading.value = false;
};

const activate = async () => {
    if (!isFormValid.value) return;

    loading.value = true;

    try {
        const response = await backend.post("/lucky-draw-tickets/create-by-retail", {
            invoice_no: form.invoice_no,
            amount: form.amount,
            phone: form.phone,
        });
        if (response.status === 200) {
            resetDialog();
            form.invoice_no = "";
            form.amount = "";
            form.phone = "";
            success.value = true;
            contact.value = `Customer have ${response.data.chance} chance to win!`;
        }
    } catch (error) {
        console.error(error);
        toast.add({
            severity: "error",
            summary: "Activation failed!",
            detail:
                error?.response?.data?.message ||
                "An error occurred during activation.",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

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
        form.shop_address = user.township + ", " + user.region || "";
    } else {
        localStorage.clear();
        router.push("/admin-login");
    }
};

setShopName();
</script>

<style>
.p-dialog .p-dialog-header {
    border: none;
}
</style>
