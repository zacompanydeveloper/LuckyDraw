<template>
    <div>
        <DesktopLayout v-if="!isMobile">
        </DesktopLayout>
        <div v-else>
            <NotFound />
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import backend from "@/api/backend";
import helper from "@/helper";
import NotFound from "@/views/NotFound.vue";
import router from "@/router";
const isMobile = helper.isMobile()
const luckyDrawRecords = ref([]);
const loading = reactive({
    table: false,
});


</script>

<style lang="scss" scoped></style>