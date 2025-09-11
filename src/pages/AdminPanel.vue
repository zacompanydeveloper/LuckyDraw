<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <DesktopLayout>
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import NotFound from "@/views/NotFound.vue"
import DesktopLayout from "@/layouts/DesktopLayout.vue"
import helper from "@/helper"
const isMobile = helper.isMobile()
</script>
