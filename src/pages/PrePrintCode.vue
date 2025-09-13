<template>
    <div>
        <div v-if="isMobile">
            <NotFound />
        </div>
        <div v-else>
            <DesktopLayout>
                <!-- Page Content -->
                <h2 class="text-2xl font-bold text-[#2E3192]">Pre-Print Code</h2>
                <div class="flex justify-between items-center mt-2">
                    <!-- filters -->
                    <div class="flex gap-3">
                        <FloatLabel variant="on">
                            <DatePicker v-model="fromDate" dateFormat="dd-mm-yy" inputId="from_date" showIcon
                                iconDisplay="input" />
                            <label for="from_date">From Date</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <DatePicker v-model="toDate" dateFormat="dd-mm-yy" inputId="to_date" showIcon
                                iconDisplay="input" />
                            <label for="to_date">To Date</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <InputText id="search" v-model="search" autocomplete="off" />
                            <label for="search">Search</label>
                        </FloatLabel>
                        <Button @click="searchProduct" type="button" icon="pi pi-filter" iconPos="left" label="Search"
                            severity="success" raised class="cursor-pointer  w-35" />
                        <Button @click="clearFilters" type="button" icon="pi pi-refresh" iconPos="left" raised
                            style="color: #2E3192;" class="cursor-pointer" variant="outlined" />
                    </div>
                    <Button type="button" iconPos="right" label="Create" @click="openDialog('right')"
                        class="cursor-pointer hover:opacity-90 w-35" style="background-color: #2E3192;" />
                </div>

                <!-- Table -->
                <div class="card mt-5 mb-10">
                    <DataTable :value="products" scrollable scrollHeight="550px" tableStyle="min-width: 50rem"
                        :loading="loading.table">
                        <Column header="#" headerStyle="width:3rem">
                            <template #body="slotProps">
                                {{ slotProps.index + 1 }}
                            </template>
                        </Column>
                        <Column field="name" header="Name" />
                        <Column field="quantity" header="Quantity" />
                        <Column field="created_at" header="Created Date" />
                        <Column field="created_by" header="Created By" />
                        <Column class="w-24 !text-end" header="Action" :headerStyle="{ textAlign: 'right' }">
                            <template #body="{ data }">
                                <div class="flex justify-end items-center gap-2">
                                    <Button v-tooltip.top="'Details'" icon="pi pi-search" @click="goToDetails(data.id)"
                                        severity="info" rounded />
                                    <Button v-tooltip.top="'Download'" icon="pi pi-download" @click="downloadFile(data)"
                                        severity="success" rounded />
                                    <!-- <Button v-tooltip.top="'Generate'" icon="pi pi-cog"
                                        @click="handleAction('generate', data)" severity="danger" rounded /> -->
                                </div>
                            </template>
                        </Column>
                    </DataTable>

                    <Toast />

                    <!-- Dialog -->
                    <Dialog v-model:visible="dialog.visible" header="Pre-Print Code Create" :style="{ width: '25rem' }"
                        :position="dialog.position" :modal="true" :draggable="false">
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
                                    <!-- 35000 max -->
                                    <InputText class="w-full" type="text" id="quantity" v-model="form.quantity"
                                        maxlength="5" v-keyfilter.num autocomplete="off" placeholder="0" />
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex justify-end gap-2">
                                <Button type="button" iconPos="right" label="Create" :loading="loading.create"
                                    :disabled="!isFormValid || loading.create"
                                    class="cursor-pointer hover:opacity-90 w-35" @click="createProduct"
                                    style="background-color: #2E3192;" />
                            </div>
                        </div>
                    </Dialog>
                </div>
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import DesktopLayout from "@/layouts/DesktopLayout.vue"
import { useToast } from "primevue/usetoast"
import helper from "@/helper"
import NotFound from "@/views/NotFound.vue"
import backend from "@/api/backend"
import router from "@/router"

const isMobile = helper.isMobile()
const toast = useToast()

const fromDate = ref(null)
const toDate = ref(null)
const search = ref("")

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

/** Computed */
const isFormValid = computed(() => {
    return form.name && form.quantity > 0 && form.quantity <= 35000
})

/** Methods */
const fetchProducts = async () => {
    try {
        loading.table = true
        const { data, status } = await backend.get("/preprint-products",
            {
                from_date: fromDate.value || null,
                to_date: toDate.value || null,
                search: search.value || null,
            }
        )
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
            const link = document.createElement('a')
            link.href = url
            link.download = ''
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    } catch (error) {
        console.error('Download failed:', error)
    }
}

const goToDetails = (productId) => {
    router.push(`/admin-panel/products/${productId}`)
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

const clearFilters = () => {
    fromDate.value = null
    toDate.value = null
    search.value = ""
    fetchProducts()
}

const searchProduct = () => {
    console.log('Searching products with filters:', {
        from_date: fromDate.value,
        to_date: toDate.value,
        search: search.value,
    })
    fetchProducts()
}

/** Lifecycle */
onMounted(fetchProducts)
</script>
