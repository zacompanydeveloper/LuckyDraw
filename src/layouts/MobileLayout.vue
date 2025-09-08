<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <Header />

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto">
            <slot />
        </main>

        <!-- Footer -->
    </div>
</template>
<script setup>
import Header from '@/layouts/Header.vue';
</script>