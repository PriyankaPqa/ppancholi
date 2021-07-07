<template>
  <div class="grey-container pa-8">
    <v-row class="flex-row full-width ma-0 pa-0">
      <v-icon size="48" color="secondary" class="pr-4 align-self-start">
        mdi-alert-outline
      </v-icon>
      <v-row class="row full-width rc-body14 pt-2" no-gutters>
        <v-col v-if="firstError" cols="12" class="rc-body18 fw-bold" data-test="confirmation-errorRegistration-errorTitle">
          {{ $t(firstError.code) }}
        </v-col>
        <v-col class="col" cols="12">
          <div class="mt-7" data-test="confirmation-errorRegistration-errorMessage">
            <span style="white-space: pre-line" class="rc-body14">
              {{ errorMessage }}
            </span>
          </div>

          <div class="mt-5">
            {{ $t('registration.confirmation.error.assistance') }}
          </div>

          <div class="fw-bold rc-body18">
            {{ phone }}
          </div>

          <div class="rc-body18 mt-6 pb-2">
            {{ `${$t('registration.confirmation.error.thank_you')}!` }}
          </div>
        </v-col>
      </v-row>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IError } from '@/services/httpClient';
import VueI18n from 'vue-i18n';

type TranslateResult = VueI18n.TranslateResult;

export default Vue.extend({
  name: 'ConfirmationError',

  props: {
    errors: {
      type: Array as () => IError[],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      keysForDuplicateErrors: [
        'errors.the-beneficiary-have-duplicate-first-name-last-name-birthdate',
        'errors.the-beneficiary-have-duplicate-first-name-last-name-phone-number',
        'errors.the-household-have-duplicate-first-name-last-name-birthdate',
        'errors.the-email-provided-already-exists-in-the-system',
        'errors.person-identified-as-duplicate',
      ],
    };
  },

  computed: {
    firstError(): IError {
      return this.errors[0];
    },

    isDuplicateError(): boolean {
      if (Array.isArray(this.errors)) {
        return this.errors.some((e) => this.keysForDuplicateErrors.includes(e.code));
      }
      return false;
    },

    errorMessage(): TranslateResult {
      return this.isDuplicateError ? this.$t('registration.confirmation.error.message.duplicate') : this.$t('registration.confirmation.error');
    },
  },
});
</script>
