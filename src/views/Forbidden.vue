<template>
    <DesktopLayout>
        <div class="flex flex-col items-center justify-center text-center px-4 py-20 min-h-[70vh]">
            <!-- 403 Number -->
            <h1 class="text-8xl font-extrabold text-red-700">403</h1>

            <!-- Message -->
            <p class="mt-4 text-2xl font-semibold text-red-700">
                Oops, You Don't Have Permission to Access This Page!
            </p>
            <p class="mt-2 text-gray-500">
                You might not have the necessary rights,<br />
                or the page may be restricted
            </p>

            <!-- Button -->
            <router-link to="/"
                class="mt-6 inline-block px-6 py-3 bg-[#2E3192] text-white text-sm font-medium uppercase rounded hover:opacity-90 transition">
                Go Back Home
            </router-link>
        </div>
    </DesktopLayout>
</template>

<script setup>
// Static page, no logic needed

import DesktopLayout from "@/layouts/DesktopLayout.vue";
</script>
