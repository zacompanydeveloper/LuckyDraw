import { app } from '@/app_root.js'
import { createPinia } from 'pinia'

const pinia = createPinia()

app.use(pinia)
