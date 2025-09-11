<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <DesktopLayout v-else>
            <!-- Page Content -->
            <section class="flex flex-col items-center mt-10">
                <!-- Registration Form -->
                <h2 class="text-2xl text-center font-bold text-[#2E3192] mb-4">
                    Register Activate for Lucky Draw
                </h2>

                <section class=" w-[330px] flex flex-col gap-2">
                    <InputText type="text" v-model="form.invoice_no" placeholder="Voucher No." fluid />
                    <InputText type="text" v-model="form.amount" v-keyfilter.num placeholder="Amount" fluid />
                    <InputText id="numkeys" v-model="form.phone" v-keyfilter.num placeholder="Phone Number" fluid
                        autocomplete="off" />
                    <Button type="button" iconPos="right" label="Activate"
                        :style="{ cursor: isFormValid ? 'pointer' : 'not-allowed' }" :disabled="!isFormValid"
                        @click.prevent="activate()" style="background-color: #2E3192;" />
                </section>
            </section>
        </DesktopLayout>
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

const toast = useToast();

const isMobile = helper.isMobile()

const form = reactive({
    invoice_no: "testvoucher",
    amount: "20000",
    phone: "09884664867",
})

const isFormValid = computed(() => {
    return form.invoice_no && form.amount && form.phone
})

const activate = () => {
    if (!isFormValid.value) return

    backend.post("/lucky-draw/create-by-retail", {
        invoice_no: form.invoice_no,
        amount: form.amount,
        phone: form.phone,
    }).then((response) => {
        if (response.data.success) {
            console.log("Activation successful!")
            form.invoice_no = ""
            form.amount = ""
            form.phone = ""
        }
    }).catch((error) => {
        console.error(error)
        toast.add({ severity: "error", summary: "Activation failed!", detail: error?.response?.data?.message || "An error occurred during activation.", life: 3000 })
    })
}

</script>

<style lang="scss" scoped></style>