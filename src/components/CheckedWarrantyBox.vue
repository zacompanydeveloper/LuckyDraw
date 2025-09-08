<template>
    <div class="relative border-2 bg-white border-blue-500 rounded-md p-4 w-full flex gap-4 items-center">
        <!-- Close button -->
        <button @click="removeCard" class="absolute top-2 right-2 text-red-500 text-xl font-bold">×</button>

        <!-- Product image -->
        <img :src="item.item_image" alt="Product" class="w-20 h-auto object-contain" />

        <!-- Product details -->
        <div>
            <p class="text-md font-medium">{{ item.item_code }}</p>
            <p class="text-sm text-[var(--base-color)]">{{ item.item_name }}</p>
            <p class="text font-bold mt-1">{{ helpers.priceFormat(item.item_sale_price) }}</p>
        </div>
    </div>
</template>

<script setup>
import helpers from '@/helper'
const props = defineProps({
    item: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['remove']);
const removeCard = () => {
    emit('remove');
}
</script>

<style scoped>
/* Optional: Add custom styles if needed */
</style>