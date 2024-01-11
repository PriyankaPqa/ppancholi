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
            {{ $t(firstError, metaMessage) }}
          </v-col>
        </v-row>
        <v-col class="col pl-16" cols="12">
          <div
            v-if="isDuplicateError && isCrcRegistration"
            class="rc-body14 pt-6 pb-2">
            <div class="mt-2 mb-6">
              {{ $t('registration.confirmation.error.use.search.household') }}
            </div>
            <v-btn
              color="primary"
              data-test="confirmation-errorRegistration-beneficiarySearchButton"
              @click="$emit('search-household')">
              {{ $t('registration.confirmation.error.search.household.button') }}
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
import Vue, { VueConstructor } from 'vue';
import VueI18n from 'vue-i18n';
import _isEmpty from 'lodash/isEmpty';
import helpers from '@libs/shared-lib/helpers/helpers';
import { IServerError } from '@libs/shared-lib/types';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IRegistrationMenuItem } from '@libs/registration-lib/types';
import { IMultilingual } from '@libs/shared-lib/src/types';

type TranslateResult = VueI18n.TranslateResult;

const vueComponent: VueConstructor = Vue.extend({
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
      const code = errors?.[0].code;
      return code || (this.isDuplicateError ? 'errors.this-individual-already-exists-in-the-system' : '');
    },

    isDuplicateError(): boolean {
      return this.$registrationStore.isDuplicateError();
    },

    errorMessage(): TranslateResult {
      if (this.firstError === 'errors.cannotcompletetier2') {
        return this.$t('errors.cannotcompletetier2.details');
      }
      return this.isDuplicateError ? this.$t('registration.confirmation.error.message.duplicate') : this.$t('registration.confirmation.error');
    },

    metaMessage(): Record<string, string> {
      const errors = (this.errors as IServerError)?.response?.data?.errors;
      const errorMeta = errors?.[0]?.meta;

      if (errorMeta && !_isEmpty(errorMeta)) {
        const key = Object.keys(errorMeta)[0];
        let value = errorMeta[key];
        if (typeof value === 'object') {
          value = this.$m(value as IMultilingual);
        }
        return { [helpers.capitalize(key)]: value };
      }
      return null;
    },
  },

  created() {
    this.setTabWithError();
  },

  methods: {
    setTabWithError() {
      this.$registrationStore.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.nextButtonTextKey = 'common.cancel';
        tab.titleKey = this.firstError === 'errors.cannotcompletetier2' ? 'errors.cannotcompletetier2.title' : 'registration.confirmation.error';
        tab.isValid = false;
      });
    },
  },
});

export default vueComponent;

</script>
