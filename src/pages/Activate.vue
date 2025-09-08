<template>
    <div>
        <div v-if="isMobile">
            <MobileActivatePage />
        </div>
        <div v-else>
            <DesktopActivatePage />
        </div>
    </div>
</template>
<script setup>
import helper from '@/helper'

const isMobile = helper.isMobile()


</script>
