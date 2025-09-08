<template>
    <div>
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

const isMobile = helper.isMobile()
</script>