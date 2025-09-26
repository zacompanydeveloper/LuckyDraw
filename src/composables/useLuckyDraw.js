import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import backend from '@/api/backend'

export function useLuckyDraw() {
    const toast = useToast()
    const virtualPrizes = ref([])
    const virtualCustomers = ref([])

    const fetchPrizes = async () => {
        try {
            const response = await backend.get('/lucky-draw-prizes', { params: { withoutPaginate: true } })
            const prizesData = response.data?.data
            if (Array.isArray(prizesData) && prizesData.length) {
                virtualPrizes.value = prizesData.map(p => ({
                    hash_id: p.id,
                    name: p.name,
                    image: p.image?.url
                }))
            } else {
                toast.add({ severity: 'warn', summary: 'No Prizes', detail: 'No prizes available', life: 5000 })
            }
        } catch (err) {
            console.error('Error fetching prizes:', err)
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch prizes', life: 5000 })
        }
    }

    const fetchCustomers = async () => {
        try {
            const response = await backend.get('/lucky-draw-tickets/customers', { params: { withoutPaginate: true } })
            const customersData = response.data?.data
            if (Array.isArray(customersData) && customersData.length) {
                virtualCustomers.value = customersData.map(c => ({
                    hash_id: c.id,
                    name: c.customer_name
                }))
            } else {
                toast.add({ severity: 'warn', summary: 'No Customers', detail: 'No customers available', life: 5000 })
            }
        } catch (err) {
            console.error('Error fetching customers:', err)
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch customers', life: 5000 })
        }
    }

    const shufflePrize = async () => {
        try {
            const res = await backend.get('/lucky-draw-prizes/shuffle-prize')
            return res.data?.data ?? null
        } catch (err) {
            console.error('Failed to fetch real prize', err)
            return null
        }
    }

    const shuffleCustomer = async () => {
        try {
            const res = await backend.get('/lucky-draw-tickets/shuffle-customer')
            return {
                hash_id: res.data?.data?.id ?? null,
                name: res.data?.data?.customer_name ?? null
            }
        } catch (err) {
            console.error('Failed to fetch real customer', err)
            return { hash_id: null, name: null }
        }
    }

    return {
        virtualPrizes,
        virtualCustomers,
        fetchPrizes,
        fetchCustomers,
        shufflePrize,
        shuffleCustomer
    }
}