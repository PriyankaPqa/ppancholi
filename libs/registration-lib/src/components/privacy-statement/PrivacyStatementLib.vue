<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div v-if="consentStatement" class="rc-body14 consent">
      <div v-html="sanitizeHtml(getStatementWithLinksText($m(consentStatement.statement)))" />
    </div>
    <div
      v-else
      class="rc-body14 consent"
      data-test="content-text"
      v-html="sanitizeHtml(getStatementWithLinksText($t('registration.privacy_consent_formatted')))" />
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
import DOMPurify from 'dompurify';
import { VCheckboxWithValidation } from '@libs/component-lib/components';
import { utcToZonedTime, format } from 'date-fns-tz';
import { IConsentStatement } from '@libs/entities-lib/tenantSettings';

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
    return { sanitizeHtml: DOMPurify.sanitize };
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
  },

  methods: {
    getStatementWithLinksText(statement:string): string {
      return statement.replaceAll(
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
  text-align: justify;

  ul > li {
    list-style-type: disc;
  }
}
</style>
