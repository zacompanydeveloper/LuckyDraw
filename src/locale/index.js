import { app } from '@/app_root.js'
import { createI18n } from 'vue-i18n'

import en from './en.json'
import mm from './mm.json'

const savedLocale = localStorage.getItem('locale') || 'mm'

const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'mm',
  messages: {
    en,
    mm,
  },
})

app.use(i18n)
