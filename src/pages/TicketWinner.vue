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
import { onMounted, ref } from "vue";
import helper from "@/helper";
import backend from "@/api/backend";
import NotFound from "@/views/NotFound.vue";

const isMobile = helper.isMobile();

const fetchWinnerData = async () => {
    try {
        const response = await backend.get('/lucky-draw-tickets/ticket-winners');
        console.log('Winner Data:', response.data);
    } catch (error) {
        console.error('Error fetching winner data:', error);
    }
};

onMounted(() => {
    fetchWinnerData();
});
</script>

<style lang="scss" scoped></style>