import { app } from '@/app_root.js'

import SlideVerify from './SlideVerify.vue'
import Loading from './Loading.vue'
import Nrc from './Nrc.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

app.component('SlideVerify', SlideVerify)
app.component('Loading', Loading)
app.component('Nrc', Nrc)
app.component('LanguageSwitcher', LanguageSwitcher)