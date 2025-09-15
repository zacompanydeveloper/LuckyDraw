<template>
    <!-- Header -->
    <header class="w-full flex justify-between items-center shadow-xl py-2 px-10">
        <div>
            <Drawer v-model:visible="visible" header="Lucky Draw App" :show-close-icon="false" class="rounded-e-lg"
                style="color: #2E3192;">
                <ul class="flex flex-col gap-1">
                    <li v-can="'view-dashboard'">
                        <router-link to="/admin-panel" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-home"></i>
                            {{ $t('home') }}
                        </router-link>
                    </li>

                    <li v-can="'view-registration'">
                        <router-link to="/admin-panel/code-registration" active-class=" bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-file-edit"></i>
                            {{ $t('registration') }}
                        </router-link>
                    </li>

                    <li v-can="'view-preprint'">
                        <router-link to="/admin-panel/pre-print-code" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-print"></i>
                            {{ $t('pre_print_code') }}
                        </router-link>
                    </li>

                    <li v-can="'view-sms'">
                        <router-link to="/" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-envelope"></i>
                            {{ $t('sms_records') }}
                        </router-link>
                    </li>
                </ul>
                <template #footer class="p-0">
                    <div class="flex justify-between items-center no-wrap gap-2 text-[#2E3192]">
                        <div class="flex items-center gap-2 p-2">
                            <i class="pi pi-user border rounded-full p-1"></i>
                            <span>{{ name }} </span>
                            <span class=" text-red-500 text-xs">({{ role }})</span>
                        </div>
                        <i class="pi pi-sign-out cursor-pointer" style="color: red" @click="logout"></i>
                    </div>
                </template>
            </Drawer>
            <i class="pi pi-bars text-2xl text-[#2E3192] cursor-pointer" @click="visible = true"></i>
        </div>

        <div class="flex items-center gap-2">
            <img src="@/assets/svg/logo.svg" alt="logo" class="w-50" />
            <span> | </span>
            <div class="font-bold text-[#2E3192]">Lucky Draw App</div>
        </div>
    </header>
</template>

<script setup>
import { ref } from "vue";
import router from "@/router";
import helper from "@/helper";

const visible = ref(false);
const user = helper.authUser();
const name = user ? user.name : "Admin";
const role = user ? user.role : "admin";

const logout = () => {
    localStorage.clear();
    router.push("/admin-login")
}

</script>

<style></style>
