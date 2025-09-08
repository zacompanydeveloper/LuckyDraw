<template>
    <div>
        <div v-if="isMobile">
            <MobileHomePage />
        </div>
        <div v-else>
            <DesktopHomePage />
        </div>
    </div>
</template>
<script setup>
import helper from '@/helper'
import backendApi from '@/api/backend.js'
import { onMounted } from 'vue'

const isMobile = helper.isMobile()

onMounted(() => {

    // if(!localStorage.getItem('apiToken') || localStorage.getItem('apiToken') === 'undefined' || localStorage.getItem('apiToken') === '') {

        backendApi.post('/guest-user')
            .then(response => {
                if (response) {
                    localStorage.setItem('apiToken', response.data.token);
                }
            })
    // }
})
</script>
