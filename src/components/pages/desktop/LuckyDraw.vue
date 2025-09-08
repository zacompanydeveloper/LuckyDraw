<template>
  <div class="min-h-screen bg-contain bg-x-repeat" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- Header -->
    <header class="w-full flex justify-center items-center shadow-xl py-[20px]">
      <img src="@/assets/svg/logo.svg" alt="logo" class="w-60" />
    </header>

    <main class="h-[calc(100vh-80px)] max-w-md mx-auto">
      <div v-if="!loading.details" class="h-full">
        <!-- Registration open -->
        <div v-if="registrationOpen && !alreadyRegistered">
          <!-- Countdown Section -->
          <section class="text-center mt-6">
            <p class="text-[#ED1C24] font-semibold">Registration Link will expire in</p>
            <div class="flex justify-center items-center gap-2 mt-4 text-[#2C2C2C]">
              <template v-for="(time, index) in countdown" :key="index">
                <div class="w-11 h-12 flex items-center justify-center 
                         bg-gradient-to-r from-white to-[#CAD6F4]
                         border border-[#2E3192] rounded-lg text-xl">
                  {{ time }}
                </div>
                <span v-if="index < countdown.length - 1" class="text-2xl"> : </span>
              </template>
            </div>
          </section>

          <!-- Registration Form -->
          <section class="mt-8">
            <h2 class="text-2xl text-center font-bold text-[#2E3192] mb-4">
              Registration for Lucky Draw
            </h2>
            <div class="px-[4%] mx-auto grid grid-cols-1 gap-4">
              <InputText id="numkeys" v-model="form.phone" v-keyfilter.num placeholder="Phone Number" size="large"
                autocomplete="off" />
              <InputText v-model="form.name" placeholder="Name" fluid size="large" autocomplete="off" />
              <Nrc @update:fullnrc="nrc => form.nrc = nrc" />
              <Select v-model="form.township" :options="townships" optionLabel="township" placeholder="Township"
                size="large" showClear :loading="loading.township">
                <template #dropdownicon>
                  <i class="pi pi-sort-down-fill" style="color: #2E3192; font-size: small;"></i>
                </template>
              </Select>
              <AutoComplete v-if="form.business_type === 'business'" fluid size="large" v-model="form.shop" optionLabel="name" :suggestions="shops"
                @complete="debouncedSearchShop" forceSelection placeholder="Search shop..." />
              <Button type="button" iconPos="right" label="Register" :loading="loading.register" :style="{ cursor: isFormValid ? 'pointer' : 'not-allowed' }"
                :disabled="!isFormValid" @click.prevent="register" size="large" style="background-color: #2E3192;" />
            </div>
          </section>
        </div>

        <!-- Already registered -->
        <div v-else-if="alreadyRegistered" class="h-full flex items-center justify-center">
          <StatusCard type="success" title="Registration Successfully!" message="Thank you for joining our lucky draw!"
            :image="successImg" />
        </div>

        <!-- Link expired -->
        <div v-else class="h-full flex items-center justify-center">
          <StatusCard type="error" title="Link Expired!" message="Sorry, this link has expired or is no longer valid."
            :image="expiredImg" contact="Please contact Sweety Home Call Service" phone="09 900000001" />
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="h-full flex items-center justify-center">
        <Loading />
      </div>
    </main>

    <Toast />
  </div>
</template>

<script setup>
import bgImage from '@/assets/svg/bg.svg'
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import backend from '@/api/backend'
import StatusCard from '@/components/StatusCard.vue' // New extracted component
import successImg from '@/assets/svg/success.svg'
import expiredImg from '@/assets/svg/link-expired.svg'
import { useToast } from "primevue/usetoast";
// Router params
const { signature, tracking_code } = useRoute().params

// State
const toast = useToast();
const shops = ref([])
const townships = ref([])
const registrationOpen = ref(false)
const alreadyRegistered = ref(false)
const countdown = ref(['00', '00', '00'])

const loading = reactive({
  township: false,
  register: false,
  details: false
})

const form = reactive({
  phone: '',
  name: '',
  nrc: '',
  tracking_code: '',
  township: null,
  shop: null,
  business_type: null
})

// Utilities
const resetForm = () => {
  Object.assign(form, {
    phone: '',
    name: '',
    nrc: '',
    tracking_code: form.tracking_code, // keep tracking code
    township: null,
    shop: null,
    business_type: form.business_type
  })
}

const isFormValid = computed(() => {
  return form.phone && form.name && form.nrc && form.township && (!form.business_type || (form.business_type === 'business' ? form.shop : true));
})


// Countdown helpers
let countdownTimer = null

const formatCountdown = (expire) => {
  const remaining = expire - Math.floor(Date.now() / 1000)
  if (remaining <= 0) return ['00', '00', '00']

  const hours = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const seconds = String(remaining % 60).padStart(2, '0')

  return [hours, minutes, seconds]
}

const startCountdown = (expire) => {
  countdown.value = formatCountdown(expire)
  if (countdownTimer) clearInterval(countdownTimer)

  countdownTimer = setInterval(() => {
    countdown.value = formatCountdown(expire)
    if (countdown.value.join('') === '000000') {
      clearInterval(countdownTimer)
      countdownTimer = null
      registrationOpen.value = false
    }
  }, 1000)
}

// API calls
const fetchTownships = async () => {
  loading.township = true
  try {
    const { data } = await backend.get('register-townships')
    townships.value = data.data
  } finally {
    loading.township = false
  }
}

const register = async () => {
  loading.register = true
  try {
    const { data } = await backend.post('register-lucky-draw', form)
    if (data.success) {
      alreadyRegistered.value = true
      resetForm()
    }
  } catch (err) {
    console.error('Registration failed:', err)
    toast.add({ severity: 'error', summary: 'Registration Failed', detail: err.response?.data?.message || 'An error occurred during registration.', life: 5000 });
  } finally {
    loading.register = false
  }
}

const getLuckyDrawDetails = async () => {
  loading.details = true
  try {
    const res = await backend.get(`lucky-draw/${signature}/${tracking_code}`)
    const { data } = res.data

    if (res.status === 202) {
      alreadyRegistered.value = true
      registrationOpen.value = false
    } else if (res.status === 200) {
      registrationOpen.value = data.is_active
      form.tracking_code = data.tracking_code
      form.business_type = data.business_type
      startCountdown(data.expire)
    }
    loading.details = false
  } catch (err) {
    console.error('Failed to fetch Lucky Draw details:', err)
    const status = err.response?.status
    if (status === 500) {
      toast.add({ severity: 'error', summary: 'Error Message', detail: 'Server Error!', life: 5000, closable: false });
      return;
    } else {
      toast.add({ severity: 'error', summary: 'Error Message', detail: err.response?.data?.message || 'An error occurred', life: 5000, closable: false });
    }
    loading.details = false
    registrationOpen.value = false
  }
}

// Debounced shop search
let debounceTimeout = null
const searchShop = (event) => {
  if (!event.query || event.query.length < 2) {
    shops.value = []
    return
  }
  backend.get('shops', { search: event.query })
    .then(res => { shops.value = res.data.data })
    .catch(err => console.error('Failed to fetch shops:', err))
}
const debouncedSearchShop = (event) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => searchShop(event), 500)
}

// Cleanup
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

// Init
onMounted(() => {
  fetchTownships()
  getLuckyDrawDetails()
})
</script>

<style scoped></style>
