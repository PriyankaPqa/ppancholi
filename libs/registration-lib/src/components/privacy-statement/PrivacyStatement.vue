<template>
  <div>
    <p class="rc-body14">
      {{ $t('registration.privacy_statement.p1') }}
    </p>
    <i18n path="registration.privacy_statement.p2" tag="p" class="rc-body14">
      <template #website>
        <a :href="$t('registration.privacy_statement.website')" target="_blank">{{ $t('registration.privacy_statement.website') }}</a>
      </template>
      <template #email>
        <a href="mailto:privacy@redcross.ca">{{ $t('registration.privacy_statement.email') }}</a>
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
import { VCheckboxWithValidation } from '@crctech/component-library';

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
        return this.$store.state.registration.isPrivacyAgreed;
      },
      set(checked: boolean) {
        this.$storage.registration.mutations.setIsPrivacyAgreed(checked);
        this.$storage.registration.mutations.setDateTimeConsent(checked ? moment.utc(moment()).format() : null);
      },
    },
  },
});
</script>
