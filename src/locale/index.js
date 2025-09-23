import { app } from '@/app_root.js'
import { createI18n } from 'vue-i18n'

import en from './en.json'
import mm from './mm.json'

const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    mm,
  },
})

app.use(i18n)
