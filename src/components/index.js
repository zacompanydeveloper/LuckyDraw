import { app } from '@/app_root.js'

import CheckedWarrantyBox from './CheckedWarrantyBox.vue'
import WarrantyBox from './WarrantyBox.vue'
import SlideVerify from './SlideVerify.vue'
import Loading from './Loading.vue'
import Nrc from './Nrc.vue'

app.component('CheckedWarrantyBox', CheckedWarrantyBox)
app.component('WarrantyBox', WarrantyBox)
app.component('SlideVerify', SlideVerify)
app.component('Loading', Loading)
app.component('Nrc', Nrc)   