<template>
    <div>
        <div
            class="top-0 right-0 fixed m-4 flex justify-center items-center gap-2 rounded-full min-w-[90px] min-h-[36px] px-3">
            <!-- <ToggleSwitch v-model="checked">
                <template #handle="{ checked }">
                    <span class="text-[10px] font-semibold" :class="checked ? 'text-red-500' : 'text-red-500'">
                        {{ checked ? $t('testing') : $t('live') }}
                    </span>
                </template>
            </ToggleSwitch> -->
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