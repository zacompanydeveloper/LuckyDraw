import { app } from '@/app_root';
import MobileLayout from './MobileLayout.vue';
import DesktopLayout from './DesktopLayout.vue';

app.component('MobileLayout', MobileLayout);
app.component('DesktopLayout', DesktopLayout);