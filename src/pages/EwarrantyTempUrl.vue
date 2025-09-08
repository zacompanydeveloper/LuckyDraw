<template>
    <div>
        <div v-if="isMobile">
            <MobileEWarrantyTempUrlPage />
        </div>
        <div v-else>
            <DesktopEWarrantyTempUrlPage />
        </div>
    </div>
</template>
<script setup>
import helper from '@/helper'

const isMobile = helper.isMobile()
</script>