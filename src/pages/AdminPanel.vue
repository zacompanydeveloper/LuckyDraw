<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <div class="min-h-screen bg-contain bg-x-repeat bg-y-no-repeat"
                :style="{ backgroundImage: `url(${bgImage})` }">
                <!-- Header -->
                <header class="w-full flex justify-center items-center shadow-xl py-5">
                    <img src="@/assets/svg/logo.svg" alt="logo" class="w-60" />
                </header>

                <!-- Main -->
                <main class="px-[5%] mt-10">
                    <Breadcrumb :home="home" :model="items">
                        <template #item="{ item, props }">
                            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                                <a :href="href" v-bind="props.action" @click="navigate">
                                    <span :class="[item.icon, 'text-color']" />
                                    <span class="text-primary font-semibold">{{ item.label }}</span>
                                </a>
                            </router-link>
                            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                                <span class="text-surface-700 dark:text-surface-0 text-[#2E3192]">{{ item.label
                                    }}</span>
                            </a>
                        </template>
                    </Breadcrumb>
                    <!-- <h1 class="text-2xl font-bold text-[#2E3192]">Pre-Print Code</h1> -->
                    <div class="flex justify-between items-center mt-2">
                        -
                        <Button type="button" iconPos="right" label="Create" @click="openDialog('right')"
                            class="cursor-pointer hover:opacity-90 w-35" style="background-color: #2E3192;" />
                    </div>

                    <!-- Table -->
                    <div class="card mt-5 mb-10">
                        <DataTable :value="products" scrollable scrollHeight="550px" tableStyle="min-width: 50rem">
                            <Column field="name" header="Name" />
                            <Column field="quantity" header="Quantity" />
                            <Column field="created_at" header="Created Date" />
                            <Column field="created_by" header="Created By" />
                            <Column class="w-24 !text-end" header="Action" :headerStyle="{ textAlign: 'right' }">
                                <template #body="{ data }">
                                    <div class="flex justify-end items-center gap-2">
                                        <Button v-tooltip.top="'Details'" icon="pi pi-search"
                                            @click="goToDetails(data.id)" severity="info" rounded />
                                        <Button v-tooltip.top="'Download'" icon="pi pi-download"
                                            @click="downloadFile(data)" severity="success" rounded />
                                        <Button v-tooltip.top="'Generate'" icon="pi pi-cog"
                                            @click="handleAction('generate', data)" severity="danger" rounded />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>

                        <Toast />

                        <!-- Dialog -->
                        <Dialog v-model:visible="dialog.visible" header="Pre-Print Code Create"
                            :style="{ width: '25rem' }" :position="dialog.position" :modal="true" :draggable="false">
                            <div class="flex flex-col justify-between h-full">
                                <!-- Form -->
                                <div class="mb-10">
                                    <div class="flex flex-col gap-2 mb-4">
                                        <label for="name" class="w-24">Name</label>
                                        <InputText id="name" v-model="form.name" class="flex-auto" autocomplete="off"
                                            placeholder="Name" />
                                    </div>
                                    <div class="flex flex-col gap-2 mb-4">
                                        <label for="description" class="w-24">Description</label>
                                        <InputText id="description" v-model="form.description" class="flex-auto"
                                            autocomplete="off" placeholder="Description" />
                                    </div>
                                    <div class="flex flex-col gap-2 mb-2">
                                        <label for="quantity" class="w-24">Quantity</label>
                                        <InputText class="w-full" type="text" id="quantity" v-model="form.quantity"
                                            v-keyfilter.num autocomplete="off" placeholder="0" />
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="flex justify-end gap-2">
                                    <Button v-if="isFormValid" type="button" iconPos="right" label="Create"
                                        :loading="loading.create" :disabled="!isFormValid"
                                        class="cursor-pointer hover:opacity-90 w-35" @click="createProduct"
                                        style="background-color: #2E3192;" />
                                </div>
                            </div>
                        </Dialog>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import { useToast } from "primevue/usetoast"
import helper from "@/helper"
import NotFound from "@/views/NotFound.vue"
import bgImage from "@/assets/svg/bg.svg"
import backend from "@/api/backend"
import router from "@/router"

const isMobile = helper.isMobile()
const toast = useToast()

/** State */
const products = ref([])
const form = reactive({
    name: "",
    description: "",
    quantity: null,
    type: "lucky_draw",
})
const loading = reactive({
    table: false,
    create: false,
})
const dialog = reactive({
    visible: false,
    position: "center",
})

const home = ref({
    icon: 'pi pi-home',
    route: '/'
});
const items = ref([
    { label: 'Pre-Print' },
]);

/** Computed */
const isFormValid = computed(() => {
    return form.name && form.quantity > 0
})

/** Methods */
const fetchProducts = async () => {
    try {
        loading.table = true
        const { data, status } = await backend.get("/preprint-products")
        if (status === 200) {
            products.value = data.data
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.table = false
    }
}

const createProduct = async () => {
    try {
        loading.create = true
        const { status } = await backend.post("/preprint-products", { ...form })
        if (status === 201) {
            toast.add({
                severity: "success",
                summary: "Product Created",
                detail: "Product created successfully!",
                life: 5000,
            })
            resetForm()
            dialog.visible = false
            fetchProducts()
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.create = false
    }
}

const downloadFile = async (product) => {
    try {
        const { data, status } = await backend.get(`/preprint-products/${product.id}/download`)
        if (status === 200) {
            const url = data.url
            window.open(url)
        }
    } catch (error) {
        console.error('Download failed:', error)
    }
}

const goToDetails = (productId) => {
    router.push(`/admin-panel/products/${productId}`)
}


const handleAction = (action, product) => {
    toast.add({
        severity: "info",
        summary: `${action} triggered`,
        detail: `Code: ${product.code} | Name: ${product.name}`,
        life: 3000,
    })
}

const openDialog = (pos = "center") => {
    dialog.position = pos
    dialog.visible = true
}

const resetForm = () => {
    form.name = ""
    form.description = ""
    form.quantity = null
    form.type = "lucky_draw"
}

/** Lifecycle */
onMounted(fetchProducts)
</script>
