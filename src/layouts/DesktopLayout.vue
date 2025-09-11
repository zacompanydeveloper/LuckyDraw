<template>
    <div class="min-h-screen bg-contain bg-x-repeat bg-y-no-repeat" :style="{ backgroundImage: `url(${bgImage})` }">
        <!-- Header -->
        <Header />

        <!-- Main Content -->
        <main class="px-[5%] mt-10">
            <slot />
        </main>
    </div>
</template>

<script setup>
import bgImage from "@/assets/svg/bg.svg"
import Header from "@/layouts/Header.vue"
</script>

<style scoped>
/* Optional custom styles */
</style>
