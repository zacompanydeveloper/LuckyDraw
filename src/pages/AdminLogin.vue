<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <div class="min-h-screen bg-contain bg-x-repeat bg-y-no-repeat"
                :style="{ backgroundImage: `url(${bgImage})` }">
                <!-- Header -->
                <header class="w-full flex justify-between items-center shadow-xl py-2 px-8">
                    <div class="flex items-center gap-2">
                        <img src="@/assets/svg/logo.svg" alt="logo" class="" />
                        <span>|</span>
                        <div class="font-bold text-[#2E3192]">{{ $t('lucky_draw_app') }}</div>
                    </div>

                    <!-- Language Selector -->
                    <LanguageSwitcher />
                </header>

                <!-- Mode toggle -->
                <!-- <div class="bottom-0 right-0 fixed m-4 flex items-center gap-2 rounded-full shadow-lg min-w-[90px] min-h-[36px] px-3"
                    :class="checked ? '' : 'opacity-50'">
                    <ToggleSwitch v-model="checked">
                        <template #handle="{ value }">
                            <i :class="['!text-xs pi', { 'pi-check': value, 'pi-times': !value }]" />
                        </template>
                    </ToggleSwitch>
                    <p class="!text-xs min-w-[50px]" :class="checked ? 'text-blue-500' : 'text-red-500'">
                        {{ $t(checked ? 'testing' : 'live') }}
                    </p>
                </div> -->

                <!-- Main -->
                <main class="flex flex-col justify-center items-center gap-4 mt-20">
                    <img src="@/assets/svg/login.svg" alt="Login" />

                    <h1 v-if="step === 1" class="text-2xl font-bold text-[#2E3192]">{{ $t('login') }}</h1>
                    <h1 v-else class="text-2xl font-bold text-[#2E3192]">{{ $t('confirmation_code') }}</h1>

                    <InputText v-if="step === 1" v-model="email" :placeholder="$t('email')" type="email"
                        class="min-w-[336px] mt-4" autocomplete="off" />

                    <InputOtp v-if="step === 2" v-model="otp"
                        class="flex justify-center items-center min-w-[336px] mt-4" variant="filled"
                        :length="6" integerOnly />

                    <Button type="button" iconPos="right" :label="$t(step === 1 ? 'login' : 'confirm')"
                        class="min-w-[336px] mt-4 cursor-pointer hover:opacity-90" :loading="loading"
                        @click.prevent="handleAction" style="background-color: #2E3192;" />
                </main>
            </div>
        </div>
        <Toast />
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'primevue/usetoast';
import helper from "@/helper";
import bgImage from "@/assets/svg/bg.svg";
import NotFound from "@/views/NotFound.vue";
import backend from "@/api/backend";
import router from "@/router";

const { locale } = useI18n();
const toast = useToast();
const isMobile = helper.isMobile();
const email = ref("");
const otp = ref("");
const loading = ref(false);
const step = ref(1);

// Request OTP
const getOtp = async () => {
    loading.value = true;
    try {
        const response = await backend.get(`/get-otp-with-email?email=${email.value}`);
        if (response.status === 200) {
            step.value = 2;
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'OTP sent to your email successfully',
                life: 3000
            });
        }
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to send OTP. Please try again.',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

// Verify OTP
const confirmOtp = async () => {
    loading.value = true;
    try {
        const response = await backend.post("/verify-email-otp", {
            email: email.value,
            otp: otp.value,
        });
        if (response.status === 200) {
            localStorage.setItem("adminToken", response.data.token);
            localStorage.setItem("userPermissions", JSON.stringify(response.data.user?.permissions));
            localStorage.setItem("userInfo", JSON.stringify(response.data.user));
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Login successful! Welcome back.',
                life: 3000
            });
            router.push("/admin-panel");
        }
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Invalid OTP',
            detail: error.response?.data?.message || 'Invalid OTP code. Please check and try again.',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

// Decide action
const handleAction = () => {
    step.value === 1 ? getOtp() : confirmOtp();
};

// testing/live switch
const checked = ref(localStorage.getItem("mode") === "testing");

watch(checked, (newVal) => {
    localStorage.setItem("mode", newVal ? "testing" : "live");
});
</script>
