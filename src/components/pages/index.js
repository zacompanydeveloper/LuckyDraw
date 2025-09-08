import { app } from '@/app_root'

import MobileHomePage from './mobile/Home.vue'
import DesktopHomePage from './desktop/Home.vue'
import MobileActivatePage from './mobile/Activate.vue'
import DesktopActivatePage from './desktop/Activate.vue'
import MobileCheckPage from './mobile/Check.vue'
import DesktopCheckPage from './desktop/Check.vue'
import MobileEWarrantyTempUrlPage from './mobile/EwarrantyTempUrl.vue'
import DesktopEWarrantyTempUrlPage from './desktop/EwarrantyTempUrl.vue'
import MobileLuckyDrawPage from './mobile/LuckyDraw.vue'
import DesktopLuckyDrawPage from './desktop/LuckyDraw.vue'

app.component('MobileHomePage', MobileHomePage)
app.component('DesktopHomePage', DesktopHomePage)
app.component('MobileActivatePage', MobileActivatePage)
app.component('DesktopActivatePage', DesktopActivatePage)
app.component('MobileCheckPage', MobileCheckPage)
app.component('DesktopCheckPage', DesktopCheckPage)
app.component('MobileEWarrantyTempUrlPage', MobileEWarrantyTempUrlPage)
app.component('DesktopEWarrantyTempUrlPage', DesktopEWarrantyTempUrlPage)
app.component('MobileLuckyDrawPage', MobileLuckyDrawPage)
app.component('DesktopLuckyDrawPage', DesktopLuckyDrawPage)
