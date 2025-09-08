import { app } from '@/app_root.js'
import { createI18n } from 'vue-i18n'

import en from './en.json'
import my from './my.json'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    my,
  },
})

app.use(i18n)
