<template>
    <div class="min-h-screen bg-contain bg-x-repeat bg-y-no-repeat" :style="{ backgroundImage: `url(${bgImage})` }">
        <!-- Header -->
        <Header />

        <!-- Main Content -->
        <main class="px-[5%] mt-10">
            <slot />
        </main>

        <!-- Footer -->
        <div class="fixed bottom-0 w-full text-right py-4 px-10">
            <div class="text-sm text-[#2E3192] flex justify-end items-center gap-4">
                <span>Copyright @ {{ new Date().getFullYear() }}</span>
                <span class="flex items-center gap-2"> Developed By <img src="@/assets/svg/za.svg" alt=""></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import bgImage from "@/assets/svg/bg.svg"
import Header from "@/layouts/Header.vue"
</script>

<style scoped>
/* Optional custom styles */
</style>
