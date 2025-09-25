<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <DesktopLayout>
                <div class="p-4 mx-auto max-w-2xl ">
                    <h1 class="text-3xl text-center font-bold text-[#2E3192] my-10">Lucky Draw Dashboard</h1>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white text-[#2E3192] rounded-lg shadow-md p-6 px-8 border border-gray-200">
                            <div class="flex items-center justify-between gap-2 mb-4">
                                    <i class="pi pi-file-edit" style="font-size: 30px"></i>
                                    <h2 class="text-3xl">10</h2>
                            </div>
                            <p>{{ $t('lucky_draw_ticket') }}</p>
                        </div>
                        <div class="bg-white text-[#2E3192] rounded-lg shadow-md p-6 px-8 border border-gray-200">
                            <div class="flex items-center justify-between gap-2 mb-4">
                                    <i class="pi pi-print" style="font-size: 30px"></i>
                                    <h2 class="text-3xl">5K</h2>
                            </div>
                            <p>{{ $t('pre_print_code') }}</p>
                        </div>
                        <div class="bg-white text-[#2E3192] rounded-lg shadow-md p-6 px-8 border border-gray-200">
                            <div class="flex items-center justify-between gap-2 mb-4">
                                    <i class="pi pi-envelope" style="font-size: 30px"></i>
                                    <h2 class="text-3xl">20K</h2>
                            </div>
                            <p>{{ $t('sms_records') }}</p>
                        </div>
                        <div class="bg-white text-[#2E3192] rounded-lg shadow-md p-6 px-8 border border-gray-200">
                            <div class="flex items-center justify-between gap-2 mb-4">
                                    <i class="pi pi-trophy" style="font-size: 30px"></i>
                                    <h2 class="text-3xl">8K</h2>
                            </div>
                            <p>{{ $t('prizes') }}</p>
                        </div>
                    </div>
                </div>
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import NotFound from "@/views/NotFound.vue"
import DesktopLayout from "@/layouts/DesktopLayout.vue"
import helper from "@/helper"
const isMobile = helper.isMobile()
</script>
