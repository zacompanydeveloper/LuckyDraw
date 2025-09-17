<template>
  <div class="flex flex-col justify-center items-center px-6 w-full">
    <div class="w-full rounded-md bg-white shadow-lg text-center p-4">
      <!-- Top message -->
      <div class="rounded-md py-2 mb-4 font-semibold" :class="type === 'success'
        ? 'bg-green-100 text-green-600'
        : 'bg-red-100 text-red-600'">
        {{ title }}
        <p class="text-sm font-normal mt-2 px-6" :class="type === 'success' ? 'text-green-500' : 'text-red-500'">
          {{ message }}
        </p>
      </div>

      <!-- Illustration -->
      <div class="flex justify-center">
        <img :src="image" :alt="title" class="w-[400px] h-auto" />
      </div>

      <!-- Bottom contact message (optional) -->
      <div v-if="contact || phone"
        :class="type === 'success' ? 'text-[#0F9500] text-lg' : 'text-red-500 text-sm font-medium'">
        <p>{{ contact }}</p>
        <p v-if="phone" class="font-semibold">{{ phone }}</p>
      </div>

      <!-- Action button (optional) -->
      <div v-if="action" class="mt-2">
        <Button :label="$t('ok')" class="w-full" :style="{ backgroundColor: '#2E3192' }" @click="refreshPage" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'success' }, // "success" or "error"
  title: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String, required: true },
  contact: { type: String, default: '' },
  phone: { type: String, default: '' },
  action: { type: Boolean, default: false }
})

import { useRouter } from 'vue-router'
const router = useRouter()

const refreshPage = () => {
  router.go(0); // Refresh the current page
}
</script>

<style scoped>
.w-120 {
  width: 120px;
}
</style>
