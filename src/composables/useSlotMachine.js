import { ref, nextTick } from 'vue'

const ITEM_HEIGHT = 150
const ANIMATION_BASE_DURATION = 6000

export function useSlotMachine() {
    const slots = ref([['---'], ['---']])
    const slotRefs = ref([null, null])
    const processing = ref(false)
    const selectedCustomer = ref(null)
    const selectedPrize = ref(null)

    function setSlotRef(index, el) {
        slotRefs.value[index] = el
    }

    function cancelSlotAnimations(slotEl) {
        if (!slotEl) return
        try {
            const anims = slotEl.getAnimations ? slotEl.getAnimations() : []
            anims.forEach(a => a.cancel())
            slotEl.style.transform = 'translateY(0)'
        } catch (e) {
            console.error('Error canceling animations:', e)
        }
    }

    async function animateSlot(slotIndex, items) {
        slots.value[slotIndex] = items
        await nextTick()

        const slotEl = slotRefs.value[slotIndex]
        if (!slotEl) return null

        cancelSlotAnimations(slotEl)
        const totalHeight = (items.length * ITEM_HEIGHT) - ITEM_HEIGHT

        return slotEl.animate(
            [
                { transform: 'translateY(0)' },
                { transform: `translateY(-${totalHeight}px)` }
            ],
            {
                duration: ANIMATION_BASE_DURATION,
                fill: 'forwards',
                easing: 'ease-out'
            }
        )
    }

    function updateSlotWithResult(slotIndex, result) {
        if (result) {
            slots.value[slotIndex].splice(-1, 1, result)
        }
    }

    function reset() {
        slots.value = [['---'], ['---']]
        selectedCustomer.value = null
        selectedPrize.value = null
        slotRefs.value.forEach(slotEl => cancelSlotAnimations(slotEl))
    }

    return {
        ITEM_HEIGHT,
        ANIMATION_BASE_DURATION,
        slots,
        slotRefs,
        processing,
        selectedCustomer,
        selectedPrize,
        setSlotRef,
        animateSlot,
        updateSlotWithResult,
        reset
    }
}