import { app } from '@/app_root'

import MobileHomePage from './mobile/Home.vue'
import DesktopHomePage from './desktop/Home.vue'
import MobileLuckyDrawPage from './mobile/LuckyDraw.vue'
import DesktopLuckyDrawPage from './desktop/LuckyDraw.vue'

app.component('MobileHomePage', MobileHomePage)
app.component('DesktopHomePage', DesktopHomePage)
app.component('MobileLuckyDrawPage', MobileLuckyDrawPage)
app.component('DesktopLuckyDrawPage', DesktopLuckyDrawPage)
