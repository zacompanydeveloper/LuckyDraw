<template>
            <div class="relative font-bole flex flex-col gap-3 bg-blue-100  p-5 w-full rounded-md border-2 border-blue-500">
                    <div class="text-blue-500 text-xl font-bold">{{ $t('warranty_type') }}</div>
                    <div class=" text">{{ warranty.period.amount }} {{ warranty.period.type }} warranty</div>
                    <div class=" text-sm"> From {{ warranty.period.period_start }} to {{ warranty.period.period_end }}</div>
            
            </div>
</template>
<script setup>
import { ref } from 'vue';

const props = defineProps({
    warranty: {
        type: Object,
        required: true
    }
});

</script>