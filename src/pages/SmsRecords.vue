<template>
    <div>
        <!-- Mobile view -->
        <NotFound v-if="isMobile" />
        <!-- Desktop view -->
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
                </div>
            </DesktopLayout>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped></style>
