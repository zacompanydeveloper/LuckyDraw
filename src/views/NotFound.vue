<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
    <!-- 404 Number -->
    <h1 class="text-8xl font-extrabold text-black">404</h1>

    <!-- Message -->
    <p class="mt-4 text-2xl font-semibold text-gray-700">
      Oops, This Page Not Found!
    </p>
    <p class="mt-2 text-gray-500">
      The link might be corrupted,<br />
      or the page may have been removed
    </p>

    <!-- Button -->
    <router-link
      to="/"
      class="mt-6 inline-block px-6 py-3 bg-black text-white text-sm font-medium uppercase rounded hover:bg-gray-800 transition"
    >
      Go Back Home
    </router-link>
  </div>
</template>

<script setup>
// Static page, no logic needed
</script>
