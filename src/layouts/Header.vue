<template>
    <!-- Header -->
    <header class="w-full flex justify-between items-center shadow-xl py-2 px-10">
        <div>
            <Drawer v-model:visible="visible" header="Lucky Draw App" :show-close-icon="false" class="rounded-e-lg"
                style="color: #2E3192;">
                <ul class="flex flex-col gap-1">
                    <li v-can="'view-dashboard'">
                        <router-link to="/admin-panel" active-class="font-semibold bg-[#2E3192]/10"
                            class="w-full block text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-home"></i>
                            Home
                        </router-link>
                    </li>

                    <li v-can="'view-registration'">
                        <router-link to="/admin-panel/code-registration" active-class="font-semibold bg-[#2E3192]/10"
                            class="w-full block text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-file-edit"></i>
                            Registration
                        </router-link>
                    </li>

                    <li v-can="'view-preprint'">
                        <router-link to="/admin-panel/pre-print-code" active-class="font-semibold bg-[#2E3192]/10"
                            class="w-full block text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-print"></i>
                            Pre-Print Code
                        </router-link>
                    </li>

                    <li v-can="'view-sms'">
                        <router-link to="/" active-class="font-semibold bg-[#2E3192]/10"
                            class="w-full block text-[#2E3192] hover:bg-[#2E3192]/10 px-3 py-2 rounded-md transition-colors">
                            <i class="pi pi-envelope"></i>
                            SMS Records
                        </router-link>
                    </li>
                </ul>
                <template #footer>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 text-[#2E3192]">
                            <i class="pi pi-user border rounded-full p-1"></i>
                            <span>{{ name }}</span>
                        </div>
                        <Button label="Logout" icon="pi pi-sign-out" severity="danger" text @click="logout" />
                    </div>
                </template>
            </Drawer>
            <i class="pi pi-bars text-2xl text-[#2E3192] cursor-pointer" @click="visible = true"></i>
        </div>

        <div class="flex items-center gap-2">
            <img src="@/assets/svg/logo.svg" alt="logo" class="w-50" />
            <span> | </span>
            <div class="font-bold text-[#2E3192]">Lucky Draw App</div>
        </div>
    </header>
</template>

<script setup>
import { ref } from "vue";
import router from "@/router";

const visible = ref(false);
const name = "Admin";

const logout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("role")
    localStorage.removeItem("userPermissions")
    router.push("/admin-login")
}

</script>
