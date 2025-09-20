<template>
  <div class="flex items-center gap-2">
    <i class="text-2xl cursor-pointer opacity-50 hover:opacity-100 transition-all" v-html="selectedLanguageIcon" @click="toggleLanguageMenu"></i>
    <Menu ref="languageMenu" :model="languageMenuItems" :popup="true" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const languageMenu = ref(null);

const languages = [
  { name: "English", code: "en", icon: "🇬🇧" },
  { name: "မြန်မာ", code: "mm", icon: "🇲🇲" },
];

const selectedLanguage = ref(localStorage.getItem("locale") || locale.value || "mm");

const selectedLanguageLabel = computed(() => {
  return languages.find((l) => l.code === selectedLanguage.value)?.name || "မြန်မာ";
});

const selectedLanguageIcon = computed(() => {
  return languages.find((l) => l.code === selectedLanguage.value)?.icon || "🇲🇲";
});

const languageMenuItems = computed(() =>
  languages.map((lang) => ({
    label: `${lang.icon} ${lang.name}`,
    command: () => changeLanguage(lang.code),
  }))
);

const toggleLanguageMenu = (event) => {
  languageMenu.value.toggle(event);
};

const changeLanguage = (langCode) => {
  selectedLanguage.value = langCode;
  locale.value = langCode; // optional if using vue-i18n
  localStorage.setItem("locale", langCode);
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
