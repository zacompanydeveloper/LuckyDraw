<template>
    <div>
        <!-- Mobile view -->
        <NotFound v-if="isMobile" />

        <!-- Desktop view -->
        <DesktopLayout v-else>
            <!-- Show form if not successful -->
            <section v-if="!success" class="flex flex-col items-center mt-20">
                <h2 class="text-2xl text-center font-bold text-[#2E3192] mb-4">
                    Register Activate for Lucky Draw
                </h2>

                <section class="w-[330px] flex flex-col gap-4 mt-5">
                    <FloatLabel variant="on">
                        <InputText v-model="form.invoice_no" fluid autocomplete="off" />
                        <label for="invoice_no">Voucher No.</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <InputText v-model="form.amount" v-keyfilter.num fluid autocomplete="off" />
                        <label for="amount">Amount</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                        <InputText id="numkeys" v-model="form.phone" v-keyfilter.num fluid
                            autocomplete="off" />
                        <label for="numkeys">Phone Number</label>
                    </FloatLabel>

                    <Button label="Activate" class="cursor-pointer hover:opacity-90 w-full" :loading="loading"
                        :disabled="!isFormValid || loading" @click.prevent="activate"
                        :style="{ backgroundColor: '#2E3192', cursor: isFormValid && !loading ? 'pointer' : 'not-allowed' }" />
                </section>
            </section>

            <!-- Success state -->
            <section v-if="success" class="flex flex-col items-center justify-center mt-20 w-[500px] mx-auto">
                <StatusCard type="success" title="Activation Successfully!"
                    message="Thank you for joining our lucky draw!" :image="successImg" :contact="contact" />
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
import successImg from '@/assets/svg/success.svg'
import StatusCard from '@/components/StatusCard.vue'

const toast = useToast();
const isMobile = helper.isMobile()
const loading = ref(false)
const success = ref(false)
const contact = ref();

const form = reactive({
    invoice_no: "",
    amount: "",
    phone: "",
})

const isFormValid = computed(() => {
    return form.invoice_no && form.amount && form.phone && form.amount >= 100000
})

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

</script>

<style lang="scss" scoped></style>