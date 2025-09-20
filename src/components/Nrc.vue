<template>
    <div class="flex gap-y-4 gap-1">
        <!-- State Number (primitive value) -->
        <Select class="min-w-[55px]" v-model="selectedRegion" :options="stateOptions" optionLabel="label"
            optionValue="value" placeholder="State">
            <template #dropdownicon>
                <i class="pi pi-sort-down-fill" style="color: #2E3192; font-size: small;"></i>
            </template>
        </Select>

        <!-- District Code (primitive value) -->
        <Select class="min-w-[90px]" v-model="selectedDistrictCode" :options="districtOptions"
            optionLabel="label" optionValue="value" placeholder="District">
            <template #dropdownicon>
                <i class="pi pi-sort-down-fill" style="color: #2E3192; font-size: small;"></i>
            </template>
        </Select>

        <!-- NRC Type (primitive value) -->
        <Select class="min-w-[65px]" v-model="selectedType" :options="typeOptions" optionLabel="label"
            optionValue="value" placeholder="Type">
            <template #dropdownicon style="display: no;">
                <i class="pi pi-sort-down-fill" style="color: #2E3192; font-size: 10px;"></i>
            </template>
        </Select>

        <!-- NRC Number (InputNumber) -->
        <InputText class="w-full" type="text" id="numkeys" v-model="nrcNumber" minlength="6" maxlength="6"
            v-keyfilter.num autocomplete="off" placeholder="၁၂၃၄၅၆" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import nrcData from '@/dummys/nrc.json'

/* emit */
const emit = defineEmits(['update:fullnrc'])

/* source data */
const regions = nrcData.regions            // e.g. { "1": "someRegionKey", ... }
const allDistricts = nrcData.district.mm  // object keyed by regionName -> districts
const stateNumbers = nrcData.state.mm     // e.g. ["၁", "၂", ...]
const nrcTypes = nrcData.type             // e.g. { mm: ["နိုင်", "ဧ"] }

/* --- v-model primitives --- */
const selectedRegion = ref('1')      // will hold the option.value (string)
const selectedDistrictCode = ref(allDistricts[regions[selectedRegion.value]]?.[0] || '') // will hold district code string
const selectedType = ref(nrcTypes.mm?.[0] || '') // primitive string
const nrcNumber = ref('')            // InputNumber may set number or string

/* template-ready options (primitives via optionValue="value") */
const stateOptions = computed(() =>
    stateNumbers.map((num, index) => ({ value: (index + 1).toString(), label: num }))
)

const typeOptions = computed(() =>
    (nrcTypes.mm || []).map((t) => ({ value: t, label: t }))
)

/* default district options (will be replaced when region changes) */
const districtOptions = ref(
    [
        "ကတန", "ကမတ", "ကမန", "ခတဒ", "ခဘဒ", "ဆဒန", "တနန", "နမန", "ပကတ", "ပညန",
        "ပတအ", "ပဘတ", "ဗမန", "မကက", "မကတ", "မကထ", "မကန", "မကရ", "မခဘ", "မဂဒ",
        "မစန", "မညန", "မထန", "မဘန", "မဘပ", "မမန", "မအန", "ရကန", "ရနက", "လခန",
        "လဂန", "လမန", "ဝမန", "သတန", "ဟခန", "ဟပန", "အခက", "အဂယ", "အပန", "ဥမန"
    ].map(code => ({ value: code, label: code }))
)

/* When region changes, map districts for that region */
watch(selectedRegion, (newVal) => {
    const regionKey = String(newVal)
    const regionName = regions?.[regionKey]    // follow original shape: regions['1'] => regionName key
    districtOptions.value = regionName
        ? Object.values(allDistricts[regionName] || {}).map(code => ({ value: code, label: code }))
        : []
    selectedDistrictCode.value = districtOptions.value[0]?.value || ''
})

/* Helper: convert nrcNumber to string safely (number or string) */
function nrcToString(val) {
    if (val === null || val === undefined) return ''
    // If PrimeVue InputNumber uses grouping or returns number -> coerce
    return String(val)
}

/* computed fullNRC (works with InputNumber returning number or string) */
const fullNRC = computed(() => {
    const digits = nrcToString(nrcNumber.value)
    if (
        selectedRegion.value &&
        selectedDistrictCode.value &&
        selectedType.value &&
        digits.length === 6
    ) {
        // get state display string from stateNumbers using index, fallback to selectedRegion
        const index = parseInt(selectedRegion.value, 10) - 1
        const stateNo = stateNumbers?.[index] ?? selectedRegion.value
        return `${stateNo}/${selectedDistrictCode.value}(${selectedType.value})${digits}`
    }
    return ''
})

/* watch for debug + emit */
watch(fullNRC, (newVal) => {
    if (newVal) emit('update:fullnrc', newVal)
}, { immediate: true })

</script>

<style scoped>
:deep(.p-dropdown-trigger),
:deep(.p-select-trigger),
:deep(.p-select-dropdown) {
    display: none !important;
}
</style>

