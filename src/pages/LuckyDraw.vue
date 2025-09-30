<template>
    <div>
        <div
            class="top-0 right-0 fixed m-4 flex justify-center items-center rounded-full min-h-[36px]">
            <LanguageSwitcher />
        </div>

        <div v-if="isMobile">
            <MobileLuckyDrawPage />
        </div>
        <div v-else>
            <DesktopLuckyDrawPage />
        </div>
    </div>
</template>
<script setup>
import helper from '@/helper'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const isMobile = helper.isMobile()

const checked = ref(localStorage.getItem('mode') === 'testing');

watch(checked, (newVal) => {
    if (newVal) {
        localStorage.setItem('mode', 'testing');
    } else {
        localStorage.setItem('mode', 'live');
    }
});
</script>