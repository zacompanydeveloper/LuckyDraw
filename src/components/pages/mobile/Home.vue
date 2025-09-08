<template>
    <MobileLayout>

        <!-- Widgets -->
        <div class=" w-full flex justify-center p-5 items-center h-full">
            <div class=" grid grid-cols-2 gap-5 w-full">
                <RouterLink v-for="widget,index in widgets" :key="index" :to="widget.href">
                    <div class="bg-blue-50 rounded-md p-3 flex flex-col justify-center items-center">
                        <div>
                            <img :src="widget.image" alt="Widget Image" class="w-40 h-40 mb-2">
                        </div>
                        <div class="text-center text-[var(--base-color)] font-bold">
                            {{ $t(widget.name) }}
                        </div>
                    </div>
                </RouterLink>
            </div>
        </div>


    </MobileLayout>
</template>
<script setup>
import { RouterLink } from 'vue-router';

import DesktopLayout from '@/layouts/DesktopLayout.vue';

const widgets = [
    {
        name: 'warranty_activate',
        image: 'https://shassets.sgp1.cdn.digitaloceanspaces.com/home_mall/general/Form%20Application.svg',
        href : '/activate'
    },
    {
        name: 'warranty_check',
        image: 'https://shassets.sgp1.cdn.digitaloceanspaces.com/home_mall/general/Claims%20History.svg',
        href : '/check'
    }
];

</script>