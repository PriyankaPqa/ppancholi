<template>
  <div class="grey-container pa-8">
    <v-row class="flex-row full-width ma-0 pa-0">
      <v-row class="row full-width rc-body14 pt-2" no-gutters>
        <v-row>
          <div>
            <v-icon size="48" color="secondary" class="pr-4 align-self-start">
              mdi-alert-outline
            </v-icon>
          </div>
          <v-col v-if="firstError" cols="8" class="rc-body18 fw-bold" data-test="confirmation-errorRegistration-errorTitle">
            {{ $t(firstError) }}
          </v-col>
        </v-row>
        <v-col class="col pl-16" cols="12">
          <div
            v-if="isDuplicateError && isCrcRegistration"
            class="rc-body14 pt-6 pb-2">
            <div class="mt-2 mb-6">
              {{ $hasFeature(FeatureKeys.ReplaceBeneficiaryTerm)
                ? $t('registration.confirmation.error.use.search.household')
                : $t('registration.confirmation.error.use.search') }}
            </div>
            <v-btn
              color="primary"
              data-test="confirmation-errorRegistration-beneficiarySearchButton"
              @click="$emit('search-household')">
              {{ $hasFeature(FeatureKeys.ReplaceBeneficiaryTerm)
                ? $t('registration.confirmation.error.search.household.button') : $t('registration.confirmation.error.search.button') }}
            </v-btn>
          </div>
          <template v-else>
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
          </template>

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
import VueI18n from 'vue-i18n';
import { IServerError } from '@libs/shared-lib/types';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

type TranslateResult = VueI18n.TranslateResult;

export default Vue.extend({
  name: 'ConfirmationError',

  props: {
    errors: {
      type: Object as () => IServerError,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    isCrcRegistration: {
      type: Boolean,
      required: false,
    },
  },

  data() {
    return {
      FeatureKeys,
    };
  },

  computed: {
    firstError(): string {
      const errors = (this.errors as IServerError)?.response?.data?.errors;
      return errors?.[0].code || (this.isDuplicateError ? 'errors.person-identified-as-duplicate' : '');
    },

    isDuplicateError(): boolean {
      return this.$registrationStore.isDuplicateError();
    },

    errorMessage(): TranslateResult {
      const duplicateErrorMessage = this.$hasFeature(FeatureKeys.ReplaceBeneficiaryTerm)
        ? this.$t('registration.confirmation.error.message.duplicate.household') : this.$t('registration.confirmation.error.message.duplicate');

      return this.isDuplicateError ? duplicateErrorMessage : this.$t('registration.confirmation.error');
    },
  },
});
</script>
