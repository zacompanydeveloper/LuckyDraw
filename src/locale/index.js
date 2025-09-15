import { app } from '@/app_root.js'
import { createI18n } from 'vue-i18n'

import en from './en.json'
import mm from './mm.json'

const i18n = createI18n({
  locale: 'mm',
  fallbackLocale: 'mm',
  messages: {
    en,
    mm,
  },
})

app.use(i18n)
