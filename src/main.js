import './assets/main.css'
import '@/router'
import '@/stores'
import '@/primeVue'
import '@/locale'
import '@/components/pages'
import '@/layouts'
import '@/components'
import can from './directives/can.js';

import { app } from '@/app_root.js'

app.directive('can', can);

app.mount('#app')
