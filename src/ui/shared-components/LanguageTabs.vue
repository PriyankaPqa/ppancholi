<template>
  <rc-tabs>
    <rc-tab
      v-for="lang in supportedLanguages"
      :key="lang.key"
      :label="$t(`tab.${lang.key}`)"
      :data-test="`eventCreate__lang-${lang.key}`"
      :active="language === lang.key"
      @click="$emit('click',lang.key)" />
  </rc-tabs>
</template>

<script>
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { RcTab, RcTabs } from '@crctech/component-library';

export default {
  name: 'LanguageTabs',
  components: {
    RcTab,
    RcTabs,
  },
  props: {
    language: {
      type: String,
      required: true,
    },
  },
  computed: {
    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },
  },
};
</script>

<style scoped>

</style>
