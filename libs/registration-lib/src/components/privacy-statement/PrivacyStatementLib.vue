<template>
  <div>
    <i18n path="registration.privacy_consent" tag="p" class="rc-body14 consent">
      <template #website>
        <a :href="$t('registration.privacy_statement.website')" target="_blank" rel="noopener noreferrer">{{ $t('registration.privacy_statement.website') }}</a>
      </template>
      <template #email>
        <a :href="`mailto:${$t('registration.privacy_statement.email')}`">{{ $t('registration.privacy_statement.email') }}</a>
      </template>
    </i18n>
    <div class="full-width grey-container py-1 px-5">
      <v-checkbox-with-validation
        v-model="isPrivacyAgreed"
        :rules="rules.isPrivacyAgreed"
        data-test="isPrivacyAgreed"
        :label="checkboxLabel" />
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@libs/component-lib/components';
import moment from 'moment';

export default Vue.extend({
  name: 'PrivacyStatement',

  components: {
    VCheckboxWithValidation,
  },

  props: {
    checkboxLabel: {
      type: String,
      required: true,
    },
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        isPrivacyAgreed: {
          required: {
            allowFalse: false,
          },
        },
      };
    },

    isPrivacyAgreed: {
      get(): boolean {
        return this.$registrationStore.isPrivacyAgreed;
      },
      set(checked: boolean) {
        this.$registrationStore.isPrivacyAgreed = checked;
        this.$registrationStore.householdCreate.consentInformation.privacyDateTimeConsent = checked ? moment.utc(moment()).format() : null;
      },
    },
  },
});
</script>

<style lang="scss">
.consent {
  white-space: pre-line;
  text-align: justify
}
</style>
