<template>
    <div class="flex-col justify-center items-center flex w-full">
        <slide-verify ref="block" :slider-text="text" :accuracy="accuracy" @again="onAgain" @success="onSuccess"
            @fail="onFail" @refresh="onRefresh" :imgs="images"></slide-verify>
        <div class="text-center mt-1">{{ msg }}</div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import SlideVerify from 'vue3-slide-verify';
import sh1 from '@/assets/recaptcha/sh-1.jpg';
import sh2 from '@/assets/recaptcha/sh-2.jpg';
import sh3 from '@/assets/recaptcha/sh-3.jpg';
import sh4 from '@/assets/recaptcha/sh-4.png';

import "vue3-slide-verify/dist/style.css";

const emits = defineEmits(['update']);
const block = ref(null);
const msg = ref("");
const text = "Slide to verify";
const images = [
    sh1,
    sh2,
    sh3,
    sh4
];
const isSuccessful = ref(false);
const accuracy = 5;

const onAgain = () => {
    msg.value = "Human verification failed! Please try again";
    block.value?.refresh();
};

const onSuccess = (times) => {
    msg.value = `Human verify successful`;
    isSuccessful.value = true;
};

const onFail = () => {
    msg.value = "Human Verification failed";
    isSuccessful.value = false;
};

const onRefresh = () => {
    msg.value = "";
    isSuccessful.value = false;
};

// Watch for changes in isSuccessful and emit an event
watch(isSuccessful, (newValue) => {
    emits('update', newValue);
});
</script>