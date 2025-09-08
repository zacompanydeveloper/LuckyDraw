<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <div class="min-h-screen bg-contain bg-x-repeat bg-y-no-repeat"
                :style="{ backgroundImage: `url(${bgImage})` }">
                <!-- Header -->
                <header class="w-full flex justify-center items-center shadow-xl py-5">
                    <img src="@/assets/svg/logo.svg" alt="logo" class="w-60" />
                </header>

                <!-- Main -->
                <main class="flex flex-col justify-center items-center gap-4 mt-20">
                    <img src="@/assets/svg/login.svg" alt="Login" />

                    <h1 v-if="step === 1" class="text-2xl font-bold text-[#2E3192]">Login</h1>
                    <h1 v-if="step === 2" class="text-2xl font-bold text-[#2E3192]">Confirmation Code</h1>

                    <InputText v-if="step === 1" v-model="email" placeholder="Email" type="email"
                        class="min-w-[336px] mt-4" size="large" autocomplete="off" />

                    <InputOtp v-if="step === 2" v-model="otp"
                        class="flex justify-center items-center min-w-[336px] mt-4" size="large" variant="filled"
                        :length="6" integerOnly />

                    <Button type="button" iconPos="right" :label="step === 1 ? 'Login' : 'Confirm'" size="large"
                        class="min-w-[336px] mt-4 cursor-pointer hover:opacity-90" :loading="loading"
                        @click.prevent="handleAction" style="background-color: #2E3192;" />
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import helper from "@/helper"
import bgImage from "@/assets/svg/bg.svg"
import NotFound from "@/views/NotFound.vue"
import backend from "@/api/backend"
import router from "@/router"

const isMobile = helper.isMobile()
const email = ref("admin@gmail.com")
const otp = ref("")
const loading = ref(false)
const step = ref(1)

/**
 * Request OTP
 */
const getOtp = async () => {
    loading.value = true
    try {
        const response = await backend.get(`/get-otp-with-email?email=${email.value}`)
        if (response.status === 200) {
            step.value = 2
            otp.value = String(response.data.otp) // For demo purpose only
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

/**
 * Verify OTP
 */
const confirmOtp = async () => {
    loading.value = true
    try {
        const response = await backend.post("/verify-email-otp", {
            email: email.value,
            otp: otp.value,
        })
        if (response.status === 200) {
            localStorage.setItem("adminToken", response.data.token)
            router.push("/admin-panel")
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

/**
 * Decide action based on step
 */
const handleAction = () => {
    step.value === 1 ? getOtp() : confirmOtp()
}
</script>
