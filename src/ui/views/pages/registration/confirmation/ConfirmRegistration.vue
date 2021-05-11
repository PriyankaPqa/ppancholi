<template>
  <div class="fixed-height pb-12">
    <template v-if="success">
      <div class="fixed-height mb-n8">
        <v-row no-gutters>
          <v-col cols="12" class="rc-body16 mb-3" data-test="confirm-registration-message">
            {{ confirmationMessage }}
          </v-col>

          <v-col cols="12" sm="6" class="grey-container pt-6 pl-6">
            <span class="rc-body12">{{ $t('event.beneficiaries.registration_number') }}</span>
            <br>
            <span class="registration-result" data-test="confirm-registration-number">{{ registrationNumber }}</span>
          </v-col>
          <v-col cols="12" sm="6" class="grey-container pa-6">
            <span class="rc-body12">{{ $t('registration.confirmation.event') }}</span>
            <br>
            <span class="registration-result" data-test="confirm-registration-event-name">{{ $m(event.name) }}</span>
          </v-col>

          <v-col cols="12" class="rc-body14 mt-3">
            <i18n path="registration.confirmation.additional_assistance" tag="div">
              <template #phone>
                <span class="fw-bold" data-test="confirm-registration-phoneAssistance">{{ phoneAssistance }}</span>
              </template>
            </i18n>
          </v-col>
        </v-row>
      </div>

      <!-- TODO -->
      <!-- <v-icon>mdi-information</v-icon>
      <span class="rc-body14 ml-2">{{ $t('registration.confirmation.email_sent') }}</span> -->
    </template>
    <div v-else>
      <confirmation-error :errors="errors" :phone="phoneAssistance" />
    </div>
  </div>
</template>

<script lang="ts">
import { ICreateBeneficiaryResponse } from '@crctech/registration-lib/src/entities/beneficiary';
import { IEventData } from '@crctech/registration-lib/src/entities/event';
import { TranslateResult } from 'vue-i18n';
import Vue from 'vue';
import { IError } from '@/services/httpClient';
import ConfirmationError from '@/ui/views/pages/registration/confirmation/ConfirmationError.vue';
import { IRegistrationMenuItem } from '@crctech/registration-lib/src/types';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: { ConfirmationError },
  computed: {
    success(): boolean {
      return this.errors?.length === 0;
    },

    response(): ICreateBeneficiaryResponse {
      return this.$storage.registration.getters.registrationResponse();
    },

    errors(): IError[] {
      return this.$storage.registration.getters.registrationErrors();
    },

    event(): IEventData {
      return this.$storage.registration.getters.event();
    },

    confirmationMessage(): TranslateResult {
      if (this.response) {
        const fullName = `${this.response.person.firstName} ${this.response.person.middleName} ${this.response.person.lastName}`;
        return this.$t('registration.confirmation.thank_you', { x: fullName });
      }
      return '';
    },

    registrationNumber(): string {
      return this.response?.registrationNumber;
    },

    phoneAssistance(): string {
      return this.event.responseDetails?.assistanceNumber;
    },
  },

  watch: {
    success: {
      immediate: true,
      handler(success) {
        if (!success) {
          this.setTabWithError();
        }
      },
    },
  },
  methods: {
    setTabWithError() {
      this.$storage.registration.mutations.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.nextButtonTextKey = 'common.cancel';
        tab.titleKey = 'registration.confirmation.error';
        tab.isValid = false;
      });
    },
  },
});
</script>

<style scoped lang="scss">
.fixed-height {
  height: 100%;
}
.registration-result {
  font-size: 24px;
  font-weight: 500;
}
</style>
