<template>
    <div>
        <div v-if="isMobile">
            <MobileCheckPage />
        </div>
        <div v-else>
            <DesktopCheckPage />
        </div>
    </div>
</template>
<script setup>
import helper from '@/helper'

const isMobile = helper.isMobile()


</script>
