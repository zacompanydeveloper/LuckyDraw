<template>
    <!-- Header -->
    <header class="w-full flex justify-between items-center shadow-xl py-2 px-10">
        <div class="flex items-center gap-4">
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

                    <li v-can="'activate-lucky-draw'">
                        <router-link to="/admin-panel/code-registration" active-class=" bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-file-edit"></i>
                            {{ $t('registration') }}
                        </router-link>
                    </li>

                    <li v-can="'view-lucky-draw'">
                        <router-link to="/admin-panel/lucky-draw" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-gift"></i>
                            {{ $t('lucky_draw_ticket') }}
                        </router-link>
                    </li>

                    <li v-can="'view-sms'">
                        <router-link to="/admin-panel/sms-records" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-envelope"></i>
                            {{ $t('sms_records') }}
                        </router-link>
                    </li>

                    <li v-can="'manage-prize'">
                        <router-link to="/admin-panel/prizes" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-trophy"></i>
                            {{ $t('prizes') }}
                        </router-link>
                    </li>

                    <li v-can="'view-preprint'">
                        <router-link to="/admin-panel/pre-print-code" active-class="bg-[#2E3192]/10"
                            class="w-full flex items-center gap-2 text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-print"></i>
                            {{ $t('pre_print_code') }}
                        </router-link>
                    </li>
                </ul>
                <template #footer class="p-0">
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center no-wrap gap-2 text-[#2E3192] pb-2">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-user border rounded-full p-1"></i>
                                <span class=" text-nowrap">{{ name }} </span>
                                <span class=" text-red-500 text-xs">({{ role }})</span>
                            </div>
                            <i class="pi pi-sign-out cursor-pointer" style="color: red" @click="logout"></i>
                        </div>
                    </div>
                </template>
            </Drawer>
            <i class="pi pi-bars text-2xl text-[#2E3192] cursor-pointer" @click="visible = true"></i>
            <p class="!text-sm border px-2" :class="checked ? 'text-blue-500 bg-blue-100' : 'text-red-500 bg-red-100'">
                {{ checked ?
                    'testing'
                    : 'live'
                }}</p>
        </div>



        <div class="flex items-center gap-2">
            <img src="@/assets/svg/logo.svg" alt="logo" class="w-50" />
            <span> | </span>
            <div class="font-bold text-[#2E3192]">Lucky Draw App</div>
            <span> | </span>
            <LanguageSwitcher />
        </div>
    </header>
</template>

<script setup>
import { ref, watch } from "vue";
import router from "@/router";
import helper from "@/helper";
import { useI18n } from "vue-i18n";

const visible = ref(false);
const user = helper.authUser();
const name = user ? user.name : "Admin";
const role = user ? user.role : "admin";

const { locale } = useI18n();
const currentLocale = ref(locale.value);

const isEnglish = ref(true) // true => English, false => Myanmar

// Update locale when toggle changes
const onToggle = () => {
    changeLocale(isEnglish.value ? 'en' : 'mm')
}

watch(isEnglish, (val) => {
    currentLocale.value = val ? 'en' : 'mm'
})

const changeLocale = (lang) => {
    locale.value = lang;
    currentLocale.value = lang;
    localStorage.setItem('locale', lang);
}

const logout = () => {
    localStorage.clear();
    router.push("/admin-login")
}

const checked = ref(localStorage.getItem('mode') === 'testing');

</script>

<style></style>
