<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :aria-label="$t('aria.header.language_select', { currentLanguage: currentLanguage })"
        text
        data-test="appHeader__changeLanguage"
        v-on="on">
        {{ locale }}
      </v-btn>
    </template>

    <v-list data-test="appHeader__languageMenu">
      <v-list-item
        v-for="(lang, $index) in locales"
        :key="$index"
        :aria-label="lang.label"
        :data-test="`appHeader__changeLanguage--${lang.value}`"
        :disabled="lang.disabled"
        @click="setLanguage(lang.value)">
        <v-list-item-title>{{ lang.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import { Trans } from '@/ui/plugins';

export default Vue.extend({
  name: 'LanguageSelector',

  computed: {
    locale(): string {
      return this.$i18n.locale;
    },
    currentLanguage(): string {
      const currentLocale = this.locales.find((l) => l.value === this.locale);
      if (currentLocale) {
        return currentLocale.label as string;
      }
      return '';
    },

    tenantLanguages(): Array<string> {
      const currentTenantSettings = this.$storage.tenantSettings.getters.currentTenantSettings();
      return currentTenantSettings?.availableLanguages;
    },
    /**
     * Get the list of available locales from the Translation plugin and use them
     * to populate the list of options in the menu
     */
    locales(): Array<Record<string, unknown>> {
      const locales: Array<Record<string, unknown>> = [];

      let supportedLanguages = Trans.supportedLanguages;

      const labels: Record<string, string> = {
        fr: 'Français',
        en: 'English',
        test: 'Test',
      };

      if (this.tenantLanguages && this.tenantLanguages.length > 0) {
        supportedLanguages = this.tenantLanguages;
      }

      supportedLanguages.forEach((language) => {
        locales.push({
          label: labels[language],
          value: language,
          disabled: language === Trans.currentLanguage,
        });
      });

      return locales;
    },
  },

  methods: {
    /**
     * Change the language when the user clicks on an option in the language menu
     * Calls the changeLanguage function in the Translation plugin
     * and then routes to the current view and changes the lang parameter in the url
     * @param lang The language to change, ie 'en', 'fr', 'test'
     */
    setLanguage(lang: string) {
      Trans.changeLanguage(lang).then(() => {
        this.$router.replace({
          name: this.$route.name,
          params: {
            ...this.$route.params,
            lang,
          },
        });
      });
    },
  },
});
</script>
