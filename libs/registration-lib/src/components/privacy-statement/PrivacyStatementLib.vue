<template>
  <div>
    <div v-if="consentStatement" class="rc-body14 consent">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="activeStatementText" />
    </div>
    <i18n v-else-if="$hasFeature(FeatureKeys.UpdateRegistrationConsent)" path="registration.privacy_consent_updated" tag="p" class="rc-body14 consent" data-test="content-text">
      <template #website>
        <a :href="$t('registration.privacy_statement.website')" target="_blank" rel="noopener noreferrer">{{ $t('registration.privacy_statement.website') }}</a>
      </template>
      <template #email>
        <a :href="`mailto:${$t('registration.privacy_statement.email')}`">{{ $t('registration.privacy_statement.email') }}</a>
      </template>
    </i18n>
    <i18n v-else path="registration.privacy_consent" tag="p" class="rc-body14 consent" data-test="content-text">
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
import { utcToZonedTime, format } from 'date-fns-tz';
import { IConsentStatement, FeatureKeys } from '@libs/entities-lib/tenantSettings';

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
    consentStatement: {
      type: Object as () => IConsentStatement,
      default: null,
    },
  },

  data() {
    return { FeatureKeys };
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
        this.$registrationStore.householdCreate.consentInformation.privacyDateTimeConsent = checked
          ? format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss'Z'", { timeZone: 'UTC' })
          : null;
      },
    },
    activeStatementText(): string {
      return this.$m(this.consentStatement.statement).replaceAll(
        '{website}',
        `<a href="${this.$t('registration.privacy_statement.website')}" target="_blank" rel="noopener noreferrer">${
          this.$t('registration.privacy_statement.website')}</a>`,
      )?.replaceAll(
        '{email}',
        `<a href="mailto:${this.$t('registration.privacy_statement.email')}">${
          this.$t('registration.privacy_statement.email')}</a>`,
      );
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
