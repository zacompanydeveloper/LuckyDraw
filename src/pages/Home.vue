<template>
    <div>
        <div v-if="isMobile">
            <MobileHomePage />
        </div>
        <div v-else>
            <DesktopHomePage />
        </div>
    </div>
</template>
<script setup>
import helper from '@/helper'
const isMobile = helper.isMobile()
</script>
